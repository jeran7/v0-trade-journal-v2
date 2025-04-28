import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { rateLimiter } from "@/lib/rate-limiter"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimiter(10, "5m")
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Ensure we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing required environment variables for Supabase client")
      return NextResponse.json(
        { error: "Server configuration error. Missing required environment variables." },
        { status: 500 },
      )
    }

    // Create the Supabase client with explicit URL and key
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    // Get user session from cookies
    const authCookie = request.cookies.get("supabase-auth-token")?.value

    if (!authCookie) {
      console.error("No auth cookie found")
      return NextResponse.json({ error: "Authentication required. Please log in." }, { status: 401 })
    }

    try {
      // Parse the auth cookie
      const [, token] = JSON.parse(authCookie)

      if (!token) {
        console.error("Invalid auth token format")
        return NextResponse.json({ error: "Invalid authentication token. Please log in again." }, { status: 401 })
      }

      // Set the auth token manually
      const { data: userData, error: userError } = await supabase.auth.getUser(token)

      if (userError || !userData.user) {
        console.error("Error getting user from token:", userError)
        return NextResponse.json({ error: "Invalid or expired session. Please log in again." }, { status: 401 })
      }

      const userId = userData.user.id

      const body = await request.json()

      // Validate required fields
      if (!body.title || !body.content || !body.mood) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      // Create journal entry
      const { data: entry, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          title: body.title,
          trade_id: body.trade_id || null,
          content: body.content,
          mood: body.mood,
          lessons_learned: body.lessons_learned || null,
          confidence_score: body.confidence_score || null,
          tags: Array.isArray(body.tags) ? body.tags : [], // Ensure tags is always an array
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating journal entry:", error)
        return NextResponse.json({ error: "Failed to create journal entry: " + error.message }, { status: 500 })
      }

      return NextResponse.json(entry)
    } catch (parseError) {
      console.error("Error parsing auth cookie:", parseError)
      return NextResponse.json({ error: "Invalid authentication data. Please log in again." }, { status: 401 })
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/journal/entries:", error)
    return NextResponse.json({ error: "Internal server error: " + (error as Error).message }, { status: 500 })
  }
}
