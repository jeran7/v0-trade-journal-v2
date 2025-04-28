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

    const { credentials } = await request.json()

    if (!credentials || !credentials.username || !credentials.password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // This is a mock implementation - in a real app, you would connect to Robinhood's API
    // For now, we'll just return some sample trades

    const mockTrades = [
      {
        user_id: user.id,
        symbol: "AAPL",
        direction: "long",
        entry_price: 175.23,
        exit_price: 182.67,
        entry_date: "2023-12-15T00:00:00Z",
        exit_date: "2023-12-20T00:00:00Z",
        quantity: 10,
        fees: 0,
        status: "closed",
        import_source: "robinhood",
      },
      {
        user_id: user.id,
        symbol: "MSFT",
        direction: "long",
        entry_price: 340.12,
        exit_price: 352.45,
        entry_date: "2023-12-14T00:00:00Z",
        exit_date: "2023-12-19T00:00:00Z",
        quantity: 5,
        fees: 0,
        status: "closed",
        import_source: "robinhood",
      },
      {
        user_id: user.id,
        symbol: "TSLA",
        direction: "short",
        entry_price: 240.5,
        exit_price: 235.2,
        entry_date: "2023-12-10T00:00:00Z",
        exit_date: "2023-12-12T00:00:00Z",
        quantity: 8,
        fees: 0,
        status: "closed",
        import_source: "robinhood",
      },
    ]

    // Insert mock trades into database
    const { data, error } = await supabase.from("trades").insert(mockTrades).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully imported ${data.length} trades from Robinhood`,
      trades: data,
    })
  } catch (error) {
    console.error("Robinhood import error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
