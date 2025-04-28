"use client"

import type React from "react"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { CheckCircle, AlertCircle, Info, ArrowUpRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data for the adherence analysis
const mockAdherenceData = {
  overall: 78,
  categories: [
    { name: "Entry Rules", adherence: 85, impact: "high" },
    { name: "Exit Rules", adherence: 62, impact: "critical" },
    { name: "Position Sizing", adherence: 91, impact: "medium" },
    { name: "Trade Management", adherence: 73, impact: "high" },
    { name: "Risk Parameters", adherence: 88, impact: "medium" },
    { name: "Timing", adherence: 70, impact: "high" },
  ],
  recentTrades: [
    { id: 1, date: "2023-04-15", symbol: "AAPL", adherence: 95, profit: true },
    { id: 2, date: "2023-04-12", symbol: "MSFT", adherence: 60, profit: false },
    { id: 3, date: "2023-04-10", symbol: "AMZN", adherence: 82, profit: true },
    { id: 4, date: "2023-04-08", symbol: "GOOGL", adherence: 75, profit: true },
    { id: 5, date: "2023-04-05", symbol: "META", adherence: 45, profit: false },
  ],
  suggestions: [
    "Improve discipline on exit rules - this has the highest impact on performance",
    "Consider setting automated stop losses to enforce exit rules",
    "Your position sizing adherence is strong - continue this practice",
    "Review trade management rules for clarity and simplicity",
  ],
  missedSteps: [
    { step: "Set stop loss immediately after entry", frequency: 42, impact: "critical" },
    { step: "Wait for volume confirmation before entry", frequency: 35, impact: "high" },
    { step: "Take partial profits at first target", frequency: 28, impact: "medium" },
    { step: "Document trade setup before entry", frequency: 22, impact: "low" },
    { step: "Check market internals before trade", frequency: 18, impact: "medium" },
  ],
}

// Helper function to get color based on adherence value
const getAdherenceColor = (value: number) => {
  if (value >= 85) return "hsl(var(--profit))"
  if (value >= 70) return "hsl(var(--neutral))"
  return "hsl(var(--loss))"
}

// Helper function to get impact color
const getImpactColor = (impact: string) => {
  if (impact === "critical") return "hsl(var(--loss))"
  if (impact === "high") return "hsl(var(--loss-light))"
  if (impact === "medium") return "hsl(var(--neutral))"
  return "hsl(var(--profit))"
}

interface AdherenceAnalyzerProps {
  strategyId?: string
  className?: string
}

export function AdherenceAnalyzer({ strategyId, className }: AdherenceAnalyzerProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-medium">Strategy Adherence Analysis</h3>
        </div>

        <TabsList className="grid grid-cols-4 w-full rounded-none bg-background/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          <TabsTrigger value="suggestions">Improvement</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="overview" className="mt-0">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6">
                <h3 className="text-xl font-medium mb-2">Overall Strategy Adherence</h3>
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={getAdherenceColor(mockAdherenceData.overall)}
                      strokeWidth="10"
                      strokeDasharray={`${(2 * Math.PI * 45 * mockAdherenceData.overall) / 100} ${2 * Math.PI * 45 * (1 - mockAdherenceData.overall / 100)}`}
                      strokeDashoffset={2 * Math.PI * 45 * 0.25}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold">{mockAdherenceData.overall}%</span>
                    <span className="text-sm text-white/60">Adherence</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center space-x-3">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                  <div>
                    <h4 className="font-medium">Strongest Area</h4>
                    <p className="text-sm text-white/60">Position Sizing (91%)</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center space-x-3">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                  <div>
                    <h4 className="font-medium">Weakest Area</h4>
                    <p className="text-sm text-white/60">Exit Rules (62%)</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center space-x-3">
                  <Info className="h-10 w-10 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Highest Impact</h4>
                    <p className="text-sm text-white/60">Exit Rules (Critical)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="font-medium mb-4">Most Frequently Missed Steps</h4>
                <div className="space-y-3">
                  {mockAdherenceData.missedSteps.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getImpactColor(step.impact) }}
                        ></div>
                        <span className="text-sm">{step.step}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: getImpactColor(step.impact), opacity: 0.2 }}
                        >
                          {step.impact.toUpperCase()}
                        </span>
                        <span className="text-sm">{step.frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Adherence by Category</h3>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockAdherenceData.categories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="adherence" radius={[4, 4, 0, 0]}>
                      {mockAdherenceData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getAdherenceColor(entry.adherence)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {mockAdherenceData.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{category.name}</span>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: getImpactColor(category.impact), opacity: 0.2 }}
                        >
                          {category.impact.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{category.adherence}%</span>
                    </div>
                    <Progress
                      value={category.adherence}
                      className="h-2"
                      style={
                        {
                          "--progress-background": "rgba(255, 255, 255, 0.1)",
                          "--progress-foreground": getAdherenceColor(category.adherence),
                        } as React.CSSProperties
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Recent Trades Adherence</h3>

              <div className="space-y-4">
                {mockAdherenceData.recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="bg-white/5 p-4 rounded-lg border border-white/10 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{trade.symbol}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            trade.profit ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {trade.profit ? "PROFIT" : "LOSS"}
                        </span>
                      </div>
                      <p className="text-sm text-white/60">{trade.date}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${trade.adherence}%`,
                            backgroundColor: getAdherenceColor(trade.adherence),
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">{trade.adherence}%</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/trades/${trade.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-6">
                <h4 className="font-medium mb-2">Correlation Analysis</h4>
                <p className="text-sm text-white/70">
                  Trades with adherence above 80% have a 75% chance of being profitable. Trades with adherence below 60%
                  have only a 15% chance of being profitable.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Improvement Suggestions</h3>

              <div className="space-y-4">
                {mockAdherenceData.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-start space-x-3"
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-500 text-sm font-medium">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-white/90">{suggestion}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-6">
                <h4 className="font-medium mb-2">Most Frequently Missed Steps</h4>
                <div className="space-y-3 mt-4">
                  {mockAdherenceData.missedSteps.map((step, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getImpactColor(step.impact) }}
                        ></div>
                        <span className="text-sm">{step.step}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: getImpactColor(step.impact), opacity: 0.2 }}
                        >
                          {step.impact.toUpperCase()}
                        </span>
                        <span className="text-sm">{step.frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </GlassCard>
  )
}
