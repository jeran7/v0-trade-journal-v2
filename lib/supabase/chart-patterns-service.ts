import { getSupabaseClient } from "./supabase-client"
import type { Timeframe } from "./price-data-service"

export interface ChartPattern {
  id?: string
  name: string
  description?: string
  symbol: string
  timeframe: Timeframe
  pattern_data: any
  thumbnail_url?: string
  created_by?: string
  is_system: boolean
  created_at?: string
  updated_at?: string
}

// Save a chart pattern
export async function saveChartPattern(pattern: ChartPattern): Promise<ChartPattern | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("chart_patterns")
    .upsert(
      {
        ...pattern,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single()

  if (error) {
    console.error("Error saving chart pattern:", error)
    return null
  }

  return data as ChartPattern
}

// Get chart patterns
export async function getChartPatterns(symbol?: string, timeframe?: Timeframe): Promise<ChartPattern[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from("chart_patterns").select("*")

  if (symbol) {
    query = query.eq("symbol", symbol)
  }

  if (timeframe) {
    query = query.eq("timeframe", timeframe)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching chart patterns:", error)
    return []
  }

  return data as ChartPattern[]
}

// Get a specific chart pattern
export async function getChartPattern(id: string): Promise<ChartPattern | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("chart_patterns").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching chart pattern:", error)
    return null
  }

  return data as ChartPattern
}

// Delete a chart pattern
export async function deleteChartPattern(id: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from("chart_patterns")
    .delete()
    .eq("id", id)
    .eq("created_by", userId) // Ensure user can only delete their own patterns
    .eq("is_system", false) // Prevent deletion of system patterns

  if (error) {
    console.error("Error deleting chart pattern:", error)
    return false
  }

  return true
}

// Calculate similarity between current chart and pattern
export function calculatePatternSimilarity(chartData: any[], patternData: any[]): number {
  // This is a simplified implementation
  // In a real application, you would use more sophisticated algorithms

  if (!chartData.length || !patternData.length) return 0

  // Normalize both datasets to a 0-1 range for comparison
  const normalizeData = (data: any[]) => {
    const prices = data.map((d) => d.close)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min

    return data.map((d) => ({
      ...d,
      normalizedClose: (d.close - min) / range,
    }))
  }

  const normalizedChart = normalizeData(chartData)
  const normalizedPattern = normalizeData(patternData)

  // Sample both datasets to the same length for comparison
  const sampleSize = Math.min(normalizedChart.length, normalizedPattern.length)
  const sampleChart = normalizedChart.slice(-sampleSize)
  const samplePattern = normalizedPattern.slice(-sampleSize)

  // Calculate mean squared error
  let sumSquaredDiff = 0
  for (let i = 0; i < sampleSize; i++) {
    const diff = sampleChart[i].normalizedClose - samplePattern[i].normalizedClose
    sumSquaredDiff += diff * diff
  }

  const mse = sumSquaredDiff / sampleSize

  // Convert MSE to a similarity score (0-100)
  // Lower MSE means higher similarity
  const similarity = Math.max(0, 100 - mse * 100)

  return Math.round(similarity)
}
