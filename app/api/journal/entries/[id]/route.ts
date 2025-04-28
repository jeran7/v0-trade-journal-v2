import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-client"
import { rateLimiter } from "@/lib/rate-limiter"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimiter(10, "5m")
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const id = params.id
    const supabase = createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch journal entry
    const { data: entry, error } = await supabase
      .from("journal_entries")
      .select(`
        *,
        trade:trade_id (
          id,
          symbol,
          entry_date,
          exit_date,
          profit_loss,
          direction
        )
      `)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      console.error("Error fetching journal entry:", error)
      return NextResponse.json({ error: "Failed to fetch journal entry" }, { status: 500 })
    }

    if (!entry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    // Fetch media for this entry
    const { data: media, error: mediaError } = await supabase
      .from("journal_media")
      .select("*")
      .eq("journal_entry_id", id)

    if (mediaError) {
      console.error("Error fetching journal media:", mediaError)
    }

    return NextResponse.json({
      entry,
      media: media || [],
    })
  } catch (error) {
    console.error("Unexpected error in GET /api/journal/entries/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
