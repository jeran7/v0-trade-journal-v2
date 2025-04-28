import { cn } from "@/lib/utils"
import { type HTMLAttributes, forwardRef } from "react"

export type SemanticColor = "success" | "warning" | "insight" | "danger" | "advanced" | null

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  semanticColor?: SemanticColor
  semanticBorder?: boolean
  intensity?: "low" | "medium" | "high"
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, hoverEffect = true, semanticColor = null, semanticBorder = false, intensity = "medium", ...props },
    ref,
  ) => {
    const getSemanticClass = () => {
      if (!semanticColor) return ""

      return `glass-${semanticColor}`
    }

    const getSemanticBorderClass = () => {
      if (!semanticBorder || !semanticColor) return ""

      return `border-l-semantic-${semanticColor}`
    }

    const getIntensityClass = () => {
      if (!semanticColor) return ""

      switch (intensity) {
        case "low":
          return `bg-${semanticColor}-muted/10 border-${semanticColor}-muted/20`
        case "high":
          return `bg-${semanticColor}-muted/30 border-${semanticColor}-muted/40`
        default:
          return `bg-${semanticColor}-muted/20 border-${semanticColor}-muted/30`
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "glass-card rounded-xl p-4 transition-all duration-300",
          hoverEffect && "hover-scale",
          getSemanticClass(),
          getSemanticBorderClass(),
          getIntensityClass(),
          className,
        )}
        {...props}
      />
    )
  },
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
