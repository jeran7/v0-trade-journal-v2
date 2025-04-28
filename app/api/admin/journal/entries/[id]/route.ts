import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-client"
import { rateLimiter } from "@/lib/rate-limiter"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if entry exists and belongs to user
    const { data: existingEntry, error: checkError } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !existingEntry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.mood) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update journal entry
    const { data: entry, error } = await supabase
      .from("journal_entries")
      .update({
        title: body.title,
        trade_id: body.trade_id || null,
        content: body.content,
        mood: body.mood,
        lessons_learned: body.lessons_learned || null,
        confidence_score: body.confidence_score || null,
        tags: body.tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating journal entry:", error)
      return NextResponse.json({ error: "Failed to update journal entry" }, { status: 500 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Unexpected error in PUT /api/admin/journal/entries/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if entry exists and belongs to user
    const { data: existingEntry, error: checkError } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !existingEntry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    // Delete journal entry (cascade will handle media deletion)
    const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting journal entry:", error)
      return NextResponse.json({ error: "Failed to delete journal entry" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error in DELETE /api/admin/journal/entries/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
