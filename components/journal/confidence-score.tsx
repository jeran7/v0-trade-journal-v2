"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface ConfidenceScoreProps {
  value?: number
  onChange?: (value: number) => void
  className?: string
  disabled?: boolean
}

export function ConfidenceScore({ value = 5, onChange, className, disabled = false }: ConfidenceScoreProps) {
  const [score, setScore] = useState<number>(value)

  const handleChange = (newValue: number[]) => {
    const newScore = newValue[0]
    setScore(newScore)
    onChange?.(newScore)
  }

  const getScoreLabel = (score: number) => {
    if (score <= 2) return "Very Low"
    if (score <= 4) return "Low"
    if (score <= 6) return "Moderate"
    if (score <= 8) return "High"
    return "Very High"
  }

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-500"
    if (score <= 6) return "text-amber-500"
    return "text-green-500"
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm">Confidence Level</span>
        <span className={cn("text-sm font-medium", getScoreColor(score))}>
          {score}/10 - {getScoreLabel(score)}
        </span>
      </div>
      <Slider
        value={[score]}
        min={1}
        max={10}
        step={1}
        onValueChange={handleChange}
        disabled={disabled}
        className={disabled ? "opacity-50" : ""}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Very Low</span>
        <span>Moderate</span>
        <span>Very High</span>
      </div>
    </div>
  )
}
