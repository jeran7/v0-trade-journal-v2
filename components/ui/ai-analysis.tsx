"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Brain, Check, ChevronDown, ChevronUp, Lightbulb, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AnalysisPoint {
  id: string
  type: "strength" | "weakness" | "insight" | "suggestion"
  title: string
  description: string
  impact: "high" | "medium" | "low"
}

interface SimilarTrade {
  id: string
  symbol: string
  date: string
  setup: string
  pnl: number
  similarity: number
}

interface AIAnalysisProps {
  points: AnalysisPoint[]
  similarTrades: SimilarTrade[]
  className?: string
}

export function AIAnalysis({ points, similarTrades, className }: AIAnalysisProps) {
  const [visiblePoints, setVisiblePoints] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Animate points in sequence
    const timeouts: NodeJS.Timeout[] = []

    points.forEach((point, index) => {
      const timeout = setTimeout(
        () => {
          setVisiblePoints((prev) => [...prev, point.id])
        },
        300 * (index + 1),
      )

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [points])

  const getPointIcon = (type: AnalysisPoint["type"]) => {
    switch (type) {
      case "strength":
        return <Check className="h-4 w-4 text-profit" />
      case "weakness":
        return <X className="h-4 w-4 text-loss" />
      case "insight":
        return <Lightbulb className="h-4 w-4 text-amber-500" />
      case "suggestion":
        return <ArrowRight className="h-4 w-4 text-blue-500" />
    }
  }

  const getImpactColor = (impact: AnalysisPoint["impact"]) => {
    switch (impact) {
      case "high":
        return "bg-profit text-profit-foreground"
      case "medium":
        return "bg-amber-500 text-amber-50"
      case "low":
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Trade Analysis</h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="space-y-3">
            {points.map((point, index) => (
              <div
                key={point.id}
                className={cn(
                  "rounded-lg border border-border bg-card p-3 transition-all duration-500",
                  visiblePoints.includes(point.id) ? "opacity-100" : "opacity-0 translate-y-4",
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getPointIcon(point.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{point.title}</h4>
                      <span
                        className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getImpactColor(point.impact))}
                      >
                        {point.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-3 font-medium">Similar Trades</h4>
            <div className="space-y-3">
              {similarTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between rounded-lg bg-muted p-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", trade.pnl > 0 ? "bg-profit" : "bg-loss")} />
                    <span className="font-medium">{trade.symbol}</span>
                    <span className="text-xs text-muted-foreground">{trade.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm", trade.pnl > 0 ? "text-profit" : "text-loss")}>
                      {trade.pnl > 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">{trade.similarity}% similar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
