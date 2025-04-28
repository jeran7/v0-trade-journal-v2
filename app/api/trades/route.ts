import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()

    // Get the auth cookie
    const cookieStore = cookies()
    const supabaseAuthCookie = cookieStore.get("sb-auth-token")?.value

    // If no auth cookie, try to get the session from the request headers
    if (!supabaseAuthCookie) {
      console.log("No auth cookie found, checking Authorization header")
    }

    // Create a regular Supabase client to get the user session
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: false,
      },
    })

    // Get the session from the cookie
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error" }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("Authenticated user ID:", userId)

    // Prepare the trade data
    const tradeData = {
      ...body,
      user_id: userId,
    }

    console.log("Creating trade with data:", tradeData)

    // Use the admin client to bypass RLS
    const { data: trade, error } = await supabaseAdmin.from("trades").insert(tradeData).select().single()

    if (error) {
      console.error("Error creating trade:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trade })
  } catch (error) {
    console.error("Error in POST /api/trades:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // Get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error" }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Unauthorized - No session found", trades: [], count: 0 }, { status: 401 })
    }

    const userId = session.user.id

    // Get query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
    const sortField = url.searchParams.get("sortField") || "entry_date"
    const sortDirection = url.searchParams.get("sortDirection") || "desc"

    // Calculate pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Use the admin client to bypass RLS
    let query = supabaseAdmin
      .from("trades")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sortField, { ascending: sortDirection === "asc" })
      .range(from, to)

    // Apply filters if provided
    const symbol = url.searchParams.get("symbol")
    if (symbol) {
      query = query.ilike("symbol", `%${symbol}%`)
    }

    const direction = url.searchParams.get("direction")
    if (direction) {
      query = query.eq("direction", direction)
    }

    const status = url.searchParams.get("status")
    if (status) {
      query = query.eq("status", status)
    }

    const startDate = url.searchParams.get("startDate")
    if (startDate) {
      query = query.gte("entry_date", startDate)
    }

    const endDate = url.searchParams.get("endDate")
    if (endDate) {
      query = query.lte("entry_date", endDate)
    }

    const setup = url.searchParams.get("setup")
    if (setup) {
      query = query.eq("setup", setup)
    }

    const tags = url.searchParams.get("tags")
    if (tags) {
      const tagsArray = tags.split(",")
      query = query.contains("tags", tagsArray)
    }

    const { data: trades, error, count } = await query

    if (error) {
      console.error("Error fetching trades:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trades, count })
  } catch (error) {
    console.error("Error in GET /api/trades:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
