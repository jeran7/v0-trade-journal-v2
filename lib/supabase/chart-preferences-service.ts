import { getSupabaseClient } from "./supabase-client"
import type { Timeframe } from "./price-data-service"

export interface ChartPreference {
  id?: string
  user_id: string
  name: string
  symbol?: string
  timeframe?: Timeframe
  chart_type?: "candlestick" | "bar" | "line" | "area"
  indicators?: any[]
  drawings?: any[]
  layout?: any
  created_at?: string
  updated_at?: string
}

// Save chart preferences
export async function saveChartPreference(preference: ChartPreference): Promise<ChartPreference | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("chart_preferences")
    .upsert(
      {
        ...preference,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single()

  if (error) {
    console.error("Error saving chart preference:", error)
    return null
  }

  return data as ChartPreference
}

// Get chart preferences for a user
export async function getUserChartPreferences(userId: string): Promise<ChartPreference[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("chart_preferences")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching chart preferences:", error)
    return []
  }

  return data as ChartPreference[]
}

// Get a specific chart preference
export async function getChartPreference(id: string): Promise<ChartPreference | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("chart_preferences").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching chart preference:", error)
    return null
  }

  return data as ChartPreference
}

// Delete a chart preference
export async function deleteChartPreference(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("chart_preferences").delete().eq("id", id)

  if (error) {
    console.error("Error deleting chart preference:", error)
    return false
  }

  return true
}

// Get default chart preference for a symbol and timeframe
export async function getDefaultChartPreference(
  userId: string,
  symbol: string,
  timeframe: Timeframe,
): Promise<ChartPreference | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("chart_preferences")
    .select("*")
    .eq("user_id", userId)
    .eq("symbol", symbol)
    .eq("timeframe", timeframe)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // If no preference exists, return null (not an error)
    if (error.code === "PGRST116") {
      return null
    }

    console.error("Error fetching default chart preference:", error)
    return null
  }

  return data as ChartPreference
}
