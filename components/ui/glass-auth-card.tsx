"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef } from "react"

interface GlassAuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated"
  intensity?: "low" | "medium" | "high"
  children: React.ReactNode
  animate?: boolean
}

const GlassAuthCard = forwardRef<HTMLDivElement, GlassAuthCardProps>(
  ({ className, variant = "default", intensity = "medium", children, animate = true, ...props }, ref) => {
    const getIntensityClasses = () => {
      switch (intensity) {
        case "low":
          return "bg-background/70 border-border/30 backdrop-blur-[6px]"
        case "high":
          return "bg-background/50 border-border/50 backdrop-blur-[15px]"
        default:
          return "bg-background/60 border-border/40 backdrop-blur-[10px]"
      }
    }

    const getVariantClasses = () => {
      switch (variant) {
        case "elevated":
          return "shadow-lg"
        default:
          return "shadow-md"
      }
    }

    const cardContent = (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border p-4 sm:p-6 transition-all duration-300",
          getIntensityClasses(),
          getVariantClasses(),
          "hover:shadow-xl hover:border-border/60 transition-all duration-500",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {cardContent}
        </motion.div>
      )
    }

    return cardContent
  },
)

GlassAuthCard.displayName = "GlassAuthCard"

export { GlassAuthCard }
