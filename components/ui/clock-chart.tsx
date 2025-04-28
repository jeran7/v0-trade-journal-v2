"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ClockDataPoint {
  hour: number
  value: number
  count?: number
  label?: string
}

interface ClockChartProps {
  data: ClockDataPoint[]
  title?: string
  subtitle?: string
  colorScale?: "green-red" | "blue-purple" | "yellow-orange" | "monochrome"
  valueFormatter?: (value: number) => string
  countFormatter?: (count: number) => string
  className?: string
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
  is24Hour?: boolean
  highlightPeak?: boolean
  highlightLow?: boolean
}

export function ClockChart({
  data,
  title,
  subtitle,
  colorScale = "green-red",
  valueFormatter = (value) => value.toFixed(2),
  countFormatter = (count) => count.toString(),
  className,
  size = "md",
  showLabels = true,
  is24Hour = false,
  highlightPeak = true,
  highlightLow = true,
}: ClockChartProps) {
  const [isClient, setIsClient] = useState(false)
  const [animatedHours, setAnimatedHours] = useState<number[]>([])
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Animate hours in sequence
    const timeouts: NodeJS.Timeout[] = []

    for (let hour = 0; hour < (is24Hour ? 24 : 12); hour++) {
      const timeout = setTimeout(() => {
        setAnimatedHours((prev) => [...prev, hour])
      }, 50 * hour)
      timeouts.push(timeout)
    }

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [is24Hour])

  // Calculate min and max values for color scaling
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  // Find peak and low hours
  const peakHour = data.reduce((max, item) => (item.value > data[max].value ? data.indexOf(item) : max), 0)
  const lowHour = data.reduce((min, item) => (item.value < data[min].value ? data.indexOf(item) : min), 0)

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

  // Get size class
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-64 w-64"
      case "lg":
        return "h-96 w-96"
      case "md":
      default:
        return "h-80 w-80"
    }
  }

  // Get hour label
  const getHourLabel = (hour: number) => {
    if (is24Hour) {
      return `${hour}:00`
    }
    return `${hour === 0 ? 12 : hour}${hour < 12 ? "am" : "pm"}`
  }

  // Get data for a specific hour
  const getHourData = (hour: number) => {
    return data.find((d) => d.hour === hour) || { hour, value: 0 }
  }

  // Calculate position for hour markers
  const getHourPosition = (hour: number, radius: number) => {
    const angle = (hour / (is24Hour ? 24 : 12)) * 2 * Math.PI - Math.PI / 2
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return { x, y }
  }

  if (!isClient) {
    return <div className={cn("animate-pulse rounded-lg bg-muted", getSizeClass(), className)} />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      <div className={cn("relative mx-auto", getSizeClass())}>
        {/* Clock face */}
        <div className="absolute inset-0 rounded-full border border-border bg-card/50" />

        {/* Hour markers */}
        {Array.from({ length: is24Hour ? 24 : 12 }).map((_, hour) => {
          const hourData = getHourData(hour)
          const { x, y } = getHourPosition(hour, size === "sm" ? 28 : size === "lg" ? 44 : 36)
          const centerX = "50%"
          const centerY = "50%"
          const isPeak = data.indexOf(hourData) === peakHour
          const isLow = data.indexOf(hourData) === lowHour
          const isAnimated = animatedHours.includes(hour)

          return (
            <TooltipProvider key={hour}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full border transition-all duration-500",
                      hoveredHour === hour && "ring-2 ring-ring",
                      isAnimated ? "opacity-100 scale-100" : "opacity-0 scale-0",
                      (highlightPeak && isPeak) || (highlightLow && isLow) ? "border-primary" : "border-border",
                    )}
                    style={{
                      left: `calc(${centerX} + ${x}%)`,
                      top: `calc(${centerY} + ${y}%)`,
                      backgroundColor: getColor(hourData.value),
                      transitionDelay: `${hour * 50}ms`,
                    }}
                    onMouseEnter={() => setHoveredHour(hour)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    <span className="text-xs font-medium text-foreground">{hour}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{getHourLabel(hour)}</div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Value:</span>
                      <span>{valueFormatter(hourData.value)}</span>
                    </div>
                    {hourData.count !== undefined && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Count:</span>
                        <span>{countFormatter(hourData.count)}</span>
                      </div>
                    )}
                    {hourData.label && <div className="text-xs text-muted-foreground">{hourData.label}</div>}
                    {isPeak && <div className="text-xs font-medium text-profit">Peak performance</div>}
                    {isLow && <div className="text-xs font-medium text-loss">Lowest performance</div>}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}

        {/* Clock center */}
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-primary" />

        {/* Hour labels */}
        {showLabels &&
          [0, 3, 6, 9].map((hour) => {
            const { x, y } = getHourPosition(hour, size === "sm" ? 30 : size === "lg" ? 46 : 38)
            const centerX = "50%"
            const centerY = "50%"

            return (
              <div
                key={hour}
                className="absolute -translate-x-1/2 -translate-y-1/2 transform text-xs font-medium text-muted-foreground"
                style={{
                  left: `calc(${centerX} + ${x}%)`,
                  top: `calc(${centerY} + ${y}%)`,
                }}
              >
                {getHourLabel(hour)}
              </div>
            )
          })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-xs text-muted-foreground">{valueFormatter(minValue)}</span>
        <div
          className="h-2 w-32 rounded-full"
          style={{ background: `linear-gradient(to right, ${getColor(minValue)}, ${getColor(maxValue)})` }}
        />
        <span className="text-xs text-muted-foreground">{valueFormatter(maxValue)}</span>
      </div>
    </div>
  )
}
