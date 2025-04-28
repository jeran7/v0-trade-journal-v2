import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase admin client with the service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()

    if (!body.user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    }

    console.log("Creating trade with admin privileges:", body)

    // Insert the trade using the admin client to bypass RLS
    const { data: trade, error } = await supabaseAdmin.from("trades").insert(body).select().single()

    if (error) {
      console.error("Admin API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trade })
  } catch (error) {
    console.error("Error in admin trades API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
