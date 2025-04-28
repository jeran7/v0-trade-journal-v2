"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassCard } from "@/components/ui/glass-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StrategyCard } from "@/components/playbook/strategy-card"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"

// Mock data for strategies
const mockStrategies = [
  {
    id: "1",
    name: "Breakout Momentum",
    description: "Trading breakouts of key levels with momentum confirmation",
    category: "Breakout",
    winRate: 68,
    profitFactor: 2.3,
    tradesCount: 42,
    marketConditions: ["Trending", "High Volatility"],
    lastUpdated: "2023-11-15T10:30:00Z",
    setupImages: ["/stock-breakout.png"],
    isActive: true,
    tags: ["Momentum", "Volume", "Support/Resistance"],
  },
  {
    id: "2",
    name: "Pullback Entry",
    description: "Entering established trends on pullbacks to key moving averages",
    category: "Trend Following",
    winRate: 55,
    profitFactor: 3.1,
    tradesCount: 78,
    marketConditions: ["Trending", "Low Volatility"],
    lastUpdated: "2023-10-28T14:45:00Z",
    setupImages: ["/stock-pullback-ma.png"],
    isActive: true,
    tags: ["Moving Averages", "Trend", "Retracement"],
  },
  {
    id: "3",
    name: "Range Reversal",
    description: "Trading reversals at the extremes of established ranges",
    category: "Reversal",
    winRate: 62,
    profitFactor: 1.8,
    tradesCount: 35,
    marketConditions: ["Ranging", "Medium Volatility"],
    lastUpdated: "2023-11-05T09:15:00Z",
    setupImages: ["/stock-range-reversal.png"],
    isActive: false,
    tags: ["Range", "Reversal", "Oversold/Overbought"],
  },
  {
    id: "4",
    name: "Gap and Go",
    description: "Trading in the direction of pre-market gaps with volume confirmation",
    category: "Momentum",
    winRate: 72,
    profitFactor: 2.7,
    tradesCount: 29,
    marketConditions: ["Trending", "High Volatility", "News Driven"],
    lastUpdated: "2023-11-12T08:20:00Z",
    setupImages: ["/stock-gap-up.png"],
    isActive: true,
    tags: ["Gaps", "Pre-market", "Volume"],
  },
  {
    id: "5",
    name: "VWAP Reversion",
    description: "Mean reversion strategy using VWAP as a reference point",
    category: "Mean Reversion",
    winRate: 58,
    profitFactor: 1.9,
    tradesCount: 63,
    marketConditions: ["Ranging", "Low Volatility"],
    lastUpdated: "2023-10-20T11:30:00Z",
    setupImages: ["/stock-vwap-reversion.png"],
    isActive: true,
    tags: ["VWAP", "Mean Reversion", "Intraday"],
  },
  {
    id: "6",
    name: "Fibonacci Extension",
    description: "Using Fibonacci extensions to project profit targets in trending markets",
    category: "Trend Following",
    winRate: 64,
    profitFactor: 2.5,
    tradesCount: 47,
    marketConditions: ["Trending", "Medium Volatility"],
    lastUpdated: "2023-11-08T15:45:00Z",
    setupImages: ["/stock-chart-fibonacci.png"],
    isActive: false,
    tags: ["Fibonacci", "Extensions", "Targets"],
  },
]

export default function PlaybookPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortOption, setSortOption] = useState("updated")
  const [marketFilter, setMarketFilter] = useState("all")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Filter strategies based on search query, active filter, and market filter
  const filteredStrategies = mockStrategies.filter((strategy) => {
    const matchesSearch =
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      activeFilter === "all" ||
      (activeFilter === "active" && strategy.isActive) ||
      (activeFilter === "inactive" && !strategy.isActive)

    const matchesMarket =
      marketFilter === "all" ||
      strategy.marketConditions.some((condition) => condition.toLowerCase().includes(marketFilter.toLowerCase()))

    return matchesSearch && matchesStatus && matchesMarket
  })

  // Sort strategies based on sort option
  const sortedStrategies = [...filteredStrategies].sort((a, b) => {
    if (sortOption === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortOption === "winrate") {
      return b.winRate - a.winRate
    } else if (sortOption === "profit") {
      return b.profitFactor - a.profitFactor
    } else {
      // Default: sort by updated date
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    }
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(mockStrategies.map((s) => s.category)))

  return (
    <AppShell>
      <ContentWrapper>
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                  Trading Playbook
                </h1>
                <p className="text-white/70 mt-1">Manage and optimize your trading strategies</p>
              </div>
              <Link href="/playbook/new">
                <Button className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600">
                  <Plus className="mr-2 h-4 w-4" />
                  New Strategy
                </Button>
              </Link>
            </div>

            <GlassCard className="p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
                  <Input
                    placeholder="Search strategies..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-white/50" />
                    <Select value={marketFilter} onValueChange={setMarketFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Market Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Markets</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="ranging">Ranging</SelectItem>
                        <SelectItem value="high">High Volatility</SelectItem>
                        <SelectItem value="low">Low Volatility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-white/50" />
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="updated">Recently Updated</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="winrate">Win Rate</SelectItem>
                        <SelectItem value="profit">Profit Factor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </GlassCard>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all" onClick={() => setActiveFilter("all")}>
                  All
                </TabsTrigger>
                <TabsTrigger value="active" onClick={() => setActiveFilter("active")}>
                  Active
                </TabsTrigger>
                <TabsTrigger value="inactive" onClick={() => setActiveFilter("inactive")}>
                  Inactive
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category.toLowerCase()}
                    onClick={() => setActiveFilter(category.toLowerCase())}
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedStrategies.map((strategy, index) => (
                    <motion.div
                      key={strategy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <StrategyCard strategy={strategy} />
                    </motion.div>
                  ))}
                  {sortedStrategies.length === 0 && (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-white/50">No strategies found. Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* The same content is shown for all tabs, filtering is handled in JS */}
              {["active", "inactive", ...categories.map((c) => c.toLowerCase())].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedStrategies.map((strategy, index) => (
                      <motion.div
                        key={strategy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <StrategyCard strategy={strategy} />
                      </motion.div>
                    ))}
                    {sortedStrategies.length === 0 && (
                      <div className="col-span-3 text-center py-12">
                        <p className="text-white/50">No strategies found. Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
