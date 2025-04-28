import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const { data, error } = await supabase
      .from("trades")
      .select(`
        *,
        trade_screenshots (*)
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    return NextResponse.json({ trade: data })
  } catch (error) {
    console.error("Trade fetch error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const tradeData = await request.json()

    // Remove fields that shouldn't be updated directly
    delete tradeData.id
    delete tradeData.user_id
    delete tradeData.created_at
    delete tradeData.updated_at
    delete tradeData.profit_loss
    delete tradeData.profit_loss_percent

    // Check if the trade belongs to the user
    const { data: existingTrade, error: fetchError } = await supabase
      .from("trades")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingTrade) {
      return NextResponse.json({ error: "Trade not found or access denied" }, { status: 404 })
    }

    const { data, error } = await supabase.from("trades").update(tradeData).eq("id", id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "Trade updated successfully",
      trade: data,
    })
  } catch (error) {
    console.error("Trade update error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Check if the trade belongs to the user
    const { data: existingTrade, error: fetchError } = await supabase
      .from("trades")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingTrade) {
      return NextResponse.json({ error: "Trade not found or access denied" }, { status: 404 })
    }

    const { error } = await supabase.from("trades").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "Trade deleted successfully",
    })
  } catch (error) {
    console.error("Trade deletion error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
