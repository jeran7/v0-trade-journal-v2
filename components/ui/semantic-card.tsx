import type React from "react"
import { cn } from "@/lib/utils"
import { type HTMLAttributes, forwardRef } from "react"

export type SemanticCardType = "success" | "warning" | "danger" | "insight" | "advanced" | null

interface SemanticCardProps extends HTMLAttributes<HTMLDivElement> {
  type?: SemanticCardType
  variant?: "border" | "accent" | "filled"
  hoverEffect?: boolean
  icon?: React.ReactNode
  title?: string
  description?: string
}

const SemanticCard = forwardRef<HTMLDivElement, SemanticCardProps>(
  (
    { className, type = null, variant = "border", hoverEffect = true, icon, title, description, children, ...props },
    ref,
  ) => {
    const getTypeClass = () => {
      if (!type) return ""

      switch (variant) {
        case "border":
          return `border-l-4 border-l-${type}`
        case "accent":
          return `border border-${type}/20`
        case "filled":
          return `bg-${type}-muted/20`
        default:
          return ""
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-4 bg-card",
          hoverEffect && "transition-transform duration-200 hover:scale-[1.01]",
          getTypeClass(),
          className,
        )}
        {...props}
      >
        {(icon || title || description) && (
          <div className="mb-3 space-y-1.5">
            {icon && (
              <div className={cn("w-fit rounded-full p-1.5", type && `bg-${type}-muted/30 text-${type}`)}>{icon}</div>
            )}
            {title && <h3 className="font-medium">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    )
  },
)
SemanticCard.displayName = "SemanticCard"

export { SemanticCard }
