"use client"

import { useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit,
  Share2,
  Star,
  Tag,
  TrendingUp,
  BarChart2,
  Calculator,
  History,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PerformanceDashboard } from "@/components/playbook/performance-dashboard"
import { AdherenceAnalyzer } from "@/components/playbook/adherence-analyzer"
import { RiskCalculator } from "@/components/playbook/risk-calculator"
import { JournalIntegration } from "@/components/playbook/journal-integration"
import { TradeTaggingSystem } from "@/components/playbook/trade-tagging-system"
import { Header } from "@/components/navigation/header"
import { Sidebar } from "@/components/navigation/sidebar"

// Mock data for the strategy
const mockStrategy = {
  id: "1",
  name: "Breakout Momentum",
  description:
    "Trading breakouts of key levels with momentum confirmation. This strategy focuses on identifying consolidation patterns and trading the breakout with volume confirmation.",
  category: "Breakout",
  winRate: 68,
  profitFactor: 2.3,
  tradesCount: 124,
  avgRR: 1.8,
  created: "2023-09-15",
  updated: "2023-11-02",
  tags: ["Momentum", "Breakout", "Volume", "Intraday"],
  author: "John Trader",
  isFavorite: true,
  marketConditions: ["Trending", "High Volume"],
  timeframes: ["15m", "1h", "4h"],
  instruments: ["Stocks", "Futures"],
  performance: {
    monthly: [2.1, 3.4, -1.2, 4.5, 2.8, 1.9, 3.2, -0.8, 5.1, 2.7, 3.9, 2.2],
    byMarketCondition: {
      trending: 3.8,
      ranging: 1.2,
      volatile: 2.1,
      lowVolume: 0.9,
    },
  },
}

export default function StrategyDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isFavorite, setIsFavorite] = useState(mockStrategy.isFavorite)
  const [isClient, setIsClient] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // In a real app, fetch strategy by params.id
  const strategy = mockStrategy

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/playbook">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to playbook</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-sf-pro">{strategy.name}</h1>
                <div className="flex items-center gap-3 text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Tag size={14} />
                    <span>{strategy.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Updated {strategy.updated}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{strategy.tradesCount} trades</span>
                  </div>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFavorite}
                  className={isFavorite ? "text-yellow-400" : ""}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/playbook/${strategy.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>

            {/* Strategy Overview Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <GlassCard className="md:col-span-2">
                <div className="flex flex-col gap-4 p-6">
                  <h2 className="text-xl font-semibold font-sf-pro">Strategy Overview</h2>
                  <p className="text-muted-foreground">{strategy.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/20 rounded-lg p-4">
                      <div className="text-muted-foreground text-sm mb-1">Win Rate</div>
                      <div className="text-2xl font-bold">{strategy.winRate}%</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-4">
                      <div className="text-muted-foreground text-sm mb-1">Profit Factor</div>
                      <div className="text-2xl font-bold">{strategy.profitFactor}</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-4">
                      <div className="text-muted-foreground text-sm mb-1">Avg R:R</div>
                      <div className="text-2xl font-bold">{strategy.avgRR}</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-4">
                      <div className="text-muted-foreground text-sm mb-1">Trades</div>
                      <div className="text-2xl font-bold">{strategy.tradesCount}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {strategy.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                <div className="flex flex-col gap-4 p-6">
                  <h2 className="text-xl font-semibold font-sf-pro">Market Conditions</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-muted-foreground mb-2">Best Performance In</div>
                      <div className="flex flex-wrap gap-2">
                        {strategy.marketConditions.map((condition, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-500/20 text-green-400 border-green-500/50"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-2">Timeframes</div>
                      <div className="flex flex-wrap gap-2">
                        {strategy.timeframes.map((timeframe, index) => (
                          <Badge key={index} variant="secondary">
                            {timeframe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-2">Instruments</div>
                      <div className="flex flex-wrap gap-2">
                        {strategy.instruments.map((instrument, index) => (
                          <Badge key={index} variant="secondary">
                            {instrument}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-1 mb-6 mt-6 pb-2">
              {[
                { id: "overview", label: "Overview", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
                { id: "performance", label: "Performance", icon: <TrendingUp className="h-4 w-4 mr-2" /> },
                { id: "adherence", label: "Adherence", icon: <Brain className="h-4 w-4 mr-2" /> },
                { id: "risk", label: "Risk Calculator", icon: <Calculator className="h-4 w-4 mr-2" /> },
                { id: "journal", label: "Journal", icon: <BookOpen className="h-4 w-4 mr-2" /> },
                { id: "trades", label: "Trades", icon: <Tag className="h-4 w-4 mr-2" /> },
                { id: "history", label: "History", icon: <History className="h-4 w-4 mr-2" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center ${
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary"
                      : "bg-transparent text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mb-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Strategy Performance</h2>
                  <PerformanceDashboard strategyId={strategy.id} />
                </div>
              )}

              {activeTab === "performance" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Detailed Performance Analysis</h2>
                  <PerformanceDashboard strategyId={strategy.id} />
                </div>
              )}

              {activeTab === "adherence" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Strategy Adherence</h2>
                  <AdherenceAnalyzer strategyId={strategy.id} />
                </div>
              )}

              {activeTab === "risk" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Risk Management</h2>
                  <RiskCalculator />
                </div>
              )}

              {activeTab === "journal" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Journal Integration</h2>
                  <JournalIntegration strategyId={strategy.id} />
                </div>
              )}

              {activeTab === "trades" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Trade Tagging</h2>
                  <TradeTaggingSystem />
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Version History</h2>
                  <GlassCard>
                    <div className="p-6">
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h4 className="text-lg font-medium mb-1">Version History Coming Soon</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          This feature is currently under development.
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
