import { getServerSupabaseClient, getSupabaseClient } from "./supabase-client"

export type Trade = {
  id: string
  user_id: string
  symbol: string
  direction: "long" | "short"
  entry_price: number
  exit_price: number | null
  entry_date: string
  exit_date: string | null
  quantity: number
  fees: number
  profit_loss: number | null
  profit_loss_percent: number | null
  status: "open" | "closed" | "cancelled"
  setup: string | null
  tags: string[] | null
  notes: string | null
  import_source: "manual" | "csv" | "robinhood" | "interactive_brokers" | "td_ameritrade"
  created_at: string
  updated_at: string
}

export type TradeInput = Omit<
  Trade,
  "id" | "user_id" | "profit_loss" | "profit_loss_percent" | "created_at" | "updated_at"
>

export type TradeFilter = {
  symbol?: string
  direction?: "long" | "short"
  status?: "open" | "closed" | "cancelled"
  startDate?: string
  endDate?: string
  setup?: string
  tags?: string[]
}

export type TradeSortField = "entry_date" | "exit_date" | "symbol" | "profit_loss" | "profit_loss_percent"
export type SortDirection = "asc" | "desc"

// Client-side functions
export const createTrade = async (trade: TradeInput): Promise<Trade | null> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return null

  const { data, error } = await supabase
    .from("trades")
    .insert({
      ...trade,
      user_id: user.user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating trade:", error)
    return null
  }

  return data as Trade
}

export const getTrades = async (
  page = 1,
  pageSize = 10,
  sortField: TradeSortField = "entry_date",
  sortDirection: SortDirection = "desc",
  filters?: TradeFilter,
): Promise<{ trades: Trade[]; count: number }> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return { trades: [], count: 0 }

  let query = supabase.from("trades").select("*", { count: "exact" }).eq("user_id", user.user.id)

  // Apply filters
  if (filters) {
    if (filters.symbol) {
      query = query.ilike("symbol", `%${filters.symbol}%`)
    }
    if (filters.direction) {
      query = query.eq("direction", filters.direction)
    }
    if (filters.status) {
      query = query.eq("status", filters.status)
    }
    if (filters.startDate) {
      query = query.gte("entry_date", filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte("entry_date", filters.endDate)
    }
    if (filters.setup) {
      query = query.eq("setup", filters.setup)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags)
    }
  }

  // Apply sorting and pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query.order(sortField, { ascending: sortDirection === "asc" }).range(from, to)

  if (error) {
    console.error("Error fetching trades:", error)
    return { trades: [], count: 0 }
  }

  return { trades: data as Trade[], count: count || 0 }
}

export const getTrade = async (id: string): Promise<Trade | null> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return null

  const { data, error } = await supabase.from("trades").select("*").eq("id", id).eq("user_id", user.user.id).single()

  if (error) {
    console.error("Error fetching trade:", error)
    return null
  }

  return data as Trade
}

export const updateTrade = async (id: string, trade: Partial<TradeInput>): Promise<Trade | null> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return null

  const { data, error } = await supabase
    .from("trades")
    .update(trade)
    .eq("id", id)
    .eq("user_id", user.user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating trade:", error)
    return null
  }

  return data as Trade
}

export const deleteTrade = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return false

  const { error } = await supabase.from("trades").delete().eq("id", id).eq("user_id", user.user.id)

  if (error) {
    console.error("Error deleting trade:", error)
    return false
  }

  return true
}

// Server-side functions
export const getTradesByUserId = async (userId: string): Promise<Trade[]> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("trades").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching trades by user ID:", error)
    return []
  }

  return data as Trade[]
}

export const getTradeByIdServer = async (id: string, userId: string): Promise<Trade | null> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("trades").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching trade by ID:", error)
    return null
  }

  return data as Trade
}
