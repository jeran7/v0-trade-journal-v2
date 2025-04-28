"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatValue?: (value: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1000,
  formatValue = (val) => val.toFixed(2),
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = null

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function: cubic-bezier
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)

      const currentValue = startValueRef.current + (value - startValueRef.current) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration])

  // Apply the formatting function to the current display value
  const formattedValue = formatValue(displayValue)
  const isPositive = value > 0
  const isNegative = value < 0

  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-300",
        isPositive && "text-profit",
        isNegative && "text-loss",
        !isPositive && !isNegative && "text-neutral",
        className,
      )}
    >
      {formattedValue}
    </span>
  )
}
