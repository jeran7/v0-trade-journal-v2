"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"

interface BarData {
  label: string
  value: number
  color?: string
  secondaryValue?: number
  secondaryLabel?: string
}

interface HorizontalBarChartProps {
  data: BarData[]
  title?: string
  subtitle?: string
  maxValue?: number
  valueFormatter?: (value: number) => string
  secondaryValueFormatter?: (value: number) => string
  className?: string
  barClassName?: string
  showLabels?: boolean
  sortBars?: "asc" | "desc" | "none"
  animationDelay?: number
}

export function HorizontalBarChart({
  data,
  title,
  subtitle,
  maxValue: customMaxValue,
  valueFormatter = (value) => value.toFixed(2),
  secondaryValueFormatter = (value) => value.toFixed(2),
  className,
  barClassName,
  showLabels = true,
  sortBars = "desc",
  animationDelay = 50,
}: HorizontalBarChartProps) {
  const [isClient, setIsClient] = useState(false)
  const [animatedBars, setAnimatedBars] = useState<string[]>([])

  // Memoize sorted data to prevent recalculation on every render
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBars === "asc") return a.value - b.value
      if (sortBars === "desc") return b.value - a.value
      return 0
    })
  }, [data, sortBars])

  // Memoize max value calculation
  const maxValue = useMemo(() => {
    return customMaxValue || Math.max(...data.map((d) => d.value)) * 1.1
  }, [customMaxValue, data])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Separate useEffect for animations to avoid dependency on sortedData
  useEffect(() => {
    if (!isClient) return

    // Reset animated bars when data changes
    setAnimatedBars([])

    // Animate bars in sequence
    const timeouts: NodeJS.Timeout[] = []

    sortedData.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setAnimatedBars((prev) => [...prev, item.label])
      }, animationDelay * index)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [sortedData, animationDelay, isClient])

  // Get default color based on value (positive/negative)
  const getDefaultColor = (value: number) => {
    return value >= 0 ? "bg-profit/80" : "bg-loss/80"
  }

  if (!isClient) {
    return <div className={cn("h-[300px] animate-pulse rounded-lg bg-muted", className)} />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-3">
        {sortedData.map((item, index) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              <span className={cn("text-sm", item.value >= 0 ? "text-profit" : "text-loss")}>
                {valueFormatter(item.value)}
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "absolute h-full rounded-full transition-all duration-1000",
                  item.color || getDefaultColor(item.value),
                  animatedBars.includes(item.label) ? "opacity-100" : "opacity-0 w-0",
                  barClassName,
                )}
                style={{
                  width: `${Math.min(100, Math.abs((item.value / maxValue) * 100))}%`,
                  left: item.value < 0 ? "auto" : 0,
                  right: item.value < 0 ? 0 : "auto",
                  transitionDelay: `${index * 100}ms`,
                }}
              />
              {item.secondaryValue !== undefined && (
                <div
                  className="absolute top-0 h-full w-px bg-background"
                  style={{
                    left: `${Math.min(100, Math.abs((item.secondaryValue / maxValue) * 100))}%`,
                  }}
                />
              )}
            </div>
            {item.secondaryLabel && showLabels && (
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">{item.secondaryLabel}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
