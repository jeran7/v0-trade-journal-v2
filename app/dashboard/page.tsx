"use client"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, DollarSign, Percent, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { EquityChart } from "@/components/ui/equity-chart"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Button } from "@/components/ui/button"

// Mock data for the dashboard
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

const recentTrades = [
  {
    id: 1,
    symbol: "AAPL",
    type: "Long",
    entry: 175.23,
    exit: 182.67,
    pnl: 7.44,
    pnlPercent: 4.25,
    date: "2023-12-15",
  },
  {
    id: 2,
    symbol: "MSFT",
    type: "Long",
    entry: 340.12,
    exit: 352.45,
    pnl: 12.33,
    pnlPercent: 3.62,
    date: "2023-12-14",
  },
  {
    id: 3,
    symbol: "TSLA",
    type: "Short",
    entry: 245.67,
    exit: 238.21,
    pnl: 7.46,
    pnlPercent: 3.04,
    date: "2023-12-13",
  },
  {
    id: 4,
    symbol: "NVDA",
    type: "Long",
    entry: 465.23,
    exit: 452.1,
    pnl: -13.13,
    pnlPercent: -2.82,
    date: "2023-12-12",
  },
  {
    id: 5,
    symbol: "META",
    type: "Short",
    entry: 320.45,
    exit: 315.2,
    pnl: 5.25,
    pnlPercent: 1.64,
    date: "2023-12-11",
  },
]

export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Calculate summary metrics
  const totalPnL = recentTrades.reduce((sum, trade) => sum + trade.pnl, 0)
  const winRate = (recentTrades.filter((trade) => trade.pnl > 0).length / recentTrades.length) * 100
  const averagePnL = totalPnL / recentTrades.length

  // Debug information
  console.log("Dashboard - Auth State:", { isAuthenticated, isLoading, user })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Authentication Required</h1>
        <p className="text-muted-foreground">You need to be logged in to view this page.</p>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
          <Button variant="outline" onClick={() => router.push("/auth-debug")}>
            Debug Auth
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <ContentWrapper>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-sf-pro">Dashboard</h1>
            <Button variant="outline" size="sm" onClick={() => router.push("/auth-debug")}>
              Debug Auth
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="mr-1 h-4 w-4" />
                <span>Total P&L</span>
              </div>
              <div className="text-2xl font-bold">
                <AnimatedNumber value={totalPnL} formatValue={(val) => `${val.toFixed(2)}`} />
              </div>
              <div className="flex items-center text-xs">
                {totalPnL > 0 ? (
                  <>
                    <ArrowUp className="mr-1 h-3 w-3 text-profit" />
                    <span className="text-profit">Up from last month</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="mr-1 h-3 w-3 text-loss" />
                    <span className="text-loss">Down from last month</span>
                  </>
                )}
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Percent className="mr-1 h-4 w-4" />
                <span>Win Rate</span>
              </div>
              <div className="text-2xl font-bold">
                <AnimatedNumber value={winRate} formatValue={(val) => `${val.toFixed(1)}%`} />
              </div>
              <div className="flex items-center text-xs">
                <ArrowUp className="mr-1 h-3 w-3 text-profit" />
                <span className="text-profit">5.2% increase</span>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>Average P&L</span>
              </div>
              <div className="text-2xl font-bold">
                <AnimatedNumber value={averagePnL} formatValue={(val) => `${val.toFixed(2)}`} />
              </div>
              <div className="flex items-center text-xs">
                <ArrowUp className="mr-1 h-3 w-3 text-profit" />
                <span className="text-profit">Improving</span>
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <h2 className="mb-4 text-xl font-semibold font-sf-pro">Equity Curve</h2>
            <EquityChart data={equityData} />
          </GlassCard>

          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard>
              <h2 className="mb-4 text-xl font-semibold font-sf-pro">Recent Trades</h2>
              <div className="space-y-4">
                {recentTrades.slice(0, 4).map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${trade.type === "Long" ? "bg-profit/20" : "bg-loss/20"}`}
                      >
                        {trade.type === "Long" ? (
                          <ArrowUp className="h-4 w-4 text-profit" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-loss" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{trade.symbol}</div>
                        <div className="text-xs text-muted-foreground">{trade.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${trade.pnl > 0 ? "text-profit" : "text-loss"}`}>
                        {trade.pnl > 0 ? "+" : ""}
                        {trade.pnl.toFixed(2)}
                      </div>
                      <div className={`text-xs ${trade.pnl > 0 ? "text-profit" : "text-loss"}`}>
                        {trade.pnl > 0 ? "+" : ""}
                        {trade.pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 text-xl font-semibold font-sf-pro">Performance Insights</h2>
              <div className="space-y-4">
                <div className="rounded-lg bg-accent/50 p-3">
                  <h3 className="font-medium">Win Streak: 3 Trades</h3>
                  <p className="text-sm text-muted-foreground">You're on a winning streak! Keep up the good work.</p>
                </div>
                <div className="rounded-lg bg-accent/50 p-3">
                  <h3 className="font-medium">Best Performing: AAPL</h3>
                  <p className="text-sm text-muted-foreground">Your trades on AAPL have a 78% win rate.</p>
                </div>
                <div className="rounded-lg bg-accent/50 p-3">
                  <h3 className="font-medium">Risk Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Your average risk:reward ratio is 1:2.5, which is excellent.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
