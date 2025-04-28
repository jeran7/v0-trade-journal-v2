"use client"

import Link from "next/link"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { TrendingUp, PercentIcon, Filter, Download, ArrowUpRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock data for the performance dashboard
const mockPerformanceData = {
  summary: {
    winRate: 68,
    profitFactor: 2.4,
    averageWin: 320,
    averageLoss: 150,
    totalTrades: 75,
    expectancy: 1.28,
  },
  equityCurve: [
    { date: "Jan", equity: 10000 },
    { date: "Feb", equity: 10800 },
    { date: "Mar", equity: 11200 },
    { date: "Apr", equity: 10900 },
    { date: "May", equity: 11500 },
    { date: "Jun", equity: 12300 },
    { date: "Jul", equity: 13100 },
    { date: "Aug", equity: 12800 },
    { date: "Sep", equity: 13600 },
    { date: "Oct", equity: 14200 },
    { date: "Nov", equity: 15100 },
    { date: "Dec", equity: 16000 },
  ],
  winLoss: [
    { name: "Wins", value: 51 },
    { name: "Losses", value: 24 },
  ],
  monthlyPerformance: [
    { month: "Jan", return: 8 },
    { month: "Feb", return: 4 },
    { month: "Mar", return: -3 },
    { month: "Apr", return: 6 },
    { month: "May", return: 7 },
    { month: "Jun", return: 6 },
    { month: "Jul", return: -2 },
    { month: "Aug", return: 6 },
    { month: "Sep", return: 4 },
    { month: "Oct", return: 6 },
    { month: "Nov", return: 6 },
    { month: "Dec", return: 6 },
  ],
  marketConditions: [
    { condition: "Bullish Trend", winRate: 78, trades: 32 },
    { condition: "Bearish Trend", winRate: 65, trades: 20 },
    { condition: "Sideways", winRate: 52, trades: 23 },
  ],
  tradeDistribution: [
    { x: 1.5, y: 250, z: 10, name: "AAPL" },
    { x: 2.1, y: 420, z: 15, name: "MSFT" },
    { x: 0.8, y: -150, z: 8, name: "META" },
    { x: 1.2, y: 180, z: 5, name: "AMZN" },
    { x: 2.8, y: 550, z: 12, name: "NVDA" },
    { x: 0.5, y: -220, z: 7, name: "NFLX" },
    { x: 1.9, y: 320, z: 9, name: "GOOGL" },
    { x: 2.3, y: 480, z: 14, name: "TSLA" },
    { x: 1.1, y: -120, z: 6, name: "AMD" },
    { x: 1.7, y: 280, z: 11, name: "INTC" },
  ],
  recentTrades: [
    {
      id: "1",
      date: "2023-12-15",
      symbol: "AAPL",
      setup: "Breakout",
      entry: 175.23,
      exit: 182.67,
      pnl: 744.0,
      rr: 2.5,
      adherence: 92,
    },
    {
      id: "2",
      date: "2023-12-10",
      symbol: "MSFT",
      setup: "Breakout",
      entry: 320.45,
      exit: 328.8,
      pnl: 835.0,
      rr: 2.2,
      adherence: 88,
    },
    {
      id: "3",
      date: "2023-12-05",
      symbol: "META",
      setup: "Breakout",
      entry: 290.3,
      exit: 285.15,
      pnl: -515.0,
      rr: -1.2,
      adherence: 65,
    },
    {
      id: "4",
      date: "2023-11-28",
      symbol: "NVDA",
      setup: "Breakout",
      entry: 450.75,
      exit: 468.2,
      pnl: 1745.0,
      rr: 3.1,
      adherence: 95,
    },
    {
      id: "5",
      date: "2023-11-22",
      symbol: "AMZN",
      setup: "Breakout",
      entry: 145.6,
      exit: 149.8,
      pnl: 420.0,
      rr: 1.8,
      adherence: 82,
    },
  ],
}

// Colors for the charts
const COLORS = ["hsl(var(--profit))", "hsl(var(--loss))"]

interface PerformanceDashboardProps {
  strategyId?: string
  className?: string
}

export function PerformanceDashboard({ strategyId, className }: PerformanceDashboardProps) {
  const [timeframe, setTimeframe] = useState("1y")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-medium">Strategy Performance</h3>

          <div className="flex items-center gap-2">
            <Select defaultValue="1y" onValueChange={setTimeframe}>
              <SelectTrigger className="w-[120px] h-8">
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

            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>

            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <TabsList className="grid grid-cols-5 w-full rounded-none bg-background/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equity">Equity Curve</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="conditions">Market Conditions</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <PercentIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/60">Win Rate</h4>
                    <p className="text-2xl font-bold">{mockPerformanceData.summary.winRate}%</p>
                  </div>
                </div>

                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockPerformanceData.winLoss}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockPerformanceData.winLoss.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/60">Profit Factor</h4>
                    <p className="text-2xl font-bold">{mockPerformanceData.summary.profitFactor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="text-sm text-white/60">Avg. Win</h5>
                    <p className="text-xl font-medium text-green-500">${mockPerformanceData.summary.averageWin}</p>
                  </div>
                  <div>
                    <h5 className="text-sm text-white/60">Avg. Loss</h5>
                    <p className="text-xl font-medium text-red-500">${mockPerformanceData.summary.averageLoss}</p>
                  </div>
                  <div>
                    <h5 className="text-sm text-white/60">Total Trades</h5>
                    <p className="text-xl font-medium">{mockPerformanceData.summary.totalTrades}</p>
                  </div>
                  <div>
                    <h5 className="text-sm text-white/60">Expectancy</h5>
                    <p className="text-xl font-medium">{mockPerformanceData.summary.expectancy}R</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h4 className="font-medium mb-4">Equity Growth</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockPerformanceData.equityCurve} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="hsl(var(--profit))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equity" className="mt-0">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
              <h4 className="font-medium mb-4">Equity Curve</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockPerformanceData.equityCurve} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="hsl(var(--profit))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h5 className="text-sm text-white/60">Starting Capital</h5>
                <p className="text-2xl font-bold">$10,000</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h5 className="text-sm text-white/60">Current Equity</h5>
                <p className="text-2xl font-bold">$16,000</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h5 className="text-sm text-white/60">Total Return</h5>
                <p className="text-2xl font-bold text-green-500">+60%</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades" className="mt-0">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
              <h4 className="font-medium mb-4">Recent Trades</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-3 text-white/60 font-medium">Date</th>
                      <th className="text-left py-2 px-3 text-white/60 font-medium">Symbol</th>
                      <th className="text-left py-2 px-3 text-white/60 font-medium">Setup</th>
                      <th className="text-right py-2 px-3 text-white/60 font-medium">Entry</th>
                      <th className="text-right py-2 px-3 text-white/60 font-medium">Exit</th>
                      <th className="text-right py-2 px-3 text-white/60 font-medium">P&L</th>
                      <th className="text-right py-2 px-3 text-white/60 font-medium">R:R</th>
                      <th className="text-right py-2 px-3 text-white/60 font-medium">Adherence</th>
                      <th className="text-right py-2 px-3 text-white/60 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPerformanceData.recentTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3">{trade.date}</td>
                        <td className="py-3 px-3 font-medium">{trade.symbol}</td>
                        <td className="py-3 px-3">{trade.setup}</td>
                        <td className="py-3 px-3 text-right">${trade.entry}</td>
                        <td className="py-3 px-3 text-right">${trade.exit}</td>
                        <td
                          className={`py-3 px-3 text-right font-medium ${
                            trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                        </td>
                        <td className={`py-3 px-3 text-right ${trade.rr >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {trade.rr.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center">
                            <div className="w-12 h-2 rounded-full bg-white/10 mr-2">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${trade.adherence}%` }}
                              ></div>
                            </div>
                            <span>{trade.adherence}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/trades/${trade.id}`}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline">View All Trades</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-0">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
              <h4 className="font-medium mb-4">Trade Distribution</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="R:R"
                      stroke="rgba(255, 255, 255, 0.5)"
                      label={{ value: "Risk-Reward Ratio", position: "insideBottom", offset: -10, fill: "#fff" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="P&L"
                      stroke="rgba(255, 255, 255, 0.5)"
                      label={{ value: "P&L ($)", angle: -90, position: "insideLeft", fill: "#fff" }}
                    />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} name="Volume" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name, props) => {
                        if (name === "P&L") return [`$${value}`, name]
                        if (name === "R:R") return [value, name]
                        return [value, name]
                      }}
                    />
                    <Scatter name="Trades" data={mockPerformanceData.tradeDistribution} fill="#8884d8" shape="circle">
                      {mockPerformanceData.tradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.y >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-sm text-white/60">
                Bubble size represents trade size (number of shares/contracts)
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="mt-0">
            <div className="space-y-4">
              <h4 className="font-medium">Performance by Market Condition</h4>

              {mockPerformanceData.marketConditions.map((condition, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">{condition.condition}</h5>
                    <Badge variant="outline" className="bg-white/10 border-white/20">
                      {condition.trades} trades
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${condition.winRate}%`,
                        }}
                      ></div>
                    </div>
                    <span className="font-medium w-16">{condition.winRate}%</span>
                  </div>
                </div>
              ))}

              <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-6">
                <h4 className="font-medium mb-2">Market Condition Analysis</h4>
                <p className="text-sm text-white/70">
                  This strategy performs best in bullish market conditions with a 78% win rate. Consider being more
                  selective during sideways markets where the win rate drops to 52%.
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </GlassCard>
  )
}
