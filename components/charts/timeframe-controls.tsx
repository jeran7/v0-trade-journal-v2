"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1D" | "1W"

interface TimeframeControlsProps {
  onTimeframeChange: (timeframe: Timeframe) => void
  defaultTimeframe?: Timeframe
  className?: string
  availableTimeframes?: Timeframe[]
}

export function TimeframeControls({
  onTimeframeChange,
  defaultTimeframe = "1D",
  className,
  availableTimeframes = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"],
}: TimeframeControlsProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>(defaultTimeframe)

  const handleTimeframeChange = (timeframe: Timeframe) => {
    setActiveTimeframe(timeframe)
    onTimeframeChange(timeframe)
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {availableTimeframes.map((timeframe) => (
        <Button
          key={timeframe}
          variant={activeTimeframe === timeframe ? "default" : "outline"}
          size="sm"
          onClick={() => handleTimeframeChange(timeframe)}
          className={cn(
            "transition-all duration-200 h-8 px-3 text-xs font-medium",
            activeTimeframe === timeframe ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10",
          )}
        >
          {timeframe}
        </Button>
      ))}
    </div>
  )
}
