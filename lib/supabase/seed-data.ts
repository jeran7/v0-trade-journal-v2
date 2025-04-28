"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Timeframe } from "./price-data-service"
import { generatePriceData } from "./seed-utils"

// Seed the database with sample data
export async function seedDatabase(
  progressCallback?: (progress: { symbol: string; timeframe: string; current: number; total: number }) => void,
) {
  const supabase = createClientComponentClient()

  // Define symbols and timeframes to seed
  const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "SPY", "QQQ", "BTC", "ETH"]
  const timeframes: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"]

  let totalInserted = 0
  let errors = 0

  // Generate and insert data for each symbol and timeframe
  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      // Generate different amounts of data based on timeframe
      let count
      switch (timeframe) {
        case "1m":
          count = 1440 // 1 day of 1-minute data
          break
        case "5m":
          count = 1152 // 4 days of 5-minute data
          break
        case "15m":
          count = 672 // 7 days of 15-minute data
          break
        case "1h":
          count = 720 // 30 days of hourly data
          break
        case "4h":
          count = 360 // 60 days of 4-hour data
          break
        case "1D":
          count = 365 // 1 year of daily data
          break
        case "1W":
          count = 104 // 2 years of weekly data
          break
        default:
          count = 100
      }

      // Generate data with realistic price movements
      const data = generatePriceData(symbol, timeframe, count)

      // Insert data in batches to avoid hitting limits
      const batchSize = 500
      let inserted = 0

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)

        try {
          const { error } = await supabase.from("price_data").upsert(batch, { onConflict: "symbol,timeframe,time" })

          if (error) {
            console.error(`Error seeding ${symbol} ${timeframe} data:`, error)
            errors++
          } else {
            inserted += batch.length
            totalInserted += batch.length

            if (progressCallback) {
              progressCallback({
                symbol,
                timeframe,
                current: inserted,
                total: count,
              })
            }
          }
        } catch (error) {
          console.error(`Exception seeding ${symbol} ${timeframe} data:`, error)
          errors++
        }

        // Small delay to avoid overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      console.log(`Seeded ${inserted} records for ${symbol} ${timeframe}`)
    }
  }

  return {
    success: errors === 0,
    message: `Database seeded with ${totalInserted} records. ${errors > 0 ? `(${errors} errors)` : ""}`,
    totalInserted,
    errors,
  }
}

// Seed sample chart preferences
export async function seedChartPreferences() {
  const supabase = createClientComponentClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  // Sample preferences
  const preferences = [
    {
      user_id: user.id,
      name: "Default",
      symbol: "AAPL",
      timeframe: "1D",
      chart_type: "candlestick",
      indicators: {
        ma: [
          { period: 20, color: "#2962FF", width: 2 },
          { period: 50, color: "#FF6D00", width: 2 },
          { period: 200, color: "#E91E63", width: 2 },
        ],
        volume: { visible: true, color: "#64B5F6" },
      },
      drawings: {},
      layout: { showGrid: true, showWatermark: false },
    },
    {
      user_id: user.id,
      name: "Crypto Trading",
      symbol: "BTC",
      timeframe: "1h",
      chart_type: "candlestick",
      indicators: {
        bollinger: { period: 20, stdDev: 2, color: "#4CAF50" },
        rsi: { period: 14, overbought: 70, oversold: 30 },
      },
      drawings: {},
      layout: { showGrid: true, showWatermark: false },
    },
    {
      user_id: user.id,
      name: "Swing Trading",
      symbol: "SPY",
      timeframe: "1D",
      chart_type: "candlestick",
      indicators: {
        ema: [
          { period: 8, color: "#2962FF", width: 2 },
          { period: 21, color: "#FF6D00", width: 2 },
        ],
        macd: { fast: 12, slow: 26, signal: 9 },
      },
      drawings: {},
      layout: { showGrid: true, showWatermark: false },
    },
  ]

  // Insert preferences
  const { error } = await supabase.from("chart_preferences").upsert(preferences)

  if (error) {
    console.error("Error seeding chart preferences:", error)
    return { success: false, message: "Error seeding chart preferences" }
  }

  return { success: true, message: `Seeded ${preferences.length} chart preferences` }
}

// Seed sample chart drawings
export async function seedChartDrawings() {
  const supabase = createClientComponentClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  // Sample drawings
  const drawings = [
    {
      user_id: user.id,
      symbol: "AAPL",
      timeframe: "1D",
      drawing_type: "trendline",
      drawing_data: {
        points: [
          { time: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, price: 170 },
          { time: Math.floor(Date.now() / 1000), price: 190 },
        ],
        color: "#2962FF",
        width: 2,
      },
      is_public: true,
    },
    {
      user_id: user.id,
      symbol: "MSFT",
      timeframe: "1D",
      drawing_type: "rectangle",
      drawing_data: {
        points: [
          { time: Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60, price: 310 },
          { time: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, price: 330 },
        ],
        color: "#FF6D00",
        width: 1,
        filled: true,
        fillColor: "rgba(255, 109, 0, 0.2)",
      },
      is_public: true,
    },
    {
      user_id: user.id,
      symbol: "BTC",
      timeframe: "4h",
      drawing_type: "fibonacci",
      drawing_data: {
        points: [
          { time: Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60, price: 55000 },
          { time: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, price: 65000 },
        ],
        levels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
        color: "#9C27B0",
        width: 1,
      },
      is_public: true,
    },
  ]

  // Insert drawings
  const { error } = await supabase.from("chart_drawings").upsert(drawings)

  if (error) {
    console.error("Error seeding chart drawings:", error)
    return { success: false, message: "Error seeding chart drawings" }
  }

  return { success: true, message: `Seeded ${drawings.length} chart drawings` }
}

// Seed sample chart patterns
export async function seedChartPatterns() {
  const supabase = createClientComponentClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  // Sample patterns
  const patterns = [
    {
      name: "Double Bottom",
      description:
        "A bullish reversal pattern that forms after a downtrend, characterized by two lows at approximately the same price level.",
      symbol: "AAPL",
      timeframe: "1D",
      pattern_data: {
        points: [
          { time: Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60, price: 180 },
          { time: Math.floor(Date.now() / 1000) - 45 * 24 * 60 * 60, price: 165 },
          { time: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, price: 175 },
          { time: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60, price: 165 },
          { time: Math.floor(Date.now() / 1000), price: 185 },
        ],
        type: "bullish",
        color: "#4CAF50",
      },
      thumbnail_url: "/patterns/double-bottom.png",
      created_by: user.id,
      is_system: true,
    },
    {
      name: "Head and Shoulders",
      description:
        "A bearish reversal pattern that forms after an uptrend, characterized by three peaks with the middle peak (head) being the highest.",
      symbol: "MSFT",
      timeframe: "1D",
      pattern_data: {
        points: [
          { time: Math.floor(Date.now() / 1000) - 75 * 24 * 60 * 60, price: 310 },
          { time: Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60, price: 325 },
          { time: Math.floor(Date.now() / 1000) - 45 * 24 * 60 * 60, price: 315 },
          { time: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, price: 335 },
          { time: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60, price: 315 },
          { time: Math.floor(Date.now() / 1000), price: 325 },
        ],
        type: "bearish",
        color: "#F44336",
      },
      thumbnail_url: "/patterns/head-and-shoulders.png",
      created_by: user.id,
      is_system: true,
    },
    {
      name: "Bull Flag",
      description:
        "A bullish continuation pattern that forms after a strong uptrend, characterized by a consolidation period (flag) following a sharp rise (pole).",
      symbol: "NVDA",
      timeframe: "1D",
      pattern_data: {
        points: [
          { time: Math.floor(Date.now() / 1000) - 45 * 24 * 60 * 60, price: 700 },
          { time: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, price: 800 },
          { time: Math.floor(Date.now() / 1000) - 25 * 24 * 60 * 60, price: 790 },
          { time: Math.floor(Date.now() / 1000) - 20 * 24 * 60 * 60, price: 780 },
          { time: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60, price: 770 },
          { time: Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60, price: 780 },
          { time: Math.floor(Date.now() / 1000), price: 850 },
        ],
        type: "bullish",
        color: "#4CAF50",
      },
      thumbnail_url: "/patterns/bull-flag.png",
      created_by: user.id,
      is_system: true,
    },
  ]

  // Insert patterns
  const { error } = await supabase.from("chart_patterns").upsert(patterns)

  if (error) {
    console.error("Error seeding chart patterns:", error)
    return { success: false, message: "Error seeding chart patterns" }
  }

  return { success: true, message: `Seeded ${patterns.length} chart patterns` }
}

// Seed sample indicator templates
export async function seedIndicatorTemplates() {
  const supabase = createClientComponentClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  // Sample indicator templates
  const templates = [
    {
      user_id: user.id,
      name: "Moving Average Bundle",
      indicator_type: "ma",
      settings: {
        periods: [20, 50, 200],
        colors: ["#2962FF", "#FF6D00", "#E91E63"],
        widths: [2, 2, 2],
      },
      is_public: true,
    },
    {
      user_id: user.id,
      name: "VWAP with Bands",
      indicator_type: "vwap",
      settings: {
        period: "day",
        showBands: true,
        bandDeviations: [1, 2, 3],
        colors: ["#9C27B0", "#7B1FA2", "#6A1B9A"],
      },
      is_public: true,
    },
    {
      user_id: user.id,
      name: "RSI with Stochastic",
      indicator_type: "multi",
      settings: {
        indicators: [
          {
            type: "rsi",
            period: 14,
            overbought: 70,
            oversold: 30,
            color: "#2962FF",
          },
          {
            type: "stochastic",
            kPeriod: 14,
            dPeriod: 3,
            smooth: 3,
            overbought: 80,
            oversold: 20,
            kColor: "#FF6D00",
            dColor: "#E91E63",
          },
        ],
      },
      is_public: true,
    },
  ]

  // Insert templates
  const { error } = await supabase.from("indicator_templates").upsert(templates)

  if (error) {
    console.error("Error seeding indicator templates:", error)
    return { success: false, message: "Error seeding indicator templates" }
  }

  return { success: true, message: `Seeded ${templates.length} indicator templates` }
}

// Seed all data
export async function seedAllData(
  progressCallback?: (progress: { symbol: string; timeframe: string; current: number; total: number }) => void,
) {
  const results = []

  // Seed price data
  const priceDataResult = await seedDatabase(progressCallback)
  results.push({ type: "Price Data", ...priceDataResult })

  // Seed chart preferences
  const preferencesResult = await seedChartPreferences()
  results.push({ type: "Chart Preferences", ...preferencesResult })

  // Seed chart drawings
  const drawingsResult = await seedChartDrawings()
  results.push({ type: "Chart Drawings", ...drawingsResult })

  // Seed chart patterns
  const patternsResult = await seedChartPatterns()
  results.push({ type: "Chart Patterns", ...patternsResult })

  // Seed indicator templates
  const templatesResult = await seedIndicatorTemplates()
  results.push({ type: "Indicator Templates", ...templatesResult })

  return {
    success: results.every((r) => r.success),
    results,
  }
}
