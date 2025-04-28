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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const rows = text.split("\n")

    // Parse CSV header
    const header = rows[0].split(",").map((col) => col.trim())

    // Required columns
    const requiredColumns = ["symbol", "direction", "entry_price", "quantity", "entry_date"]
    const missingColumns = requiredColumns.filter((col) => !header.includes(col))

    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing required columns: ${missingColumns.join(", ")}` }, { status: 400 })
    }

    // Parse CSV data
    const trades = []

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue // Skip empty rows

      const values = rows[i].split(",").map((val) => val.trim())
      const trade: Record<string, any> = {}

      // Map CSV columns to trade properties
      header.forEach((col, index) => {
        trade[col] = values[index]
      })

      // Convert types
      trade.entry_price = Number.parseFloat(trade.entry_price)
      trade.quantity = Number.parseFloat(trade.quantity)

      if (trade.exit_price) {
        trade.exit_price = Number.parseFloat(trade.exit_price)
      }

      if (trade.fees) {
        trade.fees = Number.parseFloat(trade.fees)
      } else {
        trade.fees = 0
      }

      // Set status based on exit_price
      trade.status = trade.exit_price ? "closed" : "open"

      // Set import source
      trade.import_source = "csv"

      // Add user_id
      trade.user_id = user.id

      trades.push(trade)
    }

    // Insert trades into database
    const { data, error } = await supabase.from("trades").insert(trades).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully imported ${data.length} trades`,
      trades: data,
    })
  } catch (error) {
    console.error("CSV import error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
