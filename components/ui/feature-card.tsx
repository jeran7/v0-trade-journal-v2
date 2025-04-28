"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  iconBgColor: string
  iconColor: string
  className?: string
}

export function FeatureCard({ icon, title, description, iconBgColor, iconColor, className }: FeatureCardProps) {
  return (
    <div className={cn("relative h-full rounded-xl", className)}>
      <div className="relative h-full rounded-xl border border-border/40 bg-card/80 p-6 backdrop-blur-sm dark:bg-black/40">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="space-y-4">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", iconBgColor)}>
            <div className={iconColor}>{icon}</div>
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
