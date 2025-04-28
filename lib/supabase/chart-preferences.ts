import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export interface ChartPreferences {
  id?: string
  user_id: string
  name: string
  symbol?: string
  timeframe: string
  chart_type: string
  indicators: any[]
  drawings: any[]
  created_at?: string
  updated_at?: string
}

export async function saveChartPreferences(preferences: ChartPreferences) {
  const { data, error } = await supabase.from("chart_preferences").upsert(
    {
      ...preferences,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )

  if (error) {
    console.error("Error saving chart preferences:", error)
    return null
  }

  return data
}

export async function getChartPreferences(userId: string) {
  const { data, error } = await supabase
    .from("chart_preferences")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching chart preferences:", error)
    return []
  }

  return data as ChartPreferences[]
}

export async function getChartPreferenceById(id: string) {
  const { data, error } = await supabase.from("chart_preferences").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching chart preference:", error)
    return null
  }

  return data as ChartPreferences
}

export async function deleteChartPreference(id: string) {
  const { error } = await supabase.from("chart_preferences").delete().eq("id", id)

  if (error) {
    console.error("Error deleting chart preference:", error)
    return false
  }

  return true
}
