import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-client"
import { rateLimiter } from "@/lib/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimiter(10, "5m")
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const journalEntryId = searchParams.get("journalEntryId")

    if (!journalEntryId) {
      return NextResponse.json({ error: "Missing journal entry ID" }, { status: 400 })
    }

    const supabase = createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if journal entry exists and belongs to user
    const { data: journalEntry, error: journalError } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("id", journalEntryId)
      .eq("user_id", session.user.id)
      .single()

    if (journalError || !journalEntry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    // Get media for journal entry
    const { data: media, error: mediaError } = await supabase
      .from("journal_media")
      .select("*")
      .eq("journal_entry_id", journalEntryId)

    if (mediaError) {
      console.error("Error fetching journal media:", mediaError)
      return NextResponse.json({ error: "Failed to fetch journal media" }, { status: 500 })
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error("Unexpected error in GET /api/journal/media:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
