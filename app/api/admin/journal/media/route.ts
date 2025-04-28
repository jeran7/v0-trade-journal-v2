import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-client"
import { rateLimiter } from "@/lib/rate-limiter"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimiter(10, "5m")
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const journalEntryId = formData.get("journalEntryId") as string
    const mediaType = formData.get("mediaType") as string

    if (!file || !journalEntryId || !mediaType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Validate media type
    const validMediaTypes = ["image", "video", "audio", "document"]
    if (!validMediaTypes.includes(mediaType)) {
      return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
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

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("journal-media")
      .upload(`${session.user.id}/${journalEntryId}/${fileName}`, file)

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("journal-media")
      .getPublicUrl(`${session.user.id}/${journalEntryId}/${fileName}`)

    const mediaUrl = publicUrlData.publicUrl

    // Create journal media record
    const { data: media, error: mediaError } = await supabase
      .from("journal_media")
      .insert({
        journal_entry_id: journalEntryId,
        media_url: mediaUrl,
        media_type: mediaType,
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single()

    if (mediaError) {
      console.error("Error creating journal media record:", mediaError)
      return NextResponse.json({ error: "Failed to create media record" }, { status: 500 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/journal/media:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
