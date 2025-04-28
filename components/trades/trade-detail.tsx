"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils"
import { TradeOverview } from "./trade-overview"
import { TradeChart } from "./trade-chart"
import { TradeJournal } from "./trade-journal"
import { TradeTags } from "./trade-tags"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

interface TradeDetailProps {
  tradeId: string
}

export function TradeDetail({ tradeId }: TradeDetailProps) {
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const response = await fetch(`/api/trades/${tradeId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch trade")
        }
        const data = await response.json()
        setTrade(data.trade)
      } catch (error) {
        console.error("Error fetching trade:", error)
        toast({
          title: "Error",
          description: "Failed to load trade details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrade()
  }, [tradeId])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete trade")
      }

      toast({
        title: "Trade deleted",
        description: "The trade has been successfully deleted",
      })

      router.push("/trades")
      router.refresh()
    } catch (error) {
      console.error("Error deleting trade:", error)
      toast({
        title: "Error",
        description: "Failed to delete trade",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Trade not found</h2>
        <p className="text-muted-foreground mt-2">The requested trade could not be found</p>
        <Button className="mt-4" onClick={() => router.push("/trades")}>
          Back to Trades
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {trade.symbol}
            <Badge variant={trade.direction === "long" ? "default" : "destructive"}>
              {trade.direction === "long" ? "LONG" : "SHORT"}
            </Badge>
            <Badge
              variant={trade.status === "open" ? "outline" : trade.status === "closed" ? "secondary" : "destructive"}
            >
              {trade.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            {formatDate(new Date(trade.entry_date))}
            {trade.exit_date && ` - ${formatDate(new Date(trade.exit_date))}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/trades/${tradeId}/edit`)}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the trade and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {trade.profit_loss !== undefined && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Profit/Loss</p>
                <p
                  className={`text-2xl font-bold ${Number(trade.profit_loss) >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {formatCurrency(Number(trade.profit_loss))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P&L %</p>
                <p
                  className={`text-2xl font-bold ${Number(trade.profit_loss_percent) >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {formatPercentage(Number(trade.profit_loss_percent))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-2xl font-bold">{trade.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entry/Exit</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(trade.entry_price)}
                  {trade.exit_price && ` / ${formatCurrency(trade.exit_price)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <TradeOverview trade={trade} />
        </TabsContent>
        <TabsContent value="chart">
          <TradeChart tradeId={tradeId} symbol={trade.symbol} />
        </TabsContent>
        <TabsContent value="journal">
          <TradeJournal tradeId={tradeId} />
        </TabsContent>
        <TabsContent value="tags">
          <TradeTags trade={trade} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
