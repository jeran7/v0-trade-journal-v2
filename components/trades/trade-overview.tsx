"use client"

import { useState, useEffect } from "react"

interface Trade {
  id: string
  symbol: string
  direction: "long" | "short"
  entry_price: number
  exit_price?: number
  entry_date: string
  exit_date?: string
  quantity: number
  fees?: number
  profit_loss?: number
  profit_loss_percent?: number
  status: "open" | "closed" | "cancelled"
  setup?: string
  tags?: string[]
  notes?: string
  created_at: string
  updated_at: string
  import_source: string
}

interface Screenshot {
  id: string
  trade_id: string
  screenshot_url: string
  screenshot_type: string
  created_at: string
}

interface TradeOverviewProps {
  trade: Trade
}

export function TradeOverview({ trade }: TradeOverviewProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])

  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        const response = null
      } catch (error) {
        console.error("Error fetching screenshots:", error)
      }
    }

    fetchScreenshots()
  }, [trade.id])

  return <div>Trade Overview</div>
}
