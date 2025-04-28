"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MatrixQuadrant {
  id: string
  title: string
  description: string
  count: number
  percentage: number
  color: string
  items?: {
    id: string
    label: string
    value: number
  }[]
}

interface ConfidenceMatrixProps {
  data: {
    highConfidenceGoodOutcome: MatrixQuadrant
    highConfidenceBadOutcome: MatrixQuadrant
    lowConfidenceGoodOutcome: MatrixQuadrant
    lowConfidenceBadOutcome: MatrixQuadrant
  }
  title?: string
  subtitle?: string
  className?: string
  xAxisLabel?: string
  yAxisLabel?: string
  showItemsOnHover?: boolean
  maxItems?: number
}

export function ConfidenceMatrix({
  data,
  title,
  subtitle,
  className,
  xAxisLabel = "Confidence",
  yAxisLabel = "Outcome",
  showItemsOnHover = true,
  maxItems = 3,
}: ConfidenceMatrixProps) {
  const [isClient, setIsClient] = useState(false)
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null)
  const [animatedQuadrants, setAnimatedQuadrants] = useState<string[]>([])

  useEffect(() => {
    setIsClient(true)

    // Animate quadrants in sequence
    const quadrants = [
      data.highConfidenceGoodOutcome.id,
      data.highConfidenceBadOutcome.id,
      data.lowConfidenceGoodOutcome.id,
      data.lowConfidenceBadOutcome.id,
    ]
    const timeouts: NodeJS.Timeout[] = []

    quadrants.forEach((quadrant, index) => {
      const timeout = setTimeout(() => {
        setAnimatedQuadrants((prev) => [...prev, quadrant])
      }, 200 * index)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [data])

  const totalCount =
    data.highConfidenceGoodOutcome.count +
    data.highConfidenceBadOutcome.count +
    data.lowConfidenceGoodOutcome.count +
    data.lowConfidenceBadOutcome.count

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

      <div className="relative aspect-square w-full">
        {/* X-axis label */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Low {xAxisLabel}</span>
            <div className="h-px w-16 bg-muted-foreground" />
            <span>High {xAxisLabel}</span>
          </div>
        </div>

        {/* Y-axis label */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <div className="flex -rotate-90 items-center space-x-2 text-sm text-muted-foreground">
            <span>Bad {yAxisLabel}</span>
            <div className="h-px w-16 bg-muted-foreground" />
            <span>Good {yAxisLabel}</span>
          </div>
        </div>

        {/* Matrix grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 p-8">
          {/* Top-right: High Confidence, Good Outcome */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "col-start-2 row-start-1 flex flex-col items-center justify-center rounded-lg border border-border p-4 transition-all duration-500",
                    activeQuadrant === data.highConfidenceGoodOutcome.id && "ring-2 ring-ring",
                    animatedQuadrants.includes(data.highConfidenceGoodOutcome.id)
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90",
                  )}
                  style={{ backgroundColor: `${data.highConfidenceGoodOutcome.color}20` }}
                  onMouseEnter={() => setActiveQuadrant(data.highConfidenceGoodOutcome.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                >
                  <div className="text-center">
                    <h4 className="font-medium" style={{ color: data.highConfidenceGoodOutcome.color }}>
                      {data.highConfidenceGoodOutcome.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{data.highConfidenceGoodOutcome.description}</p>
                    <div className="mt-2 text-2xl font-bold" style={{ color: data.highConfidenceGoodOutcome.color }}>
                      {data.highConfidenceGoodOutcome.percentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">{data.highConfidenceGoodOutcome.count} trades</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <div className="space-y-2">
                  <div className="font-medium">{data.highConfidenceGoodOutcome.title}</div>
                  <div className="text-sm">{data.highConfidenceGoodOutcome.description}</div>
                  {showItemsOnHover && data.highConfidenceGoodOutcome.items && (
                    <div className="space-y-1 pt-2">
                      <div className="text-xs font-medium">Top examples:</div>
                      {data.highConfidenceGoodOutcome.items.slice(0, maxItems).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Top-left: Low Confidence, Good Outcome */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "col-start-1 row-start-1 flex flex-col items-center justify-center rounded-lg border border-border p-4 transition-all duration-500",
                    activeQuadrant === data.lowConfidenceGoodOutcome.id && "ring-2 ring-ring",
                    animatedQuadrants.includes(data.lowConfidenceGoodOutcome.id)
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90",
                  )}
                  style={{ backgroundColor: `${data.lowConfidenceGoodOutcome.color}20` }}
                  onMouseEnter={() => setActiveQuadrant(data.lowConfidenceGoodOutcome.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                >
                  <div className="text-center">
                    <h4 className="font-medium" style={{ color: data.lowConfidenceGoodOutcome.color }}>
                      {data.lowConfidenceGoodOutcome.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{data.lowConfidenceGoodOutcome.description}</p>
                    <div className="mt-2 text-2xl font-bold" style={{ color: data.lowConfidenceGoodOutcome.color }}>
                      {data.lowConfidenceGoodOutcome.percentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">{data.lowConfidenceGoodOutcome.count} trades</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <div className="space-y-2">
                  <div className="font-medium">{data.lowConfidenceGoodOutcome.title}</div>
                  <div className="text-sm">{data.lowConfidenceGoodOutcome.description}</div>
                  {showItemsOnHover && data.lowConfidenceGoodOutcome.items && (
                    <div className="space-y-1 pt-2">
                      <div className="text-xs font-medium">Top examples:</div>
                      {data.lowConfidenceGoodOutcome.items.slice(0, maxItems).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Bottom-right: High Confidence, Bad Outcome */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "col-start-2 row-start-2 flex flex-col items-center justify-center rounded-lg border border-border p-4 transition-all duration-500",
                    activeQuadrant === data.highConfidenceBadOutcome.id && "ring-2 ring-ring",
                    animatedQuadrants.includes(data.highConfidenceBadOutcome.id)
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90",
                  )}
                  style={{ backgroundColor: `${data.highConfidenceBadOutcome.color}20` }}
                  onMouseEnter={() => setActiveQuadrant(data.highConfidenceBadOutcome.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                >
                  <div className="text-center">
                    <h4 className="font-medium" style={{ color: data.highConfidenceBadOutcome.color }}>
                      {data.highConfidenceBadOutcome.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{data.highConfidenceBadOutcome.description}</p>
                    <div className="mt-2 text-2xl font-bold" style={{ color: data.highConfidenceBadOutcome.color }}>
                      {data.highConfidenceBadOutcome.percentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">{data.highConfidenceBadOutcome.count} trades</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <div className="space-y-2">
                  <div className="font-medium">{data.highConfidenceBadOutcome.title}</div>
                  <div className="text-sm">{data.highConfidenceBadOutcome.description}</div>
                  {showItemsOnHover && data.highConfidenceBadOutcome.items && (
                    <div className="space-y-1 pt-2">
                      <div className="text-xs font-medium">Top examples:</div>
                      {data.highConfidenceBadOutcome.items.slice(0, maxItems).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Bottom-left: Low Confidence, Bad Outcome */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "col-start-1 row-start-2 flex flex-col items-center justify-center rounded-lg border border-border p-4 transition-all duration-500",
                    activeQuadrant === data.lowConfidenceBadOutcome.id && "ring-2 ring-ring",
                    animatedQuadrants.includes(data.lowConfidenceBadOutcome.id)
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90",
                  )}
                  style={{ backgroundColor: `${data.lowConfidenceBadOutcome.color}20` }}
                  onMouseEnter={() => setActiveQuadrant(data.lowConfidenceBadOutcome.id)}
                  onMouseLeave={() => setActiveQuadrant(null)}
                >
                  <div className="text-center">
                    <h4 className="font-medium" style={{ color: data.lowConfidenceBadOutcome.color }}>
                      {data.lowConfidenceBadOutcome.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{data.lowConfidenceBadOutcome.description}</p>
                    <div className="mt-2 text-2xl font-bold" style={{ color: data.lowConfidenceBadOutcome.color }}>
                      {data.lowConfidenceBadOutcome.percentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">{data.lowConfidenceBadOutcome.count} trades</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <div className="space-y-2">
                  <div className="font-medium">{data.lowConfidenceBadOutcome.title}</div>
                  <div className="text-sm">{data.lowConfidenceBadOutcome.description}</div>
                  {showItemsOnHover && data.lowConfidenceBadOutcome.items && (
                    <div className="space-y-1 pt-2">
                      <div className="text-xs font-medium">Top examples:</div>
                      {data.lowConfidenceBadOutcome.items.slice(0, maxItems).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Total trades analyzed: <span className="font-medium">{totalCount}</span>
      </div>
    </div>
  )
}
