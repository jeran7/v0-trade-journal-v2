import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-client"
import { rateLimiter } from "@/lib/rate-limiter"

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

    // Get the media record to check ownership and get file path
    const { data: media, error: mediaError } = await supabase
      .from("journal_media")
      .select("*, journal_entries!inner(user_id)")
      .eq("id", id)
      .single()

    if (mediaError || !media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    // Check if the media belongs to the user
    if (media.journal_entries.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract file path from media URL
    const filePathMatch = media.media_url.match(/\/storage\/v1\/object\/public\/journal-media\/(.+)/)
    if (!filePathMatch) {
      console.error("Could not extract file path from URL:", media.media_url)
      return NextResponse.json({ error: "Invalid media URL format" }, { status: 500 })
    }

    const filePath = filePathMatch[1]

    // Delete file from storage
    const { error: deleteStorageError } = await supabase.storage.from("journal-media").remove([filePath])

    if (deleteStorageError) {
      console.error("Error deleting file from storage:", deleteStorageError)
      // Continue with deleting the record even if storage deletion fails
    }

    // Delete media record
    const { error: deleteRecordError } = await supabase.from("journal_media").delete().eq("id", id)

    if (deleteRecordError) {
      console.error("Error deleting media record:", deleteRecordError)
      return NextResponse.json({ error: "Failed to delete media record" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error in DELETE /api/admin/journal/media/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
