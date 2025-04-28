import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase admin client with the service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()

    if (!body.trade_id || !body.user_id || !body.screenshot_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Creating screenshot with admin privileges:", body)

    // Insert the screenshot using the admin client to bypass RLS
    const { data: screenshot, error } = await supabaseAdmin
      .from("trade_screenshots")
      .insert({
        trade_id: body.trade_id,
        user_id: body.user_id,
        screenshot_url: body.screenshot_url,
        screenshot_type: body.screenshot_type || "other",
      })
      .select()
      .single()

    if (error) {
      console.error("Admin API error for screenshot:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ screenshot })
  } catch (error) {
    console.error("Error in admin screenshots API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
