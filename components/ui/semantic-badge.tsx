import type React from "react"
import { cn } from "@/lib/utils"
import { type HTMLAttributes, forwardRef } from "react"

export type SemanticBadgeType = "success" | "warning" | "danger" | "insight" | "advanced" | "neutral"

interface SemanticBadgeProps extends HTMLAttributes<HTMLDivElement> {
  type: SemanticBadgeType
  variant?: "solid" | "outline" | "soft"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
}

const SemanticBadge = forwardRef<HTMLDivElement, SemanticBadgeProps>(
  ({ className, type, variant = "soft", size = "md", icon, children, ...props }, ref) => {
    const getTypeClass = () => {
      switch (variant) {
        case "solid":
          return `bg-${type} text-${type}-foreground`
        case "outline":
          return `border border-${type} text-${type}`
        case "soft":
        default:
          return `bg-${type}-muted text-${type}`
      }
    }

    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return "text-xs px-1.5 py-0.5"
        case "lg":
          return "text-sm px-3 py-1"
        default:
          return "text-xs px-2 py-0.5"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          getTypeClass(),
          getSizeClass(),
          className,
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </div>
    )
  },
)
SemanticBadge.displayName = "SemanticBadge"

export { SemanticBadge }
