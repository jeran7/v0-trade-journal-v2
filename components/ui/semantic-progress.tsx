import { cn } from "@/lib/utils"
import { type HTMLAttributes, forwardRef } from "react"

export type SemanticProgressType = "success" | "warning" | "danger" | "insight" | "advanced" | "gradient"

interface SemanticProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  type?: SemanticProgressType
  showValue?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

const SemanticProgress = forwardRef<HTMLDivElement, SemanticProgressProps>(
  (
    { className, value, max = 100, type = "success", showValue = false, size = "md", animated = false, ...props },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const getTypeClass = () => {
      if (type === "gradient") {
        // Create a gradient based on the value
        if (percentage <= 33) {
          return "bg-danger"
        } else if (percentage <= 66) {
          return "bg-warning"
        } else {
          return "bg-success"
        }
      }

      return `bg-${type}`
    }

    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return "h-1"
        case "lg":
          return "h-3"
        default:
          return "h-2"
      }
    }

    return (
      <div className="w-full flex items-center gap-2">
        <div
          ref={ref}
          className={cn("w-full overflow-hidden rounded-full bg-muted", getSizeClass(), className)}
          {...props}
        >
          <div
            className={cn("h-full transition-all", getTypeClass(), animated && "animate-pulse-glow")}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {showValue && <span className="text-xs font-medium tabular-nums">{Math.round(percentage)}%</span>}
      </div>
    )
  },
)
SemanticProgress.displayName = "SemanticProgress"

export { SemanticProgress }
