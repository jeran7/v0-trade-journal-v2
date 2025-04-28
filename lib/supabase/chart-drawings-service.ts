import { getSupabaseClient } from "./supabase-client"
import type { Timeframe } from "./price-data-service"

export interface ChartDrawing {
  id?: string
  user_id: string
  symbol: string
  timeframe: Timeframe
  drawing_type: string
  drawing_data: any
  is_public: boolean
  created_at?: string
  updated_at?: string
}

// Save a chart drawing
export async function saveChartDrawing(drawing: ChartDrawing): Promise<ChartDrawing | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("chart_drawings")
    .upsert(
      {
        ...drawing,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single()

  if (error) {
    console.error("Error saving chart drawing:", error)
    return null
  }

  return data as ChartDrawing
}

// Get drawings for a symbol and timeframe
export async function getChartDrawings(symbol: string, timeframe: Timeframe, userId?: string): Promise<ChartDrawing[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from("chart_drawings").select("*").eq("symbol", symbol).eq("timeframe", timeframe)

  // If userId is provided, get user's private drawings and all public drawings
  if (userId) {
    query = query.or(`user_id.eq.${userId},is_public.eq.true`)
  } else {
    // Otherwise, only get public drawings
    query = query.eq("is_public", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching chart drawings:", error)
    return []
  }

  return data as ChartDrawing[]
}

// Delete a chart drawing
export async function deleteChartDrawing(id: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("chart_drawings").delete().eq("id", id).eq("user_id", userId) // Ensure user can only delete their own drawings

  if (error) {
    console.error("Error deleting chart drawing:", error)
    return false
  }

  return true
}

// Update drawing visibility
export async function updateDrawingVisibility(id: string, userId: string, isPublic: boolean): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from("chart_drawings")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId) // Ensure user can only update their own drawings

  if (error) {
    console.error("Error updating drawing visibility:", error)
    return false
  }

  return true
}
