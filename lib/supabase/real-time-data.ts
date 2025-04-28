import { createClient } from "@supabase/supabase-js"
import type { PriceDataPoint } from "./price-data"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

type RealtimeCallback = (data: PriceDataPoint) => void

export function subscribeToRealtimeUpdates(symbol: string, timeframe: string, callback: RealtimeCallback) {
  // Subscribe to real-time updates for a specific symbol and timeframe
  const channel = supabase
    .channel(`price_updates:${symbol}:${timeframe}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "price_data",
        filter: `symbol=eq.${symbol}&timeframe=eq.${timeframe}`,
      },
      (payload) => {
        callback(payload.new as PriceDataPoint)
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "price_data",
        filter: `symbol=eq.${symbol}&timeframe=eq.${timeframe}`,
      },
      (payload) => {
        callback(payload.new as PriceDataPoint)
      },
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

export async function getLatestPriceUpdate(symbol: string) {
  const { data, error } = await supabase
    .from("price_data")
    .select("*")
    .eq("symbol", symbol)
    .eq("timeframe", "1m")
    .order("time", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error fetching latest price update:", error)
    return null
  }

  return data as PriceDataPoint
}

export function getDataUpdateStatus(lastUpdateTime?: number) {
  if (!lastUpdateTime) return { status: "unknown", message: "No data available" }

  const now = Date.now()
  const diffMinutes = (now - lastUpdateTime) / (1000 * 60)

  if (diffMinutes < 1) {
    return { status: "live", message: "Live data" }
  } else if (diffMinutes < 5) {
    return { status: "recent", message: "Updated recently" }
  } else if (diffMinutes < 60) {
    return { status: "delayed", message: `Updated ${Math.floor(diffMinutes)} minutes ago` }
  } else {
    return { status: "stale", message: `Updated ${Math.floor(diffMinutes / 60)} hours ago` }
  }
}
