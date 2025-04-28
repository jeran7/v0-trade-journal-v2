import { getServerSupabaseClient, getSupabaseClient } from "./supabase-client"

export type TradeScreenshot = {
  id: string
  trade_id: string
  screenshot_url: string
  screenshot_type: "entry" | "exit" | "analysis" | "other"
  created_at: string
}

export type TradeScreenshotInput = Omit<TradeScreenshot, "id" | "created_at">

// Client-side functions
export const addTradeScreenshot = async (screenshot: TradeScreenshotInput): Promise<TradeScreenshot | null> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("trade_screenshots").insert(screenshot).select().single()

  if (error) {
    console.error("Error adding trade screenshot:", error)
    return null
  }

  return data as TradeScreenshot
}

export const getTradeScreenshots = async (tradeId: string): Promise<TradeScreenshot[]> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("trade_screenshots").select("*").eq("trade_id", tradeId)

  if (error) {
    console.error("Error fetching trade screenshots:", error)
    return []
  }

  return data as TradeScreenshot[]
}

export const deleteTradeScreenshot = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("trade_screenshots").delete().eq("id", id)

  if (error) {
    console.error("Error deleting trade screenshot:", error)
    return false
  }

  return true
}

// Server-side functions
export const getTradeScreenshotsServer = async (tradeId: string): Promise<TradeScreenshot[]> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("trade_screenshots").select("*").eq("trade_id", tradeId)

  if (error) {
    console.error("Error fetching trade screenshots:", error)
    return []
  }

  return data as TradeScreenshot[]
}
