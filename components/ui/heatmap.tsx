"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HeatmapProps {
  data: {
    x: string
    y: string
    value: number
    secondaryValue?: number
    label?: string
  }[]
  xLabels: string[]
  yLabels: string[]
  colorScale?: "green-red" | "blue-purple" | "yellow-orange" | "monochrome"
  valueFormat?: (value: number) => string
  secondaryValueFormat?: (value: number) => string
  className?: string
  cellClassName?: string
  title?: string
  subtitle?: string
  showLegend?: boolean
  minValue?: number
  maxValue?: number
  cellSize?: "sm" | "md" | "lg"
  onCellClick?: (x: string, y: string, value: number) => void
}

export function Heatmap({
  data,
  xLabels,
  yLabels,
  colorScale = "green-red",
  valueFormat = (value) => value.toFixed(2),
  secondaryValueFormat = (value) => value.toFixed(2),
  className,
  cellClassName,
  title,
  subtitle,
  showLegend = true,
  minValue: customMinValue,
  maxValue: customMaxValue,
  cellSize = "md",
  onCellClick,
}: HeatmapProps) {
  const [isClient, setIsClient] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [animatedCells, setAnimatedCells] = useState<string[]>([])

  useEffect(() => {
    setIsClient(true)

    // Animate cells in sequence
    const cells = data.map((d) => `${d.x}-${d.y}`)
    const timeouts: NodeJS.Timeout[] = []

    cells.forEach((cell, index) => {
      const timeout = setTimeout(() => {
        setAnimatedCells((prev) => [...prev, cell])
      }, 20 * index)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [data])

  // Calculate min and max values for color scaling
  const values = data.map((d) => d.value)
  const minValue = customMinValue !== undefined ? customMinValue : Math.min(...values)
  const maxValue = customMaxValue !== undefined ? customMaxValue : Math.max(...values)

  // Get color based on value and color scale
  const getColor = (value: number) => {
    // Normalize value between 0 and 1
    const normalizedValue = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue || 1)))

    switch (colorScale) {
      case "green-red":
        // Green for high values, red for low values
        return `rgba(${Math.round(255 * (1 - normalizedValue))}, ${Math.round(255 * normalizedValue)}, 0, 0.8)`
      case "blue-purple":
        // Blue to purple gradient
        return `rgba(${Math.round(100 + 155 * normalizedValue)}, ${Math.round(100 * (1 - normalizedValue))}, ${Math.round(200 + 55 * normalizedValue)}, 0.8)`
      case "yellow-orange":
        // Yellow to orange gradient
        return `rgba(255, ${Math.round(200 - 100 * normalizedValue)}, ${Math.round(50 * (1 - normalizedValue))}, 0.8)`
      case "monochrome":
        // White to dark gray
        const intensity = Math.round(220 * normalizedValue)
        return `rgba(${intensity}, ${intensity}, ${intensity}, 0.8)`
      default:
        return `rgba(0, 0, 0, 0.8)`
    }
  }

  // Get cell size class
  const getCellSizeClass = () => {
    switch (cellSize) {
      case "sm":
        return "h-8 w-8"
      case "lg":
        return "h-16 w-16"
      case "md":
      default:
        return "h-12 w-12"
    }
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

      <div className="flex">
        <div className="flex flex-col items-end justify-end pr-2">
          <div className="h-8" /> {/* Empty space for top-left corner */}
          {yLabels.map((label) => (
            <div key={label} className={cn("flex items-center justify-end", getCellSizeClass())}>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex pl-2">
            {xLabels.map((label) => (
              <div key={label} className={cn("flex items-end justify-center pb-1", getCellSizeClass())}>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
            {yLabels.map((yLabel) =>
              xLabels.map((xLabel) => {
                const cellData = data.find((d) => d.x === xLabel && d.y === yLabel)
                const cellId = `${xLabel}-${yLabel}`
                const isAnimated = animatedCells.includes(cellId)

                if (!cellData) {
                  return (
                    <div
                      key={cellId}
                      className={cn(
                        "m-0.5 rounded-md border border-border bg-muted/30",
                        getCellSizeClass(),
                        cellClassName,
                      )}
                    />
                  )
                }

                return (
                  <TooltipProvider key={cellId}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "m-0.5 flex cursor-pointer items-center justify-center rounded-md border border-border transition-all duration-300",
                            getCellSizeClass(),
                            hoveredCell === cellId && "ring-2 ring-ring",
                            isAnimated ? "opacity-100 scale-100" : "opacity-0 scale-90",
                            cellClassName,
                          )}
                          style={{
                            backgroundColor: getColor(cellData.value),
                            transitionDelay: `${yLabels.indexOf(yLabel) * 50 + xLabels.indexOf(xLabel) * 20}ms`,
                          }}
                          onMouseEnter={() => setHoveredCell(cellId)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => onCellClick?.(xLabel, yLabel, cellData.value)}
                        >
                          <span className="text-xs font-medium text-foreground">{valueFormat(cellData.value)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">
                            {xLabel} × {yLabel}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Value:</span>
                            <span>{valueFormat(cellData.value)}</span>
                          </div>
                          {cellData.secondaryValue !== undefined && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Secondary:</span>
                              <span>{secondaryValueFormat(cellData.secondaryValue)}</span>
                            </div>
                          )}
                          {cellData.label && <div className="text-xs text-muted-foreground">{cellData.label}</div>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              }),
            )}
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="flex items-center justify-end space-x-2">
          <span className="text-xs text-muted-foreground">{valueFormat(minValue)}</span>
          <div
            className="h-2 w-32 rounded-full"
            style={{ background: `linear-gradient(to right, ${getColor(minValue)}, ${getColor(maxValue)})` }}
          />
          <span className="text-xs text-muted-foreground">{valueFormat(maxValue)}</span>
        </div>
      )}
    </div>
  )
}
