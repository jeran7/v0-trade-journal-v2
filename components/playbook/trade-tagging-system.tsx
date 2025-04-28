"use client"

import { useState } from "react"
import { Tag, Search, Filter, ArrowUpRight, Plus, X, Check } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Trade {
  id: string
  date: string
  symbol: string
  type: "Long" | "Short"
  entry: number
  exit: number
  pnl: number
  pnlPercent: number
  strategy?: string
  tags: string[]
}

interface TradeTaggingSystemProps {
  className?: string
}

// Mock data for trades
const mockTrades: Trade[] = [
  {
    id: "1",
    date: "2023-12-15",
    symbol: "AAPL",
    type: "Long",
    entry: 175.23,
    exit: 182.67,
    pnl: 744.0,
    pnlPercent: 4.25,
    strategy: "Breakout Momentum",
    tags: ["Gap Up", "High Volume", "Earnings"],
  },
  {
    id: "2",
    date: "2023-12-10",
    symbol: "MSFT",
    type: "Long",
    entry: 320.45,
    exit: 328.8,
    pnl: 835.0,
    pnlPercent: 2.6,
    strategy: "Pullback to Moving Average",
    tags: ["Trend Continuation", "Institutional Support"],
  },
  {
    id: "3",
    date: "2023-12-05",
    symbol: "META",
    type: "Short",
    entry: 290.3,
    exit: 285.15,
    pnl: 515.0,
    pnlPercent: 1.8,
    tags: ["Resistance Rejection", "Overbought"],
  },
  {
    id: "4",
    date: "2023-11-28",
    symbol: "NVDA",
    type: "Long",
    entry: 450.75,
    exit: 468.2,
    pnl: 1745.0,
    pnlPercent: 3.9,
    strategy: "Breakout Momentum",
    tags: ["Sector Strength", "Volume Surge"],
  },
  {
    id: "5",
    date: "2023-11-22",
    symbol: "AMZN",
    type: "Long",
    entry: 145.6,
    exit: 149.8,
    pnl: 420.0,
    pnlPercent: 2.9,
    tags: ["Support Bounce", "Oversold"],
  },
]

// Mock data for strategies
const mockStrategies = [
  { id: "1", name: "Breakout Momentum" },
  { id: "2", name: "Pullback to Moving Average" },
  { id: "3", name: "Range Reversal" },
  { id: "4", name: "Gap Fill" },
  { id: "5", name: "VWAP Reversion" },
]

// Mock data for common tags
const mockCommonTags = [
  "Gap Up",
  "Gap Down",
  "High Volume",
  "Low Volume",
  "Earnings",
  "Trend Continuation",
  "Trend Reversal",
  "Support Bounce",
  "Resistance Rejection",
  "Oversold",
  "Overbought",
  "Sector Strength",
  "Institutional Support",
  "Volume Surge",
]

export function TradeTaggingSystem({ className }: TradeTaggingSystemProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [trades, setTrades] = useState(mockTrades)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [isTaggingDialogOpen, setIsTaggingDialogOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const filteredTrades = trades.filter(
    (trade) =>
      trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.strategy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const openTaggingDialog = (trade: Trade) => {
    setSelectedTrade(trade)
    setSelectedStrategy(trade.strategy || "")
    setSelectedTags([...trade.tags])
    setIsTaggingDialogOpen(true)
  }

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const saveTags = () => {
    if (selectedTrade) {
      const updatedTrades = trades.map((trade) =>
        trade.id === selectedTrade.id
          ? {
              ...trade,
              strategy: selectedStrategy,
              tags: selectedTags,
            }
          : trade,
      )
      setTrades(updatedTrades)
      setIsTaggingDialogOpen(false)
    }
  }

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
            <Tag className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Trade Tagging System</h3>
            <p className="text-sm text-white/60">Organize trades by strategy and tags</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search trades..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/60 font-medium">Date</th>
                <th className="text-left py-2 px-3 text-white/60 font-medium">Symbol</th>
                <th className="text-left py-2 px-3 text-white/60 font-medium">Type</th>
                <th className="text-right py-2 px-3 text-white/60 font-medium">P&L</th>
                <th className="text-left py-2 px-3 text-white/60 font-medium">Strategy</th>
                <th className="text-left py-2 px-3 text-white/60 font-medium">Tags</th>
                <th className="text-right py-2 px-3 text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3">{trade.date}</td>
                  <td className="py-3 px-3 font-medium">{trade.symbol}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant="outline"
                      className={
                        trade.type === "Long"
                          ? "bg-green-500/20 text-green-400 border-green-500/50"
                          : "bg-red-500/20 text-red-400 border-red-500/50"
                      }
                    >
                      {trade.type}
                    </Badge>
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-medium ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl} ({trade.pnlPercent}%)
                  </td>
                  <td className="py-3 px-3">
                    {trade.strategy ? (
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        {trade.strategy}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white/10 border-white/20">
                        Unassigned
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {trade.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-white/5 text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {trade.tags.length > 2 && (
                        <Badge variant="secondary" className="bg-white/5 text-xs">
                          +{trade.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openTaggingDialog(trade)}>
                        <Tag className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/trades/${trade.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isTaggingDialogOpen} onOpenChange={setIsTaggingDialogOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10">
          <DialogHeader>
            <DialogTitle>Tag Trade: {selectedTrade?.symbol}</DialogTitle>
            <DialogDescription>Assign a strategy and tags to this trade</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Strategy</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {mockStrategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.name}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-white/10 flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Common Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {mockCommonTags
                  .filter((tag) => !selectedTags.includes(tag))
                  .slice(0, 8)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-white/5 cursor-pointer hover:bg-white/10"
                      onClick={() => setSelectedTags([...selectedTags, tag])}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaggingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTags}>
              <Check className="mr-2 h-4 w-4" />
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GlassCard>
  )
}
