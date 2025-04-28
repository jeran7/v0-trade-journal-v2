"use client"

import { useState, useEffect } from "react"
import { Calendar, Filter, LineChart, Percent, PieChart, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heatmap } from "@/components/ui/heatmap"
import { HorizontalBarChart } from "@/components/ui/horizontal-bar-chart"
import { ClockChart } from "@/components/ui/clock-chart"
import { ConfidenceMatrix } from "@/components/ui/confidence-matrix"
import { FilterBuilder } from "@/components/ui/filter-builder"
import { EquityChart } from "@/components/ui/equity-chart"
import { Badge } from "@/components/ui/badge"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"

// Mock data for the analytics dashboard
const equityData = [
  { date: "Jan", equity: 10000 },
  { date: "Feb", equity: 12000 },
  { date: "Mar", equity: 11500 },
  { date: "Apr", equity: 13500 },
  { date: "May", equity: 15000 },
  { date: "Jun", equity: 14000 },
  { date: "Jul", equity: 16500 },
  { date: "Aug", equity: 18000 },
  { date: "Sep", equity: 17500 },
  { date: "Oct", equity: 19500 },
  { date: "Nov", equity: 21000 },
  { date: "Dec", equity: 25000 },
]

// Mock data for strategy performance heatmap
const strategyPerformanceData = [
  { x: "Breakout", y: "Win Rate", value: 68, secondaryValue: 25, label: "25 trades" },
  { x: "Breakout", y: "Profit Factor", value: 2.4, secondaryValue: 25, label: "25 trades" },
  { x: "Breakout", y: "Avg R:R", value: 1.8, secondaryValue: 25, label: "25 trades" },
  { x: "Pullback", y: "Win Rate", value: 72, secondaryValue: 18, label: "18 trades" },
  { x: "Pullback", y: "Profit Factor", value: 2.8, secondaryValue: 18, label: "18 trades" },
  { x: "Pullback", y: "Avg R:R", value: 2.1, secondaryValue: 18, label: "18 trades" },
  { x: "Reversal", y: "Win Rate", value: 55, secondaryValue: 22, label: "22 trades" },
  { x: "Reversal", y: "Profit Factor", value: 1.6, secondaryValue: 22, label: "22 trades" },
  { x: "Reversal", y: "Avg R:R", value: 1.5, secondaryValue: 22, label: "22 trades" },
  { x: "Gap Fill", y: "Win Rate", value: 63, secondaryValue: 15, label: "15 trades" },
  { x: "Gap Fill", y: "Profit Factor", value: 2.1, secondaryValue: 15, label: "15 trades" },
  { x: "Gap Fill", y: "Avg R:R", value: 1.7, secondaryValue: 15, label: "15 trades" },
  { x: "Support", y: "Win Rate", value: 75, secondaryValue: 12, label: "12 trades" },
  { x: "Support", y: "Profit Factor", value: 3.2, secondaryValue: 12, label: "12 trades" },
  { x: "Support", y: "Avg R:R", value: 2.3, secondaryValue: 12, label: "12 trades" },
]

// Mock data for symbol performance
const symbolPerformanceData = [
  { label: "AAPL", value: 1250, secondaryValue: 950, secondaryLabel: "8 trades" },
  { label: "MSFT", value: 875, secondaryValue: 750, secondaryLabel: "6 trades" },
  { label: "TSLA", value: -320, secondaryValue: -450, secondaryLabel: "5 trades" },
  { label: "NVDA", value: 1680, secondaryValue: 1200, secondaryLabel: "7 trades" },
  { label: "AMZN", value: 560, secondaryValue: 480, secondaryLabel: "4 trades" },
  { label: "META", value: -180, secondaryValue: -220, secondaryLabel: "3 trades" },
  { label: "GOOGL", value: 420, secondaryValue: 380, secondaryLabel: "5 trades" },
  { label: "AMD", value: 780, secondaryValue: 650, secondaryLabel: "6 trades" },
]

// Mock data for session performance
const sessionPerformanceData = [
  { hour: 0, value: 0, count: 0 },
  { hour: 1, value: 0, count: 0 },
  { hour: 2, value: 0, count: 0 },
  { hour: 3, value: 0, count: 0 },
  { hour: 4, value: 0, count: 0 },
  { hour: 5, value: 0, count: 0 },
  { hour: 6, value: 0, count: 0 },
  { hour: 7, value: 0, count: 0 },
  { hour: 8, value: 0, count: 0 },
  { hour: 9, value: 850, count: 12, label: "Market Open" },
  { hour: 10, value: 1250, count: 18, label: "Peak Trading" },
  { hour: 11, value: 780, count: 15 },
  { hour: 12, value: 320, count: 8 },
  { hour: 13, value: 450, count: 10 },
  { hour: 14, value: 680, count: 14 },
  { hour: 15, value: 920, count: 16, label: "Market Close" },
  { hour: 16, value: 0, count: 0 },
  { hour: 17, value: 0, count: 0 },
  { hour: 18, value: 0, count: 0 },
  { hour: 19, value: 0, count: 0 },
  { hour: 20, value: 0, count: 0 },
  { hour: 21, value: 0, count: 0 },
  { hour: 22, value: 0, count: 0 },
  { hour: 23, value: 0, count: 0 },
]

// Mock data for confidence matrix
const confidenceMatrixData = {
  highConfidenceGoodOutcome: {
    id: "high-good",
    title: "Conviction Trades",
    description: "High confidence trades with positive outcomes",
    count: 32,
    percentage: 40,
    color: "hsl(var(--profit))",
    items: [
      { id: "1", label: "AAPL Breakout", value: 1250 },
      { id: "2", label: "NVDA Earnings", value: 980 },
      { id: "3", label: "MSFT Support", value: 750 },
    ],
  },
  highConfidenceBadOutcome: {
    id: "high-bad",
    title: "Overconfidence",
    description: "High confidence trades with negative outcomes",
    count: 12,
    percentage: 15,
    color: "hsl(var(--loss))",
    items: [
      { id: "1", label: "TSLA Reversal", value: -450 },
      { id: "2", label: "META Gap Fill", value: -320 },
      { id: "3", label: "AMZN Breakout", value: -280 },
    ],
  },
  lowConfidenceGoodOutcome: {
    id: "low-good",
    title: "Pleasant Surprises",
    description: "Low confidence trades with positive outcomes",
    count: 18,
    percentage: 22.5,
    color: "hsl(var(--chart-3))",
    items: [
      { id: "1", label: "AMD Pullback", value: 580 },
      { id: "2", label: "GOOGL Support", value: 420 },
      { id: "3", label: "AMZN Reversal", value: 380 },
    ],
  },
  lowConfidenceBadOutcome: {
    id: "low-bad",
    title: "Expected Losses",
    description: "Low confidence trades with negative outcomes",
    count: 18,
    percentage: 22.5,
    color: "hsl(var(--chart-4))",
    items: [
      { id: "1", label: "INTC Breakout", value: -220 },
      { id: "2", label: "NFLX Gap Fill", value: -180 },
      { id: "3", label: "PYPL Pullback", value: -150 },
    ],
  },
}

// Mock filter fields
const filterFields = [
  {
    id: "symbol",
    name: "Symbol",
    type: "text",
  },
  {
    id: "setup",
    name: "Setup",
    type: "select",
    options: [
      { value: "breakout", label: "Breakout" },
      { value: "pullback", label: "Pullback" },
      { value: "reversal", label: "Reversal" },
      { value: "gapFill", label: "Gap Fill" },
      { value: "support", label: "Support" },
    ],
  },
  {
    id: "date",
    name: "Date",
    type: "date",
  },
  {
    id: "pnl",
    name: "P&L",
    type: "number",
  },
  {
    id: "winLoss",
    name: "Win/Loss",
    type: "boolean",
  },
]

// Mock saved filters
const savedFilters = [
  {
    id: "profitable-breakouts",
    name: "Profitable Breakouts",
    description: "Breakout trades with positive P&L",
    groups: [
      {
        id: "group-1",
        logic: "and",
        conditions: [
          { id: "condition-1", field: "setup", operator: "equals", value: "breakout" },
          { id: "condition-2", field: "pnl", operator: "greaterThan", value: 0 },
        ],
      },
    ],
  },
  {
    id: "losing-trades-last-month",
    name: "Losing Trades (Last Month)",
    description: "All losing trades from the previous month",
    groups: [
      {
        id: "group-1",
        logic: "and",
        conditions: [
          { id: "condition-1", field: "winLoss", operator: "equals", value: false },
          { id: "condition-2", field: "date", operator: "after", value: "2023-11-01" },
          { id: "condition-3", field: "date", operator: "before", value: "2023-12-01" },
        ],
      },
    ],
  },
]

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("performance")
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Simulate page load animation
    const timeout = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)

    return () => clearTimeout(timeout)
  }, [])

  const handleFilterChange = (groups: any[]) => {
    console.log("Filter changed:", groups)
    // In a real app, this would trigger data fetching with the new filters
  }

  if (!isClient) {
    return null
  }

  return (
    <AppShell>
      <ContentWrapper>
        <div className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1
              className={`text-3xl font-bold tracking-tight font-sf-pro transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              Analytics Dashboard
            </h1>
            <div
              className={`flex gap-2 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
              style={{ transitionDelay: "100ms" }}
            >
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Last 30 Days
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          <FilterBuilder
            fields={filterFields}
            onFilterChange={handleFilterChange}
            savedFilters={savedFilters}
            onSaveFilter={(filter) => console.log("Save filter:", filter)}
            className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "200ms" }}
          />

          <div className="grid gap-4 md:grid-cols-4">
            <GlassCard
              className={`flex flex-col gap-2 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-profit">68.5%</div>
              <div className="flex items-center text-xs">
                <Badge variant="outline" className="text-profit">
                  +5.2% vs. previous
                </Badge>
              </div>
            </GlassCard>

            <GlassCard
              className={`flex flex-col gap-2 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="flex items-center text-sm text-muted-foreground">
                <Percent className="mr-1 h-4 w-4" />
                <span>Profit Factor</span>
              </div>
              <div className="text-2xl font-bold text-profit">2.4</div>
              <div className="flex items-center text-xs">
                <Badge variant="outline" className="text-profit">
                  +0.3 vs. previous
                </Badge>
              </div>
            </GlassCard>

            <GlassCard
              className={`flex flex-col gap-2 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "500ms" }}
            >
              <div className="flex items-center text-sm text-muted-foreground">
                <LineChart className="mr-1 h-4 w-4" />
                <span>Average R:R</span>
              </div>
              <div className="text-2xl font-bold text-profit">1.8</div>
              <div className="flex items-center text-xs">
                <Badge variant="outline" className="text-profit">
                  +0.2 vs. previous
                </Badge>
              </div>
            </GlassCard>

            <GlassCard
              className={`flex flex-col gap-2 transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="flex items-center text-sm text-muted-foreground">
                <PieChart className="mr-1 h-4 w-4" />
                <span>Total P&L</span>
              </div>
              <div className="text-2xl font-bold text-profit">$5,065</div>
              <div className="flex items-center text-xs">
                <Badge variant="outline" className="text-profit">
                  +$1,250 vs. previous
                </Badge>
              </div>
            </GlassCard>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="psychology">Psychology</TabsTrigger>
              <TabsTrigger value="risk">Risk Management</TabsTrigger>
              <TabsTrigger value="timeframe">Timeframe Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6 pt-4">
              <GlassCard
                className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "700ms" }}
              >
                <h2 className="mb-4 text-xl font-semibold font-sf-pro">Equity Curve</h2>
                <EquityChart data={equityData} />
              </GlassCard>

              <div className="grid gap-6 md:grid-cols-2">
                <GlassCard
                  className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: "800ms" }}
                >
                  <Heatmap
                    title="Strategy Performance Matrix"
                    subtitle="Win rate, profit factor, and average R:R by setup type"
                    data={strategyPerformanceData}
                    xLabels={["Breakout", "Pullback", "Reversal", "Gap Fill", "Support"]}
                    yLabels={["Win Rate", "Profit Factor", "Avg R:R"]}
                    colorScale="green-red"
                    valueFormat={(value) => (value % 1 === 0 ? `${value}%` : value.toFixed(1))}
                    cellSize="md"
                  />
                </GlassCard>

                <GlassCard
                  className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: "900ms" }}
                >
                  <HorizontalBarChart
                    title="Symbol Performance"
                    subtitle="P&L by symbol (in USD)"
                    data={symbolPerformanceData}
                    valueFormatter={(value) => `$${value.toFixed(0)}`}
                    sortBars="desc"
                  />
                </GlassCard>
              </div>

              <GlassCard
                className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "1000ms" }}
              >
                <ClockChart
                  title="Session Performance"
                  subtitle="P&L by time of day (in USD)"
                  data={sessionPerformanceData}
                  colorScale="blue-purple"
                  valueFormatter={(value) => `$${value.toFixed(0)}`}
                  countFormatter={(count) => `${count} trades`}
                  size="md"
                  showLabels={true}
                  is24Hour={false}
                  highlightPeak={true}
                  highlightLow={true}
                />
              </GlassCard>
            </TabsContent>

            <TabsContent value="psychology" className="space-y-6 pt-4">
              <GlassCard
                className={`transition-all duration-500 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "700ms" }}
              >
                <ConfidenceMatrix
                  title="Confidence vs. Results Matrix"
                  subtitle="Analysis of trade confidence levels and outcomes"
                  data={confidenceMatrixData}
                  xAxisLabel="Confidence"
                  yAxisLabel="Outcome"
                  showItemsOnHover={true}
                />
              </GlassCard>

              {/* Additional psychology components would go here */}
            </TabsContent>

            <TabsContent value="risk" className="pt-4">
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <h3 className="text-lg font-medium">Risk Management Analytics</h3>
                <p className="mt-2 text-muted-foreground">This section is under development.</p>
              </div>
            </TabsContent>

            <TabsContent value="timeframe" className="pt-4">
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <h3 className="text-lg font-medium">Timeframe Analysis</h3>
                <p className="mt-2 text-muted-foreground">This section is under development.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
