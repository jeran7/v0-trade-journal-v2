import { NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rate-limiter"

export async function GET() {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimiter(5, "15m")
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Forward to the setup-journal route
    const response = await fetch(
      new URL("/api/admin/setup-journal", process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"),
    )
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to set up journal tables" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in seed journal route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

import type { NextRequest } from "next/server"
import { getSupabaseClient } from "@/lib/supabase/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's trades to link journal entries to
    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select("id")
      .eq("user_id", session.user.id)
      .limit(5)

    if (tradesError) {
      console.error("Error fetching trades:", tradesError)
      return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 })
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json({ error: "No trades found to link journal entries to" }, { status: 400 })
    }

    // Sample journal entries
    const sampleEntries = [
      {
        title: "Market Analysis - Bullish Trend",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Today I noticed a strong bullish trend forming in the market. Key indicators are showing positive momentum.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "The MACD crossed above the signal line, and RSI is showing strength without being overbought.",
                },
              ],
            },
          ],
        },
        mood: "confident",
        lessons_learned: "Always confirm trends with multiple indicators before entering a position.",
        confidence_score: 8,
        tags: ["technical-analysis", "bullish", "trend-following"],
      },
      {
        title: "Emotional Trading Mistake",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "I made a mistake today by entering a trade based on FOMO rather than my trading plan.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This resulted in a loss as I chased the price and entered at a poor level.",
                },
              ],
            },
          ],
        },
        mood: "frustrated",
        lessons_learned: "Stick to the trading plan and avoid emotional decisions. Wait for proper setups.",
        confidence_score: 3,
        tags: ["psychology", "mistakes", "emotions"],
      },
      {
        title: "Successful Breakout Trade",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Executed a perfect breakout trade today after waiting patiently for confirmation.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Volume increased significantly at the breakout point, confirming the move.",
                },
              ],
            },
          ],
        },
        mood: "excited",
        lessons_learned: "Patience pays off. Waiting for confirmation before entering saved me from a false breakout.",
        confidence_score: 9,
        tags: ["breakout", "success", "volume-analysis"],
      },
    ]

    // Insert journal entries
    const journalEntries = []
    for (let i = 0; i < sampleEntries.length; i++) {
      const entry = sampleEntries[i]
      const tradeId = trades[i % trades.length].id

      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: session.user.id,
          trade_id: tradeId,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          lessons_learned: entry.lessons_learned,
          confidence_score: entry.confidence_score,
          tags: entry.tags,
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating journal entry ${i + 1}:`, error)
      } else {
        journalEntries.push(data)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${journalEntries.length} sample journal entries`,
      entries: journalEntries,
    })
  } catch (error) {
    console.error("Unexpected error in POST /api/seed/journal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
