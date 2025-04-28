"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, DollarSign, Percent, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Progress } from "@/components/ui/progress"

export function PerformanceSnapshot() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Mock performance data
  const performance = {
    winRate: 68,
    profitFactor: 2.4,
    totalPnL: 2845.75,
    avgRR: 2.1,
    expectancy: 1.8,
    totalTrades: 25,
    winningTrades: 17,
    losingTrades: 8,
  }

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">Performance</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-profit/20">
              <DollarSign className="h-4 w-4 text-profit" />
            </div>
            <span>Total P&L</span>
          </div>
          <div className="text-xl font-bold text-profit">
            <AnimatedNumber
              value={isLoaded ? performance.totalPnL : 0}
              formatValue={(val) => `$${val.toFixed(2)}`}
              duration={1500}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Win Rate</span>
              <span className="font-medium">{performance.winRate}%</span>
            </div>
            <Progress value={performance.winRate} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profit Factor</span>
              <span className="font-medium">{performance.profitFactor.toFixed(1)}x</span>
            </div>
            <Progress value={Math.min(performance.profitFactor * 20, 100)} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Avg R:R</span>
            </div>
            <div className="text-lg font-semibold">
              <AnimatedNumber
                value={isLoaded ? performance.avgRR : 0}
                formatValue={(val) => `${val.toFixed(1)}`}
                duration={1500}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Expectancy</span>
            </div>
            <div className="text-lg font-semibold">
              <AnimatedNumber
                value={isLoaded ? performance.expectancy : 0}
                formatValue={(val) => `${val.toFixed(1)}R`}
                duration={1500}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3 text-profit" />
            <span className="text-muted-foreground">Winners:</span>
            <span>{performance.winningTrades}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDown className="h-3 w-3 text-loss" />
            <span className="text-muted-foreground">Losers:</span>
            <span>{performance.losingTrades}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>
            <span className="ml-1">{performance.totalTrades}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
