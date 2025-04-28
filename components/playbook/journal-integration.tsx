"use client"

import { useState } from "react"
import { Book, ArrowUpRight, Calendar, MessageSquare, Search, Filter, Plus } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JournalEntry {
  id: string
  date: string
  title: string
  excerpt: string
  tags: string[]
  sentiment: "positive" | "negative" | "neutral"
  hasImage: boolean
  tradeIds?: string[]
}

interface JournalIntegrationProps {
  strategyId: string
  className?: string
}

// Mock data for journal entries
const mockJournalEntries: JournalEntry[] = [
  {
    id: "1",
    date: "2023-12-15",
    title: "Successful Breakout Trade on AAPL",
    excerpt:
      "Today I executed the breakout strategy on AAPL with excellent results. The setup formed perfectly with volume confirmation...",
    tags: ["Breakout", "Success", "AAPL"],
    sentiment: "positive",
    hasImage: true,
    tradeIds: ["trade-123", "trade-124"],
  },
  {
    id: "2",
    date: "2023-12-10",
    title: "Mixed Results with MSFT Breakout",
    excerpt:
      "Applied the breakout strategy to MSFT today. While the entry was good, I exited too early and missed additional profit...",
    tags: ["Breakout", "MSFT", "Early Exit"],
    sentiment: "neutral",
    hasImage: true,
    tradeIds: ["trade-120"],
  },
  {
    id: "3",
    date: "2023-12-05",
    title: "Failed Breakout on META",
    excerpt:
      "The breakout strategy didn't work well on META today. The price broke out but quickly reversed, hitting my stop loss...",
    tags: ["Breakout", "Failure", "META"],
    sentiment: "negative",
    hasImage: true,
    tradeIds: ["trade-118"],
  },
  {
    id: "4",
    date: "2023-11-28",
    title: "Perfect Execution on NVDA",
    excerpt:
      "One of my best trades using the breakout strategy. NVDA provided a textbook setup and I managed the trade perfectly...",
    tags: ["Breakout", "Success", "NVDA"],
    sentiment: "positive",
    hasImage: false,
    tradeIds: ["trade-115"],
  },
  {
    id: "5",
    date: "2023-11-22",
    title: "Breakout Strategy Refinement",
    excerpt:
      "After reviewing my recent breakout trades, I've identified some patterns that can help improve my execution...",
    tags: ["Breakout", "Strategy Refinement"],
    sentiment: "neutral",
    hasImage: false,
  },
]

// Mock data for insights
const mockInsights = [
  {
    id: "1",
    text: "You have a 72% success rate when trading this strategy in the morning session",
    source: "Based on 25 journal entries over 3 months",
  },
  {
    id: "2",
    text: "Your emotional state significantly impacts this strategy's performance",
    source: "Correlation between reported mood and trade outcomes",
  },
  {
    id: "3",
    text: "You tend to exit trades too early when using this strategy",
    source: "Mentioned in 8 journal entries",
  },
]

export function JournalIntegration({ strategyId, className }: JournalIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("entries")

  const filteredEntries = mockJournalEntries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
            <Book className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Journal Integration</h3>
            <p className="text-sm text-white/60">Entries related to this strategy</p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href={`/journal/new?strategy=${strategyId}`}>
            <Plus className="mr-1 h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search journal entries..."
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

      <Tabs defaultValue="entries" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full rounded-none bg-background/20">
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="entries" className="mt-0 space-y-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-col md:flex-row">
                    {entry.hasImage && (
                      <div className="w-full md:w-1/4 h-32 md:h-auto">
                        <img
                          src={`/stock-market-analysis.png?height=200&width=200&query=trading chart ${entry.tags.join(" ")}`}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-4 ${entry.hasImage ? "md:w-3/4" : "w-full"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-white/50 mr-1" />
                          <span className="text-sm text-white/50">{entry.date}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${entry.sentiment === "positive" ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}
                            ${entry.sentiment === "negative" ? "bg-red-500/20 text-red-400 border-red-500/50" : ""}
                            ${entry.sentiment === "neutral" ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : ""}
                          `}
                        >
                          {entry.sentiment.charAt(0).toUpperCase() + entry.sentiment.slice(1)}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-medium mb-2">{entry.title}</h4>
                      <p className="text-sm text-white/70 mb-3">{entry.excerpt}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-white/5 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        {entry.tradeIds && (
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 text-white/50 mr-1" />
                            <span className="text-sm text-white/50">{entry.tradeIds.length} linked trades</span>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/journal/${entry.id}`}>
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <h4 className="text-lg font-medium mb-1">No journal entries found</h4>
                <p className="text-sm text-white/60 mb-4">
                  {searchQuery
                    ? `No entries match your search for "${searchQuery}"`
                    : "You haven't created any journal entries for this strategy yet"}
                </p>
                <Button asChild>
                  <Link href={`/journal/new?strategy=${strategyId}`}>
                    <Plus className="mr-1 h-4 w-4" />
                    Create Journal Entry
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Journal Insights</h3>

              {mockInsights.map((insight) => (
                <div key={insight.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="font-medium mb-1">{insight.text}</p>
                  <p className="text-sm text-white/60">{insight.source}</p>
                </div>
              ))}

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="font-medium mb-2">Common Themes</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/10 border-white/20 px-3 py-1">
                    Early Exit <span className="ml-1 text-white/50">8 mentions</span>
                  </Badge>
                  <Badge className="bg-white/10 border-white/20 px-3 py-1">
                    Volume Confirmation <span className="ml-1 text-white/50">6 mentions</span>
                  </Badge>
                  <Badge className="bg-white/10 border-white/20 px-3 py-1">
                    Morning Session <span className="ml-1 text-white/50">5 mentions</span>
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </GlassCard>
  )
}
