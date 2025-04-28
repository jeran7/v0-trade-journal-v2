"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface EquityChartProps {
  data: {
    date: string
    equity: number
  }[]
  className?: string
}

export function EquityChart({ data, className }: EquityChartProps) {
  const [isClient, setIsClient] = useState(false)
  const [chartData, setChartData] = useState(data)

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true)

    // Animate data loading
    const timer = setTimeout(() => {
      setChartData(data)
    }, 300)

    return () => clearTimeout(timer)
  }, [data])

  // Calculate min and max for domain padding
  const equityValues = data.map((item) => item.equity)
  const minEquity = Math.min(...equityValues)
  const maxEquity = Math.max(...equityValues)
  const padding = (maxEquity - minEquity) * 0.1

  // Determine if overall trend is positive
  const isPositive = data[0].equity < data[data.length - 1].equity

  if (!isClient) {
    return <div className={`h-[300px] ${className}`} />
  }

  // Pre-calculate the formatter function for YAxis
  const tickFormatter = (value: number) => `$${value.toLocaleString()}`

  return (
    <ChartContainer
      config={{
        equity: {
          label: "Equity",
          color: isPositive ? "hsl(var(--profit))" : "hsl(var(--loss))",
        },
      }}
      className={`h-[300px] ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "hsl(var(--profit))" : "hsl(var(--loss))"} stopOpacity={0.8} />
              <stop offset="95%" stopColor={isPositive ? "hsl(var(--profit))" : "hsl(var(--loss))"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            domain={[minEquity - padding, maxEquity + padding]}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            tickFormatter={tickFormatter}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={isPositive ? "hsl(var(--profit))" : "hsl(var(--loss))"}
            fillOpacity={1}
            fill="url(#equityGradient)"
            strokeWidth={2}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
