"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { BarChart, Brain, Calendar, LineChart, Tag, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data for journal analytics
const moodData = [
  { date: "Jan 1", mood: "Confident", score: 4 },
  { date: "Jan 2", mood: "Focused", score: 5 },
  { date: "Jan 3", mood: "Anxious", score: 2 },
  { date: "Jan 4", mood: "Calm", score: 3 },
  { date: "Jan 5", mood: "Excited", score: 4 },
  { date: "Jan 6", mood: "Frustrated", score: 2 },
  { date: "Jan 7", mood: "Confident", score: 4 },
  { date: "Jan 8", mood: "Focused", score: 5 },
  { date: "Jan 9", mood: "Calm", score: 3 },
  { date: "Jan 10", mood: "Disappointed", score: 1 },
]

const topTags = [
  { tag: "Breakout", count: 15 },
  { tag: "Risk Management", count: 12 },
  { tag: "Patience", count: 10 },
  { tag: "Discipline", count: 8 },
  { tag: "Overtrading", count: 7 },
  { tag: "FOMO", count: 6 },
  { tag: "Position Sizing", count: 5 },
  { tag: "Market Analysis", count: 4 },
]

const insights = [
  {
    id: "1",
    text: "You tend to perform better when your pre-market analysis is thorough",
    source: "Pattern detected across 12 journal entries",
    confidence: "High",
  },
  {
    id: "2",
    text: "Trades made when feeling 'Anxious' have a 35% lower win rate",
    source: "Correlation analysis of mood and performance",
    confidence: "Medium",
  },
  {
    id: "3",
    text: "Your most common mistake is entering trades too early",
    source: "Mentioned in 8 journal entries",
    confidence: "High",
  },
  {
    id: "4",
    text: "You've shown improvement in position sizing discipline over the last month",
    source: "Trend analysis of journal entries",
    confidence: "Medium",
  },
]

interface JournalAnalyticsDashboardProps {
  className?: string
}

export function JournalAnalyticsDashboard({ className }: JournalAnalyticsDashboardProps) {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("insights")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getMoodColor = (score: number) => {
    if (score >= 4) return "bg-profit/20 text-profit"
    if (score <= 2) return "bg-loss/20 text-loss"
    return "bg-neutral/20 text-neutral"
  }

  if (!isClient) {
    return null
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">
            <Brain className="mr-2 h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="mood">
            <TrendingUp className="mr-2 h-4 w-4" />
            Mood Tracking
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Tag className="mr-2 h-4 w-4" />
            Common Themes
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Calendar className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">AI-Generated Insights</h3>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <GlassCard key={i} className="h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight) => (
                <GlassCard key={insight.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-accent/50 p-1.5">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{insight.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{insight.source}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence} confidence
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mood" className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Mood Tracking</h3>

          {isLoading ? (
            <GlassCard className="h-64 animate-pulse" />
          ) : (
            <GlassCard className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">Mood Timeline</h4>
                <Badge variant="outline">Last 10 Entries</Badge>
              </div>

              <div className="space-y-2">
                {moodData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-16 text-xs text-muted-foreground">{entry.date}</div>
                    <div className="relative h-8 flex-1 rounded-md bg-muted">
                      <div
                        className={cn("absolute inset-y-0 left-0 rounded-md", getMoodColor(entry.score))}
                        style={{ width: `${(entry.score / 5) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium">{entry.mood}</span>
                      </div>
                    </div>
                    <div className="w-8 text-center text-xs font-medium">{entry.score}/5</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div>Average Mood: 3.3/5</div>
                <div>Most Common: Confident</div>
              </div>
            </GlassCard>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard className="p-4">
              <h4 className="mb-4 font-medium">Mood vs. Performance</h4>
              <div className="flex h-40 items-center justify-center">
                <LineChart className="h-20 w-20 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Chart visualization would go here</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <h4 className="mb-4 font-medium">Mood Distribution</h4>
              <div className="flex h-40 items-center justify-center">
                <BarChart className="h-20 w-20 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Chart visualization would go here</span>
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Common Themes & Tags</h3>

          {isLoading ? (
            <GlassCard className="h-64 animate-pulse" />
          ) : (
            <GlassCard className="p-4">
              <h4 className="mb-4 font-medium">Most Used Tags</h4>

              <div className="space-y-2">
                {topTags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-32 text-sm">{tag.tag}</div>
                    <div className="relative h-8 flex-1 rounded-md bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded-md bg-primary/20"
                        style={{ width: `${(tag.count / topTags[0].count) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium">{tag.count} entries</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-4">
            <h4 className="mb-4 font-medium">Word Cloud</h4>
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-muted-foreground">
              <span className="text-sm text-muted-foreground">Word cloud visualization would go here</span>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="activity" className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Journaling Activity</h3>

          <GlassCard className="p-4">
            <h4 className="mb-4 font-medium">Journal Entry Calendar</h4>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-muted-foreground">
              <span className="text-sm text-muted-foreground">Calendar heatmap would go here</span>
            </div>
          </GlassCard>

          <div className="grid gap-4 md:grid-cols-3">
            <GlassCard className="flex flex-col items-center justify-center p-4">
              <div className="text-3xl font-bold">24</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </GlassCard>

            <GlassCard className="flex flex-col items-center justify-center p-4">
              <div className="text-3xl font-bold">3.5</div>
              <div className="text-sm text-muted-foreground">Entries per Week</div>
            </GlassCard>

            <GlassCard className="flex flex-col items-center justify-center p-4">
              <div className="text-3xl font-bold">85%</div>
              <div className="text-sm text-muted-foreground">Trade Documentation</div>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
