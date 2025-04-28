"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/navigation/header"
import { Sidebar } from "@/components/navigation/sidebar"
import { AdvancedChart } from "@/components/charts/advanced-chart"
import { TradeReplay } from "@/components/charts/trade-replay"
import { StrategyPatternVisualization } from "@/components/charts/strategy-pattern-visualization"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BaseChart } from "@/components/charts/base-chart"

// Mock data generator for demo purposes
const generateChartData = (timeframe: string, length: number, entryPrice: number, exitPrice: number) => {
  const data = []
  let time = Date.now() - length * getTimeframeInMs(timeframe)
  let price = entryPrice * 0.95

  const trend = exitPrice > entryPrice ? 1 : -1
  const range = Math.abs(exitPrice - entryPrice)
  const volatility = range * 0.1

  for (let i = 0; i < length; i++) {
    const progress = i / length
    const trendComponent = trend * progress * range * 0.8
    const randomComponent = (Math.random() - 0.5) * volatility

    const open = price
    const close = open + trendComponent + randomComponent
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5

    data.push({
      time: Math.floor(time / 1000) as any,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000) + 100,
    })

    price = close
    time += getTimeframeInMs(timeframe)
  }

  return data
}

const getTimeframeInMs = (timeframe: string) => {
  switch (timeframe) {
    case "1m":
      return 60 * 1000
    case "5m":
      return 5 * 60 * 1000
    case "15m":
      return 15 * 60 * 1000
    case "1h":
      return 60 * 60 * 1000
    case "4h":
      return 4 * 60 * 60 * 1000
    case "1D":
      return 24 * 60 * 60 * 1000
    case "1W":
      return 7 * 24 * 60 * 60 * 1000
    default:
      return 60 * 1000
  }
}

// Mock trade data
const trade = {
  id: "1",
  symbol: "AAPL",
  type: "Long",
  entry: 175.23,
  exit: 182.67,
  stopLoss: 172.5,
  takeProfit: 185.0,
  entryTime: "2023-12-15T10:45:00Z",
  exitTime: "2023-12-15T13:00:00Z",
  strategy: "Breakout",
}

// Mock trade events
const mockTradeEvents = [
  { position: 10, label: "Identified Setup", type: "note" as const },
  { position: 20, label: "Entry Long @ $175.23", type: "entry" as const },
  { position: 25, label: "Set Stop Loss @ $172.50", type: "stop" as const },
  { position: 30, label: "Set Take Profit @ $185.00", type: "target" as const },
  { position: 50, label: "Price Consolidation", type: "note" as const },
  { position: 60, label: "Exit @ $182.67", type: "exit" as const },
]

// Mock markers for chart
const createMarkers = (data: any[], trade: any) => {
  const entryIndex = Math.floor(data.length * 0.2)
  const exitIndex = Math.floor(data.length * 0.8)

  return [
    {
      time: data[entryIndex].time,
      position: "belowBar",
      color: "#4CAF50",
      shape: "arrow",
      text: "Entry",
      id: "entry",
      type: "entry",
    },
    {
      time: data[exitIndex].time,
      position: "belowBar",
      color: "#FF9800",
      shape: "arrow",
      text: "Exit",
      id: "exit",
      type: "exit",
    },
  ]
}

export default function TradeChartPage({ params }: { params: { id: string } }) {
  const [chartData, setChartData] = useState<any>({})
  const [chartMarkers, setChartMarkers] = useState<any>({})
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Generate mock data for different timeframes
  useEffect(() => {
    const data = {
      "1m": generateChartData("1m", 120, trade.entry, trade.exit),
      "5m": generateChartData("5m", 100, trade.entry, trade.exit),
      "15m": generateChartData("15m", 80, trade.entry, trade.exit),
      "1h": generateChartData("1h", 60, trade.entry, trade.exit),
      "4h": generateChartData("4h", 40, trade.entry, trade.exit),
      "1D": generateChartData("1D", 30, trade.entry, trade.exit),
      "1W": generateChartData("1W", 20, trade.entry, trade.exit),
    }

    const markers = {
      "1m": createMarkers(data["1m"], trade),
      "5m": createMarkers(data["5m"], trade),
      "15m": createMarkers(data["15m"], trade),
      "1h": createMarkers(data["1h"], trade),
      "4h": createMarkers(data["4h"], trade),
      "1D": createMarkers(data["1D"], trade),
      "1W": createMarkers(data["1W"], trade),
    }

    setChartData(data)
    setChartMarkers(markers)
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6">
            <div className="mb-6 flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href={`/trades/${params.id}`}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to trade details</span>
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">
                {trade.symbol} {trade.type} Trade Chart Analysis
              </h1>
            </div>

            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="chart">Advanced Chart</TabsTrigger>
                <TabsTrigger value="replay">Trade Replay</TabsTrigger>
                <TabsTrigger value="strategy">Strategy Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="chart">
                <AdvancedChart
                  symbol={trade.symbol}
                  data={chartData}
                  markers={chartMarkers}
                  tradeEvents={mockTradeEvents}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={toggleFullscreen}
                />
              </TabsContent>

              <TabsContent value="replay">
                <div className="grid gap-6">
                  <GlassCard>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-4">Trade Replay</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Review the price action during your trade with our step-by-step replay tool. Navigate through
                        key events and analyze your decision points.
                      </p>

                      <div className="grid gap-4">
                        <BaseChart
                          data={chartData["15m"] || []}
                          markers={chartMarkers["15m"] || []}
                          height={400}
                          className="w-full"
                        />

                        <TradeReplay
                          data={chartData["15m"] || []}
                          onPositionChange={() => {}}
                          onSpeedChange={() => {}}
                          tradeEvents={mockTradeEvents}
                        />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-4">Trade Timeline</h2>
                      <div className="space-y-4">
                        {mockTradeEvents.map((event, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-md border ${
                              event.type === "entry"
                                ? "border-green-500/30 bg-green-500/10"
                                : event.type === "exit"
                                  ? "border-orange-500/30 bg-orange-500/10"
                                  : event.type === "stop"
                                    ? "border-red-500/30 bg-red-500/10"
                                    : event.type === "target"
                                      ? "border-blue-500/30 bg-blue-500/10"
                                      : "border-gray-500/30 bg-gray-500/10"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{event.label}</span>
                              <span className="text-sm text-muted-foreground">Position: {event.position}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </TabsContent>

              <TabsContent value="strategy">
                <StrategyPatternVisualization
                  strategyName={trade.strategy}
                  description="This strategy identifies breakouts from consolidation patterns with increased volume."
                  data={chartData["1D"] || []}
                  patternZones={[
                    {
                      startTime: (chartData["1D"] && chartData["1D"][5]?.time) || 0,
                      endTime: (chartData["1D"] && chartData["1D"][10]?.time) || 0,
                      type: "entry" as const,
                      label: "Entry Zone",
                      description: "Ideal entry zone after breakout confirmation with increased volume.",
                    },
                    {
                      startTime: (chartData["1D"] && chartData["1D"][15]?.time) || 0,
                      endTime: (chartData["1D"] && chartData["1D"][20]?.time) || 0,
                      type: "exit" as const,
                      label: "Exit Zone",
                      description: "Recommended exit zone as momentum slows and price approaches resistance.",
                    },
                  ]}
                  similarityScore={85}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
