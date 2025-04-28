"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  LineChart,
  Percent,
  Tag,
  Timer,
  Trash2,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { type Trade, deleteTrade, getTrade } from "@/lib/supabase/trades-service"
import { type TradeScreenshot, getTradeScreenshots } from "@/lib/supabase/trade-screenshots-service"
import { TradeJournalEntries } from "@/components/trades/trade-journal-entries"

export default function TradePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [trade, setTrade] = useState<Trade | null>(null)
  const [screenshots, setScreenshots] = useState<TradeScreenshot[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchTradeData()

    // Simulate page load animation
    const timeout = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)

    return () => clearTimeout(timeout)
  }, [params.id])

  const fetchTradeData = async () => {
    setLoading(true)
    try {
      const tradeData = await getTrade(params.id)
      if (tradeData) {
        setTrade(tradeData)

        // Fetch screenshots
        const screenshotsData = await getTradeScreenshots(params.id)
        setScreenshots(screenshotsData)
      } else {
        toast({
          title: "Error",
          description: "Trade not found",
          variant: "destructive",
        })
        router.push("/trades")
      }
    } catch (error) {
      console.error("Error fetching trade:", error)
      toast({
        title: "Error",
        description: "Failed to load trade data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrade = async () => {
    try {
      if (!trade) return

      const success = await deleteTrade(trade.id)
      if (success) {
        toast({
          title: "Trade deleted",
          description: "The trade has been successfully deleted",
        })
        router.push("/trades")
      } else {
        throw new Error("Failed to delete trade")
      }
    } catch (error) {
      console.error("Error deleting trade:", error)
      toast({
        title: "Error",
        description: "Failed to delete trade",
        variant: "destructive",
      })
    }
  }

  // Generate mock chart data based on trade
  const generateChartData = (timeframe: string) => {
    if (!trade) return []

    const points =
      timeframe === "1m" ? 120 : timeframe === "5m" ? 60 : timeframe === "15m" ? 40 : timeframe === "1h" ? 24 : 14
    const data: any[] = []

    const entryPrice = trade.entry_price
    const exitPrice = trade.exit_price || entryPrice * (trade.direction === "long" ? 1.03 : 0.97)
    let currentPrice = entryPrice * 0.99
    const trend = trade.direction === "long" ? 1 : -1
    const volatility = 0.002

    for (let i = 0; i < points; i++) {
      const random = Math.random() * volatility * 2 - volatility
      const trendFactor = ((i / points) * (exitPrice - entryPrice)) / entryPrice

      currentPrice = currentPrice * (1 + random + trendFactor * trend * 0.1)

      const time = new Date(trade.entry_date)
      time.setMinutes(
        time.getMinutes() +
          i *
            (timeframe === "1m"
              ? 1
              : timeframe === "5m"
                ? 5
                : timeframe === "15m"
                  ? 15
                  : timeframe === "1h"
                    ? 60
                    : 24 * 60),
      )

      const dataPoint: any = {
        time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        price: currentPrice,
        volume: Math.floor(Math.random() * 10000) + 5000,
        ma20: currentPrice * (1 + (Math.random() * 0.01 - 0.005)),
        ma50: currentPrice * (1 + (Math.random() * 0.02 - 0.01)),
      }

      // Add entry and exit points
      if (i === Math.floor(points * 0.2)) {
        dataPoint.entry = entryPrice
      }

      if (i === Math.floor(points * 0.8)) {
        dataPoint.exit = exitPrice
      }

      // Add stop loss and take profit lines
      if (i >= Math.floor(points * 0.2)) {
        dataPoint.stopLoss = trade.direction === "long" ? entryPrice * 0.99 : entryPrice * 1.01
        dataPoint.takeProfit = trade.direction === "long" ? entryPrice * 1.03 : entryPrice * 0.97
      }

      data.push(dataPoint)
    }

    return data
  }

  const chartData = {
    "1m": generateChartData("1m"),
    "5m": generateChartData("5m"),
    "15m": generateChartData("15m"),
    "1h": generateChartData("1h"),
    "1d": generateChartData("1d"),
  }

  if (!isClient || loading) {
    return (
      <AppShell>
        <ContentWrapper>
          <div className="flex justify-center items-center h-[60vh]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </ContentWrapper>
      </AppShell>
    )
  }

  if (!trade) {
    return (
      <AppShell>
        <ContentWrapper>
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-2xl font-bold mb-4">Trade not found</h2>
            <Button asChild>
              <Link href="/trades">Back to Trades</Link>
            </Button>
          </div>
        </ContentWrapper>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <ContentWrapper>
        <div className="container mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/trades">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to trades</span>
              </Link>
            </Button>
            <h1
              className={`text-2xl font-bold font-sf-pro transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              {trade.symbol} {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)} Trade
            </h1>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                style={{ transitionDelay: "100ms" }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                size="sm"
                className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                style={{ transitionDelay: "200ms" }}
                asChild
              >
                <Link href={`/trades/${trade.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <GlassCard
              className={`md:col-span-2 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${trade.direction === "long" ? "bg-profit/20" : "bg-loss/20"}`}
                    >
                      {trade.direction === "long" ? (
                        <ArrowUp className="h-5 w-5 text-profit" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-loss" />
                      )}
                    </div>
                    <div>
                      <div className="text-xl font-bold">{trade.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)} Trade
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {trade.profit_loss !== null ? (
                        <AnimatedNumber
                          value={trade.profit_loss}
                          formatValue={(val) => `${val >= 0 ? "+" : ""}$${val.toFixed(2)}`}
                        />
                      ) : trade.status === "open" ? (
                        "Open"
                      ) : (
                        "—"
                      )}
                    </div>
                    <div
                      className={`text-sm ${trade.profit_loss_percent && trade.profit_loss_percent > 0 ? "text-profit" : trade.profit_loss_percent && trade.profit_loss_percent < 0 ? "text-loss" : ""}`}
                    >
                      {trade.profit_loss_percent !== null
                        ? `${trade.profit_loss_percent > 0 ? "+" : ""}${trade.profit_loss_percent.toFixed(2)}%`
                        : ""}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Entry</div>
                    <div className="font-medium">${trade.entry_price}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Exit</div>
                    <div className="font-medium">{trade.exit_price ? `$${trade.exit_price}` : "—"}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Size</div>
                    <div className="font-medium">{trade.quantity} shares</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Setup</div>
                    <div className="font-medium">{trade.setup || "—"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(trade.entry_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(trade.entry_date).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {trade.exit_date
                        ? `${Math.round(
                            (new Date(trade.exit_date).getTime() - new Date(trade.entry_date).getTime()) /
                              (1000 * 60 * 60),
                          )}h ${Math.round(
                            ((new Date(trade.exit_date).getTime() - new Date(trade.entry_date).getTime()) %
                              (1000 * 60 * 60)) /
                              (1000 * 60),
                          )}m`
                        : "Open"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {trade.tags && trade.tags.length > 0 ? (
                    trade.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className={`flex flex-col gap-4 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "100ms" }}
            >
              <h2 className="text-lg font-semibold font-sf-pro">Trade Metrics</h2>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Risk</span>
                </div>
                <span className="font-medium">${(trade.entry_price * 0.01 * trade.quantity).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Reward</span>
                </div>
                <span className="font-medium">
                  {trade.profit_loss !== null ? `$${Math.abs(trade.profit_loss).toFixed(2)}` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">R:R Ratio</span>
                </div>
                <span className="font-medium">
                  {trade.profit_loss !== null
                    ? `1:${(Math.abs(trade.profit_loss) / (trade.entry_price * 0.01 * trade.quantity)).toFixed(2)}`
                    : "—"}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Status</span>
                </div>
                <Badge
                  variant={trade.status === "open" ? "outline" : trade.status === "closed" ? "default" : "secondary"}
                >
                  {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                </Badge>
              </div>
            </GlassCard>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="journal">Journal</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className={`mt-4 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "200ms" }}
              >
                <GlassCard>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Trade Details</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Symbol</div>
                          <div>{trade.symbol}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Direction</div>
                          <div>{trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Entry Price</div>
                          <div>${trade.entry_price}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Exit Price</div>
                          <div>{trade.exit_price ? `$${trade.exit_price}` : "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Quantity</div>
                          <div>{trade.quantity}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Fees</div>
                          <div>${trade.fees}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Entry Date</div>
                          <div>{new Date(trade.entry_date).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Exit Date</div>
                          <div>{trade.exit_date ? new Date(trade.exit_date).toLocaleString() : "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">P&L</div>
                          <div
                            className={
                              trade.profit_loss && trade.profit_loss > 0
                                ? "text-profit"
                                : trade.profit_loss && trade.profit_loss < 0
                                  ? "text-loss"
                                  : ""
                            }
                          >
                            {trade.profit_loss !== null
                              ? `${trade.profit_loss > 0 ? "+" : ""}$${trade.profit_loss.toFixed(2)} (${
                                  trade.profit_loss_percent
                                    ? `${trade.profit_loss_percent > 0 ? "+" : ""}${trade.profit_loss_percent.toFixed(2)}%`
                                    : ""
                                })`
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
                          <div>{trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Setup</div>
                          <div>{trade.setup || "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Import Source</div>
                          <div>
                            {trade.import_source.charAt(0).toUpperCase() +
                              trade.import_source.slice(1).replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {trade.notes && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Notes</h3>
                        <div className="bg-accent/10 p-4 rounded-md">
                          <p className="whitespace-pre-wrap">{trade.notes}</p>
                        </div>
                      </div>
                    )}

                    {screenshots.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Screenshots</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {screenshots.map((screenshot) => (
                            <a
                              key={screenshot.id}
                              href={screenshot.screenshot_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block overflow-hidden rounded-md border"
                            >
                              <img
                                src={screenshot.screenshot_url || "/placeholder.svg"}
                                alt={`Screenshot ${screenshot.id}`}
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </TabsContent>

              <TabsContent value="chart">
                <GlassCard>
                  <div className="h-[400px]">
                    {/* <Chart data={chartData["1m"]} /> */}
                    Chart Here
                  </div>
                </GlassCard>
              </TabsContent>

              <TabsContent value="journal">
                <div className="mt-4">
                  <TradeJournalEntries tradeId={trade.id} />
                </div>
              </TabsContent>

              <TabsContent value="tags">
                <GlassCard>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Tags</h3>
                    <p className="text-sm text-muted-foreground">Manage and organize your trades with custom tags.</p>
                    <div className="flex flex-wrap gap-2">
                      {trade.tags && trade.tags.length > 0 ? (
                        trade.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="mr-1 h-3 w-3" />
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Delete Trade Confirmation Dialog */}
          {deleteDialogOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
              <div className="flex items-center justify-center min-h-screen">
                <div className="relative bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
                  <h2 className="text-lg font-semibold mb-4">Delete Trade?</h2>
                  <p>Are you sure you want to delete this trade? This action cannot be undone.</p>
                  <div className="mt-6 flex justify-end gap-4">
                    <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteTrade}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
