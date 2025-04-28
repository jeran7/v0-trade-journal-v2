"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedTextProps {
  text: string
  highlightedText: string
  endText: string
  className?: string
}

export function AnimatedText({ text, highlightedText, endText, className }: AnimatedTextProps) {
  return (
    <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight", className)}>
      {text}{" "}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-amber-500"
      >
        {highlightedText}
      </motion.span>{" "}
      {endText}
    </h1>
  )
}
