"use client"

import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"

interface TestimonialCardProps {
  initials: string
  name: string
  role: string
  quote: string
  bgColor: string
  textColor: string
  className?: string
}

export function TestimonialCard({ initials, name, role, quote, bgColor, textColor, className }: TestimonialCardProps) {
  return (
    <div className={cn("relative h-full rounded-xl", className)}>
      <div className="relative h-full rounded-xl border border-border/40 bg-card/80 p-6 backdrop-blur-sm dark:bg-black/40">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", bgColor)}>
              <span className={cn("font-bold", textColor)}>{initials}</span>
            </div>
            <div>
              <h4 className="font-bold text-foreground">{name}</h4>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
          <p className="text-muted-foreground italic">{quote}</p>
        </div>
      </div>
    </div>
  )
}
