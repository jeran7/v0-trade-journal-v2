import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Sample trades
    const sampleTrades = [
      {
        user_id: user.id,
        symbol: "AAPL",
        direction: "long",
        entry_price: 175.23,
        exit_price: 182.67,
        entry_date: "2023-12-15T00:00:00Z",
        exit_date: "2023-12-20T00:00:00Z",
        quantity: 100,
        fees: 0,
        status: "closed",
        setup: "Breakout",
        tags: ["tech", "momentum"],
        notes: "Strong breakout above resistance with high volume",
        import_source: "manual",
      },
      {
        user_id: user.id,
        symbol: "MSFT",
        direction: "long",
        entry_price: 340.12,
        exit_price: 352.45,
        entry_date: "2023-12-14T00:00:00Z",
        exit_date: "2023-12-19T00:00:00Z",
        quantity: 50,
        fees: 0,
        status: "closed",
        setup: "Pullback",
        tags: ["tech", "value"],
        notes: "Bought on pullback to 20-day moving average",
        import_source: "manual",
      },
      {
        user_id: user.id,
        symbol: "TSLA",
        direction: "short",
        entry_price: 240.5,
        exit_price: 235.2,
        entry_date: "2023-12-10T00:00:00Z",
        exit_date: "2023-12-12T00:00:00Z",
        quantity: 30,
        fees: 0,
        status: "closed",
        setup: "Reversal",
        tags: ["tech", "overextended"],
        notes: "Shorted at resistance after bearish engulfing pattern",
        import_source: "manual",
      },
      {
        user_id: user.id,
        symbol: "AMZN",
        direction: "long",
        entry_price: 145.3,
        exit_price: null,
        entry_date: "2023-12-21T00:00:00Z",
        exit_date: null,
        quantity: 20,
        fees: 0,
        status: "open",
        setup: "Breakout",
        tags: ["tech", "e-commerce"],
        notes: "Buying breakout above previous all-time high",
        import_source: "manual",
      },
      {
        user_id: user.id,
        symbol: "NVDA",
        direction: "long",
        entry_price: 480.25,
        exit_price: 495.8,
        entry_date: "2023-12-05T00:00:00Z",
        exit_date: "2023-12-08T00:00:00Z",
        quantity: 15,
        fees: 0,
        status: "closed",
        setup: "Gap Up",
        tags: ["tech", "semiconductor", "ai"],
        notes: "Bought after earnings gap up with strong volume",
        import_source: "manual",
      },
    ]

    // Insert sample trades
    const { data: trades, error: tradesError } = await supabase.from("trades").insert(sampleTrades).select()

    if (tradesError) {
      return NextResponse.json({ error: tradesError.message }, { status: 400 })
    }

    // Update user profile if it doesn't exist
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase.from("user_profiles").insert({
        id: user.id,
        display_name: user.email?.split("@")[0] || "Trader",
        avatar_url: null,
        trading_experience: "intermediate",
        subscription_tier: "free",
        preferences: {
          theme: "dark",
          defaultTimeframe: "daily",
          defaultChartType: "candlestick",
        },
      })

      if (insertError) {
        console.error("Error creating user profile:", insertError)
      }
    }

    return NextResponse.json({
      message: "Sample data seeded successfully",
      trades,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
