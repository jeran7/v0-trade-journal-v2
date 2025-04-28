"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  ImageIcon,
  Percent,
  Share2,
  Tag,
  Trash,
  X,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SemanticCard } from "@/components/ui/semantic-card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { TradeTimeline } from "@/components/ui/trade-timeline"
import { TradeJournal } from "@/components/ui/trade-journal"

interface TradeDetailViewProps {
  tradeId: string
  onBack?: () => void
}

export function TradeDetailView({ tradeId, onBack }: TradeDetailViewProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("chart")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Fetch trade data
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [tradeId])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  // Mock trade data
  const trade = {
    id: tradeId,
    symbol: "AAPL",
    type: "Long",
    entry: 175.23,
    exit: 182.67,
    size: 100,
    pnl: 744.0,
    pnlPercent: 4.25,
    date: "2023-12-15",
    time: "10:45 AM",
    duration: "2h 15m",
    setup: "Breakout",
    tags: ["Gap Up", "High Volume", "Earnings"],
    notes:
      "Strong momentum after earnings beat. Entered on breakout of previous day's high with increased volume. Exited when price reached resistance level and volume started to decrease.",
    commission: 9.99,
    fees: 1.25,
    slippage: 0.03,
    riskReward: {
      risk: 200,
      reward: 744,
      ratio: 3.72,
    },
    planCompliance: 85,
    strategyAdherence: 92,
    timeline: [
      {
        id: "1",
        time: "10:30 AM",
        title: "Trade Idea",
        description: "Identified potential breakout setup after earnings beat",
        type: "idea" as const,
      },
      {
        id: "2",
        time: "10:45 AM",
        title: "Entry",
        description: "Entered long position at $175.23",
        type: "entry" as const,
      },
      {
        id: "3",
        time: "11:15 AM",
        title: "Stop Loss",
        description: "Set stop loss at $173.23 (1% risk)",
        type: "stop" as const,
      },
      {
        id: "4",
        time: "12:30 PM",
        title: "Price Consolidation",
        description: "Price consolidated near $178, maintained position",
        type: "adjustment" as const,
      },
      {
        id: "5",
        time: "1:00 PM",
        title: "Exit",
        description: "Exited position at $182.67 as volume decreased",
        type: "exit" as const,
      },
    ],
    screenshots: ["/annotated-stock-chart.png", "/stock-trade-analysis.png", "/stock-chart-analysis.png"],
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>

            <div>
              <h1 className="text-3xl font-bold tracking-tight font-sf-pro">
                {trade.symbol} {trade.type} Trade
              </h1>
              <p className="text-muted-foreground">
                {trade.date} • {trade.setup}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="md:col-span-2">
            <GlassCard className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {/* TradingView Chart would go here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ExternalLink className="h-8 w-8 mb-2 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">TradingView Chart Integration</p>
                    <p className="text-xs text-muted-foreground">Showing {trade.symbol} with entry/exit points</p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View in TradingView
                  </Button>
                  <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                    <Download className="mr-2 h-4 w-4" />
                    Save Chart
                  </Button>
                </div>
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      trade.type === "Long" ? "bg-profit/20" : "bg-loss/20"
                    }`}
                  >
                    {trade.type === "Long" ? (
                      <ArrowUp className="h-5 w-5 text-profit" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-loss" />
                    )}
                  </div>

                  <div>
                    <div className="text-xl font-bold">{trade.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {trade.type} • {trade.setup}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-profit">
                    <AnimatedNumber value={trade.pnl} formatValue={(val) => `$${val.toFixed(2)}`} duration={1500} />
                  </div>
                  <div className="text-sm text-profit">+{trade.pnlPercent.toFixed(2)}%</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <SemanticCard type={trade.pnl > 0 ? "success" : "danger"} variant="border" className="overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Trade Metrics</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Entry</div>
                    <div className="font-medium">${trade.entry.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Exit</div>
                    <div className="font-medium">${trade.exit.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Size</div>
                    <div className="font-medium">{trade.size} shares</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="font-medium">{trade.duration}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Risk</span>
                    </div>
                    <span className="font-medium">${trade.riskReward.risk.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Reward</span>
                    </div>
                    <span className="font-medium">${trade.riskReward.reward.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">R:R Ratio</span>
                    </div>
                    <span className="font-medium">1:{trade.riskReward.ratio.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Commission</span>
                    <span className="font-medium">${trade.commission.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fees</span>
                    <span className="font-medium">${trade.fees.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Slippage</span>
                    <span className="font-medium">${trade.slippage.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </SemanticCard>

            <GlassCard>
              <h3 className="text-lg font-semibold mb-4">Strategy Adherence</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plan Compliance</span>
                    <span className="font-medium">{trade.planCompliance}%</span>
                  </div>
                  <Progress value={trade.planCompliance} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Strategy Adherence</span>
                    <span className="font-medium">{trade.strategyAdherence}%</span>
                  </div>
                  <Progress value={trade.strategyAdherence} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {trade.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="chart" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chart">Chart Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="journal">Journal</TabsTrigger>
              <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-4">
              <GlassCard>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Chart Analysis</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Technical Analysis</h4>
                      <p className="text-muted-foreground">
                        AAPL broke out of a consolidation pattern on high volume after earnings. The breakout occurred
                        above the previous day's high of $174.50, with strong momentum and increasing volume confirming
                        the move.
                      </p>

                      <h4 className="font-medium mt-6">Key Levels</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Entry Level</span>
                          <span className="font-medium">${trade.entry.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Stop Loss</span>
                          <span className="font-medium">${(trade.entry * 0.99).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Target 1</span>
                          <span className="font-medium">${(trade.entry * 1.02).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Target 2</span>
                          <span className="font-medium">${(trade.entry * 1.04).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Actual Exit</span>
                          <span className="font-medium">${trade.exit.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Market Context</h4>
                      <p className="text-muted-foreground">
                        The broader market was bullish with the S&P 500 up 0.8% on the day. The technology sector was
                        particularly strong following positive earnings from several key companies. AAPL had reported
                        earnings the previous day, beating expectations on both revenue and EPS.
                      </p>

                      <h4 className="font-medium mt-6">Trade Execution</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-profit" />
                          <span>Entry executed at planned level with minimal slippage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-profit" />
                          <span>Stop loss placed at support level with 1% risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-profit" />
                          <span>Exited at resistance level as volume decreased</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-loss" />
                          <span>Could have taken partial profits at first target</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <GlassCard>
                <div className="p-4">
                  <TradeTimeline events={trade.timeline} />
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="journal" className="mt-4">
              <GlassCard>
                <div className="p-4">
                  <TradeJournal initialNotes={trade.notes} />
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="screenshots" className="mt-4">
              <GlassCard>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Screenshots & Images</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trade.screenshots.map((screenshot, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-lg border border-border">
                        <img
                          src={screenshot || "/placeholder.svg"}
                          alt={`Trade screenshot ${index + 1}`}
                          className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-3 w-full">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white">Screenshot {index + 1}</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-center border border-dashed border-border rounded-lg aspect-video bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Add Screenshot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Delete Trade</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this trade? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Trade
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
