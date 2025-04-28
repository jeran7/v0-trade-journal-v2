"use client"

import { useState, useEffect, useRef } from "react"
import AnimatedTextCycle from "@/components/ui/animated-text-cycle"

interface RandomTaglineProps {
  className?: string
}

export function RandomTagline({ className = "" }: RandomTaglineProps) {
  const [taglineType, setTaglineType] = useState(0)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Define all tagline alternatives
  const taglines = [
    {
      prefix: "Elevate your ",
      words: [
        "wins",
        "edge",
        "precision",
        "confidence",
        "consistency",
        "focus",
        "profit",
        "mindset",
        "mastery",
        "results",
      ],
      suffix: " with every trade",
      className: "text-blue-500 dark:text-blue-400",
    },
    {
      prefix: "From ",
      words: [
        "intuition",
        "guesswork",
        "emotion",
        "doubt",
        "uncertainty",
        "stress",
        "frustration",
        "randomness",
        "mistakes",
      ],
      suffix: " to proven strategy",
      className: "text-amber-500 dark:text-amber-400",
    },
    {
      prefix: "Discover your ",
      words: [
        "winning patterns",
        "psychological edges",
        "optimal setups",
        "best timeframes",
        "profit triggers",
        "risk sweet spots",
        "performance factors",
        "market insights",
        "strongest strategies",
      ],
      suffix: "",
      className: "text-purple-500 dark:text-purple-400",
    },
    {
      prefix: "Every journal entry ",
      words: [
        "strengthens",
        "improves",
        "refines",
        "enhances",
        "sharpens",
        "optimizes",
        "develops",
        "transforms",
        "elevates",
      ],
      suffix: " your trading",
      className: "text-green-500 dark:text-green-400",
    },
    {
      prefix: "What's your ",
      words: [
        "true win rate",
        "best setup",
        "psychological edge",
        "optimal timeframe",
        "profit pattern",
        "emotional trigger",
        "risk tolerance",
        "market strength",
        "winning strategy",
      ],
      suffix: "?",
      className: "text-blue-500 dark:text-blue-400",
    },
  ]

  // Select a random tagline on page load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * taglines.length)
    setTaglineType(randomIndex)
  }, [])

  // Calculate maximum required height to prevent layout shifts
  useEffect(() => {
    if (!contentRef.current) return

    // Clone the container for height calculations
    const tempContainer = contentRef.current.cloneNode(true) as HTMLDivElement
    tempContainer.style.visibility = "hidden"
    tempContainer.style.position = "absolute"
    tempContainer.style.width = contentRef.current.getBoundingClientRect().width + "px"
    document.body.appendChild(tempContainer)

    // Find the tallest possible height
    let maxHeight = 0

    // Function to set content and measure height
    const measureHeight = (prefix: string, word: string, suffix: string) => {
      tempContainer.innerHTML = `
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
          ${prefix}<span class="font-bold">${word}</span>${suffix}
        </h1>
      `
      const height = tempContainer.getBoundingClientRect().height
      return height
    }

    // Check all possible word combinations
    taglines[taglineType].words.forEach((word) => {
      const height = measureHeight(taglines[taglineType].prefix, word, taglines[taglineType].suffix)
      maxHeight = Math.max(maxHeight, height)
    })

    // Remove temp element
    document.body.removeChild(tempContainer)

    // Set height with a small buffer
    setContentHeight(maxHeight + 5)
  }, [taglineType])

  const selectedTagline = taglines[taglineType]

  return (
    <div className={`max-w-[600px] mx-auto ${className}`} ref={containerRef}>
      <div
        ref={contentRef}
        style={{
          minHeight: contentHeight > 0 ? `${contentHeight}px` : "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex flex-wrap justify-center items-center gap-x-2">
          <span>{selectedTagline.prefix}</span>
          <AnimatedTextCycle
            words={selectedTagline.words}
            interval={3000}
            className={`font-bold inline-block ${selectedTagline.className}`}
          />
          <span>{selectedTagline.suffix}</span>
        </h1>
      </div>
    </div>
  )
}
