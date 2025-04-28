"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, Plus, RefreshCw } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SemanticBadge } from "@/components/ui/semantic-badge"
import { SemanticCard } from "@/components/ui/semantic-card"
import { TradeList } from "@/components/journal/trade-list"
import { QuickAddTradeForm } from "@/components/journal/quick-add-trade-form"
import { PerformanceSnapshot } from "@/components/journal/performance-snapshot"
import { PotentialSetups } from "@/components/journal/potential-setups"
import { ImportCleanupTools } from "@/components/journal/import-cleanup-tools"
import { useToast } from "@/hooks/use-toast"

export function TradeJournalDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [journalStats, setJournalStats] = useState<any>(null)
  const [activeView, setActiveView] = useState<"dashboard" | "list" | "import">("dashboard")
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  useEffect(() => {
    const fetchJournalStats = async () => {
      setIsLoading(true)
      try {
        // This would be replaced with a real API call to get journal statistics
        // For now, we'll simulate some data
        setTimeout(() => {
          setJournalStats({
            totalEntries: 24,
            entriesByMood: {
              confident: 8,
              excited: 5,
              calm: 4,
              neutral: 3,
              anxious: 2,
              frustrated: 2,
            },
            entriesByMonth: {
              "Jan 2023": 2,
              "Feb 2023": 3,
              "Mar 2023": 5,
              "Apr 2023": 4,
              "May 2023": 6,
              "Jun 2023": 4,
            },
            topTags: [
              { tag: "breakout", count: 7 },
              { tag: "psychology", count: 5 },
              { tag: "discipline", count: 4 },
              { tag: "trend-following", count: 3 },
              { tag: "mistake", count: 3 },
            ],
            averageConfidence: 6.8,
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching journal statistics:", error)
        toast({
          title: "Error",
          description: "Failed to load journal statistics",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchJournalStats()
  }, [toast])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!journalStats) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No journal data available.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sf-pro">Trade Journal</h1>
          <p className="text-muted-foreground">Track, analyze, and improve your trading performance</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveView("import")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button size="sm" onClick={() => setIsQuickAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Trades</TabsTrigger>
            <TabsTrigger value="winning">Winning</TabsTrigger>
            <TabsTrigger value="losing">Losing</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={activeView === "dashboard" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={activeView === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("list")}
            >
              List View
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div variants={itemVariants} className="md:col-span-2">
                <GlassCard className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Trades</h2>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recentTrades.map((trade) => (
                      <RecentTradeCard key={trade.id} trade={trade} />
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <PerformanceSnapshot />
                <PotentialSetups />
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-3">
                <TradeList compact={true} limit={5} />
              </motion.div>
            </motion.div>
          )}

          {activeView === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TradeList />
            </motion.div>
          )}

          {activeView === "import" && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ImportCleanupTools />
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>

      <AnimatePresence>
        {isQuickAddOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <QuickAddTradeForm onClose={() => setIsQuickAddOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Recent Trade Card Component
interface RecentTradeProps {
  id: string
  symbol: string
  type: "Long" | "Short"
  entry: number
  exit: number | null
  size: number
  pnl: number | null
  pnlPercent: number | null
  date: string
  time: string
  setup: string
  status: "open" | "closed"
}

function RecentTradeCard({ trade }: { trade: RecentTradeProps }) {
  const isProfitable = trade.pnl !== null && trade.pnl > 0
  const isLoss = trade.pnl !== null && trade.pnl < 0

  return (
    <SemanticCard
      type={isProfitable ? "success" : isLoss ? "danger" : "insight"}
      variant="border"
      className="transition-all hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              trade.type === "Long" ? "bg-blue-500/20 text-blue-500" : "bg-purple-500/20 text-purple-500"
            }`}
          >
            {trade.type === "Long" ? "L" : "S"}
          </div>

          <div>
            <div className="font-medium">{trade.symbol}</div>
            <div className="text-xs text-muted-foreground">
              {trade.setup} • {trade.date}
            </div>
          </div>
        </div>

        <div className="text-right">
          {trade.status === "closed" ? (
            <>
              <div className={`font-medium ${isProfitable ? "text-profit" : "text-loss"}`}>
                {isProfitable ? "+" : ""}
                {trade.pnl?.toFixed(2)}
              </div>
              <div className={`text-xs ${isProfitable ? "text-profit" : "text-loss"}`}>
                {isProfitable ? "+" : ""}
                {trade.pnlPercent?.toFixed(2)}%
              </div>
            </>
          ) : (
            <SemanticBadge type="insight" size="sm">
              Open
            </SemanticBadge>
          )}
        </div>
      </div>
    </SemanticCard>
  )
}

// Mock data for recent trades
const recentTrades: RecentTradeProps[] = [
  {
    id: "1",
    symbol: "AAPL",
    type: "Long",
    entry: 175.23,
    exit: 182.67,
    size: 100,
    pnl: 744.0,
    pnlPercent: 4.25,
    date: "Today, 10:45 AM",
    time: "10:45 AM",
    setup: "Breakout",
    status: "closed",
  },
  {
    id: "2",
    symbol: "MSFT",
    type: "Long",
    entry: 340.12,
    exit: 352.45,
    size: 50,
    pnl: 616.5,
    pnlPercent: 3.62,
    date: "Today, 9:30 AM",
    time: "9:30 AM",
    setup: "Pullback",
    status: "closed",
  },
  {
    id: "3",
    symbol: "TSLA",
    type: "Short",
    entry: 245.67,
    exit: 238.21,
    size: 75,
    pnl: 559.5,
    pnlPercent: 3.04,
    date: "Yesterday",
    time: "3:15 PM",
    setup: "Reversal",
    status: "closed",
  },
  {
    id: "4",
    symbol: "NVDA",
    type: "Long",
    entry: 465.23,
    exit: null,
    size: 25,
    pnl: null,
    pnlPercent: null,
    date: "Today, 11:20 AM",
    time: "11:20 AM",
    setup: "Breakout",
    status: "open",
  },
]
