"use client"

import { useState, useEffect } from "react"
import { Brain, ChevronRight, Lightbulb, MessageSquare, Plus, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"

interface Prompt {
  id: string
  text: string
  category: "reflection" | "improvement" | "insight" | "challenge"
  isUsed?: boolean
}

interface AIPromptsProps {
  tradeType?: "win" | "loss" | "breakeven"
  strategy?: string
  symbol?: string
  onSelectPrompt?: (prompt: string) => void
  className?: string
}

export function AIPrompts({
  tradeType = "win",
  strategy = "Breakout",
  symbol = "AAPL",
  onSelectPrompt,
  className,
}: AIPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Generate prompts based on trade context
  useEffect(() => {
    // In a real app, this would be an API call to generate prompts
    setIsLoading(true)

    // Simulate API delay
    const timer = setTimeout(() => {
      const generatedPrompts: Prompt[] = [
        // Reflection prompts
        {
          id: "1",
          text: `What specific aspects of your ${strategy} strategy worked well in this ${tradeType === "win" ? "winning" : "losing"} ${symbol} trade?`,
          category: "reflection",
        },
        {
          id: "2",
          text: "How did your emotional state affect your decision-making during this trade?",
          category: "reflection",
        },
        {
          id: "3",
          text: "What market conditions were present, and how did they influence your trade?",
          category: "reflection",
        },

        // Improvement prompts
        {
          id: "4",
          text: `If you could re-enter this ${symbol} trade, what would you do differently?`,
          category: "improvement",
        },
        {
          id: "5",
          text: "What could you improve about your exit strategy based on this trade?",
          category: "improvement",
        },
        {
          id: "6",
          text: "How could you have better managed risk in this trade?",
          category: "improvement",
        },

        // Insight prompts
        {
          id: "7",
          text: "What pattern or insight from this trade could apply to future trades?",
          category: "insight",
        },
        {
          id: "8",
          text: `What did you learn about ${symbol} or the ${strategy} strategy from this trade?`,
          category: "insight",
        },
        {
          id: "9",
          text: "How does this trade fit into your broader trading performance pattern?",
          category: "insight",
        },

        // Challenge prompts
        {
          id: "10",
          text: "What belief or assumption about your trading was challenged by this trade?",
          category: "challenge",
        },
        {
          id: "11",
          text: "What is the hardest truth you need to acknowledge about this trade?",
          category: "challenge",
        },
        {
          id: "12",
          text: "If this trade result was the opposite, what would that tell you about your strategy?",
          category: "challenge",
        },
      ]

      setPrompts(generatedPrompts)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [tradeType, strategy, symbol])

  const handleSelectPrompt = (prompt: Prompt) => {
    onSelectPrompt?.(prompt.text)

    // Mark prompt as used
    setPrompts(prompts.map((p) => (p.id === prompt.id ? { ...p, isUsed: true } : p)))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "reflection":
        return <Brain className="h-4 w-4" />
      case "improvement":
        return <Sparkles className="h-4 w-4" />
      case "insight":
        return <Lightbulb className="h-4 w-4" />
      case "challenge":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "reflection":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "improvement":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "insight":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
      case "challenge":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20"
    }
  }

  const filteredPrompts = selectedCategory ? prompts.filter((p) => p.category === selectedCategory) : prompts

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI-Powered Reflection Prompts</h3>
        <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
          {selectedCategory ? "Show All" : "Filter"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["reflection", "improvement", "insight", "challenge"].map((category) => (
          <Badge
            key={category}
            variant="outline"
            className={cn(
              "cursor-pointer capitalize",
              selectedCategory === category ? "bg-accent" : "bg-transparent",
              "hover:bg-accent/50",
            )}
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
          >
            {getCategoryIcon(category)}
            <span className="ml-1">{category}</span>
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPrompts.map((prompt) => (
            <GlassCard
              key={prompt.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 p-3 transition-all hover:bg-accent/10",
                prompt.isUsed && "opacity-60",
              )}
              onClick={() => handleSelectPrompt(prompt)}
            >
              <div className={cn("mt-0.5 rounded-full p-1.5", getCategoryColor(prompt.category))}>
                {getCategoryIcon(prompt.category)}
              </div>
              <div className="flex-1">
                <p className="text-sm">{prompt.text}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">
                    {prompt.category}
                  </Badge>
                  {prompt.isUsed && (
                    <Badge variant="outline" className="bg-muted text-xs">
                      Used
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </GlassCard>
          ))}

          <Button variant="outline" className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Generate More Prompts
          </Button>
        </div>
      )}
    </div>
  )
}
