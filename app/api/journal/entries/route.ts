import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { rateLimiter } from "@/lib/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimiter(10, "5m")
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const tradeId = searchParams.get("trade_id")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

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

    // Create a Supabase client using the server-side helper
    const cookieStore = cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting session:", sessionError)
      return NextResponse.json({ error: "Authentication error: " + sessionError.message }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Authentication required. Please log in." }, { status: 401 })
    }

    const userId = session.user.id

    // Now use the userId directly for the query
    let query = supabase
      .from("journal_entries")
      .select(`
        *,
        trade:trade_id (
          id,
          symbol,
          entry_date
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters if provided
    if (tradeId) {
      query = query.eq("trade_id", tradeId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`)
    }

    const { data: entries, error } = await query

    if (error) {
      console.error("Error fetching journal entries:", error)
      return NextResponse.json({ error: "Failed to fetch journal entries: " + error.message }, { status: 500 })
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("journal_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .maybeSingle()

    if (countError) {
      console.error("Error counting journal entries:", countError)
    }

    return NextResponse.json({
      entries,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Unexpected error in GET /api/journal/entries:", error)
    return NextResponse.json({ error: "Internal server error: " + (error as Error).message }, { status: 500 })
  }
}
