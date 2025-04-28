import { getSupabaseClient, getServerSupabaseClient } from "./supabase-client"

export type JournalEntry = {
  id: string
  user_id: string
  trade_id: string | null
  title: string
  content: any // JSONB content from rich text editor
  mood: "confident" | "anxious" | "frustrated" | "calm" | "excited" | "neutral"
  lessons_learned: string | null
  confidence_score: number | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type JournalEntryInput = Omit<JournalEntry, "id" | "user_id" | "created_at" | "updated_at">

export type JournalEntryFilter = {
  title?: string
  trade_id?: string
  mood?: JournalEntry["mood"]
  tags?: string[]
  startDate?: string
  endDate?: string
}

export type SortField = "created_at" | "updated_at" | "title"
export type SortDirection = "asc" | "desc"

// Client-side functions
export const createJournalEntry = async (entry: JournalEntryInput): Promise<JournalEntry | null> => {
  try {
    // Ensure tags is always an array or null
    const safeEntry = {
      ...entry,
      tags: entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 ? entry.tags : null,
    }

    const response = await fetch("/api/admin/journal/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(safeEntry),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return null
  }
}

export const getJournalEntries = async (
  page = 1,
  pageSize = 10,
  sortField: SortField = "created_at",
  sortDirection: SortDirection = "desc",
  filters?: JournalEntryFilter,
): Promise<{ entries: JournalEntry[]; count: number }> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return { entries: [], count: 0 }

  let query = supabase.from("journal_entries").select("*", { count: "exact" }).eq("user_id", user.user.id)

  // Apply filters
  if (filters) {
    if (filters.title) {
      query = query.ilike("title", `%${filters.title}%`)
    }
    if (filters.trade_id) {
      query = query.eq("trade_id", filters.trade_id)
    }
    if (filters.mood) {
      query = query.eq("mood", filters.mood)
    }
    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags)
    }
  }

  // Apply sorting and pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query.order(sortField, { ascending: sortDirection === "asc" }).range(from, to)

  if (error) {
    console.error("Error fetching journal entries:", error)
    return { entries: [], count: 0 }
  }

  return { entries: data as JournalEntry[], count: count || 0 }
}

export const getJournalEntry = async (id: string): Promise<JournalEntry | null> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return null

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.user.id)
    .single()

  if (error) {
    console.error("Error fetching journal entry:", error)
    return null
  }

  return data as JournalEntry
}

export const updateJournalEntry = async (
  id: string,
  entry: Partial<JournalEntryInput>,
): Promise<JournalEntry | null> => {
  try {
    const response = await fetch(`/api/admin/journal/entries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return null
  }
}

export const deleteJournalEntry = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/admin/journal/entries/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return false
  }
}

// Server-side functions
export const getJournalEntriesByUserId = async (userId: string): Promise<JournalEntry[]> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("journal_entries").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching journal entries by user ID:", error)
    return []
  }

  return data as JournalEntry[]
}

export const getJournalEntryByIdServer = async (id: string, userId: string): Promise<JournalEntry | null> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("journal_entries").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching journal entry by ID:", error)
    return null
  }

  return data as JournalEntry
}

export const getJournalEntriesByTradeId = async (tradeId: string, userId: string): Promise<JournalEntry[]> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("trade_id", tradeId)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching journal entries by trade ID:", error)
    return []
  }

  return data as JournalEntry[]
}
