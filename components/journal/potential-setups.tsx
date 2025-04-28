"use client"

import { ArrowRight, Calendar, Eye, Star } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SemanticBadge } from "@/components/ui/semantic-badge"

export function PotentialSetups() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Potential Setups</h2>
        <Button variant="ghost" size="sm" className="gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {potentialSetups.map((setup) => (
          <div
            key={setup.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/10 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {setup.isFavorite ? (
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              ) : (
                <div className={`h-5 w-5 rounded-full ${getMarketConditionColor(setup.marketCondition)}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">
                  {setup.symbol} {setup.name}
                </h3>
                <SemanticBadge type={setup.direction === "Long" ? "success" : "danger"} size="sm">
                  {setup.direction}
                </SemanticBadge>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{setup.date}</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {setup.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// Helper function to get market condition color
function getMarketConditionColor(condition: string) {
  switch (condition) {
    case "Bullish":
      return "bg-profit/20 text-profit"
    case "Bearish":
      return "bg-loss/20 text-loss"
    case "Neutral":
      return "bg-amber-500/20 text-amber-500"
    case "Volatile":
      return "bg-purple-500/20 text-purple-500"
    default:
      return "bg-muted text-muted-foreground"
  }
}

// Mock data for potential setups
const potentialSetups = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Bull Flag",
    direction: "Long",
    date: "Today, 2:30 PM",
    marketCondition: "Bullish",
    isFavorite: true,
    tags: ["Daily Timeframe", "High Probability"],
  },
  {
    id: "2",
    symbol: "TSLA",
    name: "Double Bottom",
    direction: "Long",
    date: "Today, 1:15 PM",
    marketCondition: "Neutral",
    isFavorite: false,
    tags: ["Support Level", "Volume Confirmation"],
  },
  {
    id: "3",
    symbol: "MSFT",
    name: "Head & Shoulders",
    direction: "Short",
    date: "Tomorrow",
    marketCondition: "Bearish",
    isFavorite: false,
    tags: ["4H Timeframe", "Pending"],
  },
]
