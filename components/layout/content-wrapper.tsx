import type React from "react"
import { cn } from "@/lib/utils"

interface ContentWrapperProps {
  children: React.ReactNode
  className?: string
}

export function ContentWrapper({ children, className }: ContentWrapperProps) {
  return (
    <div
      className={cn(
        "w-full px-4 py-6 md:px-6 md:pl-[calc(80px+1.5rem)] lg:pl-[calc(240px+1.5rem)] transition-all duration-300",
        className,
      )}
    >
      {children}
    </div>
  )
}
