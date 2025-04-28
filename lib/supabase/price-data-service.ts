import { getSupabaseClient, getServerSupabaseClient } from "./supabase-client"

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1D" | "1W"

export interface PriceDataPoint {
  symbol: string
  timeframe: Timeframe
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ChartPreference {
  id?: string
  user_id: string
  name: string
  symbol: string
  timeframe: Timeframe
  chart_type: string
  indicators: Record<string, any>
  drawings: Record<string, any>
  layout: Record<string, any>
}

export interface ChartDrawing {
  id?: string
  user_id: string
  symbol: string
  timeframe: Timeframe
  drawing_type: string
  drawing_data: Record<string, any>
  is_public: boolean
}

export interface ChartPattern {
  id?: string
  name: string
  description: string
  symbol: string
  timeframe: Timeframe
  pattern_data: Record<string, any>
  thumbnail_url: string
  created_by: string
  is_system: boolean
}

export interface IndicatorTemplate {
  id?: string
  user_id: string
  name: string
  indicator_type: string
  settings: Record<string, any>
  is_public: boolean
}

// Client-side cache to minimize database calls
const priceDataCache: Record<string, { data: PriceDataPoint[]; timestamp: number }> = {}
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

// Get price data for a symbol and timeframe
export async function getPriceData(
  symbol: string,
  timeframe: Timeframe,
  from?: number,
  to?: number,
  useCache = true,
): Promise<PriceDataPoint[]> {
  const cacheKey = `${symbol}-${timeframe}-${from || 0}-${to || 0}`

  // Check cache first if enabled
  if (useCache && priceDataCache[cacheKey] && Date.now() - priceDataCache[cacheKey].timestamp < CACHE_EXPIRY) {
    return priceDataCache[cacheKey].data
  }

  const supabase = getSupabaseClient()

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

  // Update cache
  priceDataCache[cacheKey] = {
    data: data as PriceDataPoint[],
    timestamp: Date.now(),
  }

  return data as PriceDataPoint[]
}

// Save price data (server-side only)
export async function savePriceData(dataPoints: PriceDataPoint[]): Promise<boolean> {
  const supabase = getServerSupabaseClient()

  const { error } = await supabase.from("price_data").upsert(dataPoints, { onConflict: "symbol,timeframe,time" })

  if (error) {
    console.error("Error saving price data:", error)
    return false
  }

  // Invalidate cache for affected symbols and timeframes
  const uniqueKeys = new Set<string>()
  dataPoints.forEach((point) => {
    uniqueKeys.add(`${point.symbol}-${point.timeframe}`)
  })

  // Clear affected cache entries
  Object.keys(priceDataCache).forEach((key) => {
    for (const uniqueKey of uniqueKeys) {
      if (key.startsWith(uniqueKey)) {
        delete priceDataCache[key]
      }
    }
  })

  return true
}

// Get available symbols
export async function getAvailableSymbols(): Promise<string[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("price_data").select("symbol").limit(1000)

  if (error) {
    console.error("Error fetching available symbols:", error)
    return []
  }

  // Extract unique symbols
  const symbols = new Set<string>()
  data.forEach((item) => symbols.add(item.symbol))

  return Array.from(symbols)
}

// Get available timeframes for a symbol
export async function getAvailableTimeframes(symbol: string): Promise<Timeframe[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("price_data").select("timeframe").eq("symbol", symbol).limit(1000)

  if (error) {
    console.error("Error fetching available timeframes:", error)
    return []
  }

  // Extract unique timeframes
  const timeframes = new Set<Timeframe>()
  data.forEach((item) => timeframes.add(item.timeframe as Timeframe))

  return Array.from(timeframes)
}

// Subscribe to real-time price updates
export function subscribeToRealtimeUpdates(
  symbol: string,
  timeframe: Timeframe,
  callback: (data: PriceDataPoint) => void,
) {
  const supabase = getSupabaseClient()

  const channel = supabase
    .channel(`price-updates-${symbol}-${timeframe}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "price_data",
        filter: `symbol=eq.${symbol}&timeframe=eq.${timeframe}`,
      },
      (payload) => {
        // Clear cache for this symbol and timeframe
        Object.keys(priceDataCache).forEach((key) => {
          if (key.startsWith(`${symbol}-${timeframe}`)) {
            delete priceDataCache[key]
          }
        })

        callback(payload.new as PriceDataPoint)
      },
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

// Downsample data for larger timeframes
export function downsampleData(
  data: PriceDataPoint[],
  fromTimeframe: Timeframe,
  toTimeframe: Timeframe,
): PriceDataPoint[] {
  if (!data.length) return []

  const timeframeMultipliers: Record<Timeframe, number> = {
    "1m": 1,
    "5m": 5,
    "15m": 15,
    "1h": 60,
    "4h": 240,
    "1D": 1440,
    "1W": 10080,
  }

  const fromMultiplier = timeframeMultipliers[fromTimeframe]
  const toMultiplier = timeframeMultipliers[toTimeframe]

  if (fromMultiplier >= toMultiplier) {
    console.error("Cannot downsample to a smaller timeframe")
    return data
  }

  const ratio = toMultiplier / fromMultiplier
  const result: PriceDataPoint[] = []

  for (let i = 0; i < data.length; i += ratio) {
    const chunk = data.slice(i, i + ratio)
    if (!chunk.length) continue

    const firstPoint = chunk[0]
    const lastPoint = chunk[chunk.length - 1]

    // OHLC calculation
    const open = firstPoint.open
    const close = lastPoint.close
    const high = Math.max(...chunk.map((p) => p.high))
    const low = Math.min(...chunk.map((p) => p.low))
    const volume = chunk.reduce((sum, p) => sum + (p.volume || 0), 0)

    result.push({
      symbol: firstPoint.symbol,
      timeframe: toTimeframe,
      time: firstPoint.time,
      open,
      high,
      low,
      close,
      volume,
    })
  }

  return result
}
