"use client"

import { useState } from "react"
import { LineChart, BarChart, Calendar, Download, Filter, Maximize2, ZoomIn } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for backtest results
const backtestData = {
  equity: [
    { date: "Jan 1", value: 10000 },
    { date: "Jan 5", value: 10250 },
    { date: "Jan 10", value: 10180 },
    { date: "Jan 15", value: 10450 },
    { date: "Jan 20", value: 10380 },
    { date: "Jan 25", value: 10620 },
    { date: "Jan 30", value: 10800 },
    { date: "Feb 5", value: 11050 },
    { date: "Feb 10", value: 10950 },
    { date: "Feb 15", value: 11200 },
    { date: "Feb 20", value: 11450 },
    { date: "Feb 25", value: 11380 },
    { date: "Mar 1", value: 11650 },
    { date: "Mar 5", value: 11800 },
    { date: "Mar 10", value: 11750 },
    { date: "Mar 15", value: 12000 },
  ],
  trades: [
    { date: "Jan 5", result: "win", r: 2.5 },
    { date: "Jan 12", result: "loss", r: -1.0 },
    { date: "Jan 18", result: "win", r: 3.2 },
    { date: "Jan 25", result: "win", r: 1.8 },
    { date: "Feb 2", result: "win", r: 2.2 },
    { date: "Feb 8", result: "loss", r: -0.8 },
    { date: "Feb 15", result: "win", r: 2.5 },
    { date: "Feb 22", result: "win", r: 1.9 },
    { date: "Mar 1", result: "win", r: 2.7 },
    { date: "Mar 8", result: "loss", r: -1.2 },
    { date: "Mar 15", result: "win", r: 2.1 },
  ],
}

export function BacktestVisualizer() {
  const [activeTab, setActiveTab] = useState("equity")
  const [timeframe, setTimeframe] = useState("3m")

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-medium">Backtest Results</h3>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equity">
            <LineChart className="mr-2 h-4 w-4" />
            Equity Curve
          </TabsTrigger>
          <TabsTrigger value="trades">
            <BarChart className="mr-2 h-4 w-4" />
            Trade Results
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equity" className="mt-4">
          <div className="relative h-[300px] w-full">
            {/* This would be a real chart in a production app */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Equity curve visualization would go here</span>
                <Button variant="outline" size="sm">
                  <ZoomIn className="mr-2 h-4 w-4" />
                  Interactive Chart
                </Button>
              </div>
            </div>

            {/* Placeholder for the equity curve */}
            <div className="absolute inset-x-0 bottom-0 h-[200px]">
              <div className="relative h-full w-full">
                {/* Simplified equity curve visualization */}
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
                    <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                  </linearGradient>
                  <path
                    d="M0,100 L0,80 C5,78 10,75 15,78 C20,81 25,85 30,82 C35,79 40,70 45,65 C50,60 55,58 60,55 C65,52 70,48 75,42 C80,36 85,30 90,25 C95,20 100,15 100,15 L100,100 Z"
                    fill="url(#gradient)"
                    strokeWidth="0"
                  />
                  <path
                    d="M0,80 C5,78 10,75 15,78 C20,81 25,85 30,82 C35,79 40,70 45,65 C50,60 55,58 60,55 C65,52 70,48 75,42 C80,36 85,30 90,25 C95,20 100,15 100,15"
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="2"
                  />
                </svg>

                {/* Markers for trades */}
                <div className="absolute inset-0">
                  <div className="relative h-full w-full">
                    {backtestData.trades.map((trade, index) => {
                      const position = (index / (backtestData.trades.length - 1)) * 100
                      const isWin = trade.result === "win"
                      return (
                        <div
                          key={index}
                          className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${
                            isWin ? "bg-profit" : "bg-loss"
                          }`}
                          style={{ left: `${position}%` }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Net Profit</div>
              <div className="text-lg font-bold text-profit">+$2,000</div>
              <div className="text-xs text-profit">+20.0%</div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Max Drawdown</div>
              <div className="text-lg font-bold text-loss">-$320</div>
              <div className="text-xs text-loss">-3.2%</div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              <div className="text-lg font-bold">1.85</div>
              <div className="text-xs text-muted-foreground">Annual</div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Recovery Factor</div>
              <div className="text-lg font-bold">6.25</div>
              <div className="text-xs text-muted-foreground">Profit/DD</div>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="mt-4">
          <div className="relative h-[300px] w-full">
            {/* This would be a real chart in a production app */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <BarChart className="h-16 w-16 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Trade results visualization would go here</span>
                <Button variant="outline" size="sm">
                  <ZoomIn className="mr-2 h-4 w-4" />
                  Interactive Chart
                </Button>
              </div>
            </div>

            {/* Placeholder for the trade results */}
            <div className="absolute inset-x-0 bottom-0 h-[200px]">
              <div className="flex h-full w-full items-end justify-around">
                {backtestData.trades.map((trade, index) => (
                  <div
                    key={index}
                    className={`w-6 ${trade.result === "win" ? "bg-profit" : "bg-loss"}`}
                    style={{
                      height: `${Math.abs(trade.r) * 15}%`,
                      maxHeight: "90%",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Total Trades</div>
              <div className="text-lg font-bold">{backtestData.trades.length}</div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Win Rate</div>
              <div className="text-lg font-bold text-profit">
                {Math.round(
                  (backtestData.trades.filter((t) => t.result === "win").length / backtestData.trades.length) * 100,
                )}
                %
              </div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Avg Win</div>
              <div className="text-lg font-bold text-profit">
                +
                {(
                  backtestData.trades.filter((t) => t.result === "win").reduce((sum, t) => sum + t.r, 0) /
                  backtestData.trades.filter((t) => t.result === "win").length
                ).toFixed(1)}
                R
              </div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Avg Loss</div>
              <div className="text-lg font-bold text-loss">
                {(
                  backtestData.trades.filter((t) => t.result === "loss").reduce((sum, t) => sum + t.r, 0) /
                  backtestData.trades.filter((t) => t.result === "loss").length
                ).toFixed(1)}
                R
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="relative h-[300px] w-full">
            {/* This would be a real calendar heatmap in a production app */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-16 w-16 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Calendar heatmap visualization would go here</span>
                <Button variant="outline" size="sm">
                  <ZoomIn className="mr-2 h-4 w-4" />
                  Interactive Calendar
                </Button>
              </div>
            </div>

            {/* Placeholder for the calendar */}
            <div className="absolute inset-0 grid grid-cols-7 grid-rows-5 gap-1 p-8">
              {Array.from({ length: 35 }).map((_, index) => {
                const hasData = Math.random() > 0.6
                const isWin = hasData && Math.random() > 0.3
                const intensity = hasData ? Math.floor(Math.random() * 5) + 1 : 0
                return (
                  <div
                    key={index}
                    className={`rounded ${
                      hasData
                        ? isWin
                          ? `bg-profit/20 border border-profit/40`
                          : `bg-loss/20 border border-loss/40`
                        : "bg-muted/20"
                    }`}
                    style={{
                      opacity: hasData ? 0.3 + intensity * 0.15 : 0.1,
                    }}
                  />
                )
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Best Day</div>
              <div className="text-lg font-bold text-profit">+3.2R</div>
              <div className="text-xs text-muted-foreground">Jan 18</div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Worst Day</div>
              <div className="text-lg font-bold text-loss">-1.2R</div>
              <div className="text-xs text-muted-foreground">Mar 8</div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Best Month</div>
              <div className="text-lg font-bold text-profit">+8.4R</div>
              <div className="text-xs text-muted-foreground">February</div>
            </GlassCard>
            <GlassCard className="p-3">
              <div className="text-xs text-muted-foreground">Avg Trades/Week</div>
              <div className="text-lg font-bold">1.8</div>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
