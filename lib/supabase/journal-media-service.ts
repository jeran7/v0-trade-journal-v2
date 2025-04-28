import { getSupabaseClient, getServerSupabaseClient } from "./supabase-client"

export type JournalMedia = {
  id: string
  journal_entry_id: string
  media_url: string
  media_type: "image" | "video" | "audio" | "document"
  file_name: string | null
  file_size: number | null
  created_at: string
}

export type JournalMediaInput = Omit<JournalMedia, "id" | "created_at">

// Client-side functions
export const uploadJournalMedia = async (
  file: File,
  journalEntryId: string,
  mediaType: JournalMedia["media_type"],
): Promise<JournalMedia | null> => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("journalEntryId", journalEntryId)
    formData.append("mediaType", mediaType)

    const response = await fetch("/api/admin/journal/media", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error uploading journal media:", error)
    return null
  }
}

export const getJournalMedia = async (journalEntryId: string): Promise<JournalMedia[]> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return []

  const { data, error } = await supabase.from("journal_media").select("*").eq("journal_entry_id", journalEntryId)

  if (error) {
    console.error("Error fetching journal media:", error)
    return []
  }

  return data as JournalMedia[]
}

export const deleteJournalMedia = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/admin/journal/media/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting journal media:", error)
    return false
  }
}

// Server-side functions
export const getJournalMediaByEntryIdServer = async (entryId: string): Promise<JournalMedia[]> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("journal_media").select("*").eq("journal_entry_id", entryId)

  if (error) {
    console.error("Error fetching journal media by entry ID:", error)
    return []
  }

  return data as JournalMedia[]
}
