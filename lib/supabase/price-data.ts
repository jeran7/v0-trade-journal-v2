import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export interface PriceDataPoint {
  symbol: string
  timeframe: string
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function fetchPriceData(symbol: string, timeframe: string, from?: number, to?: number) {
  let query = supabase
    .from("price_data")
    .select("*")
    .eq("symbol", symbol)
    .eq("timeframe", timeframe)
    .order("time", { ascending: true })

  if (from) {
    query = query.gte("time", from)
  }

  if (to) {
    query = query.lte("time", to)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching price data:", error)
    return []
  }

  return data as PriceDataPoint[]
}

export async function savePriceData(dataPoints: PriceDataPoint[]) {
  const { data, error } = await supabase.from("price_data").upsert(dataPoints, { onConflict: "symbol,timeframe,time" })

  if (error) {
    console.error("Error saving price data:", error)
    return false
  }

  return true
}

export async function getAvailableSymbols() {
  const { data, error } = await supabase.from("price_data").select("symbol").distinct()

  if (error) {
    console.error("Error fetching available symbols:", error)
    return []
  }

  return data.map((item) => item.symbol)
}

export async function getAvailableTimeframes(symbol: string) {
  const { data, error } = await supabase.from("price_data").select("timeframe").eq("symbol", symbol).distinct()

  if (error) {
    console.error("Error fetching available timeframes:", error)
    return []
  }

  return data.map((item) => item.timeframe)
}
