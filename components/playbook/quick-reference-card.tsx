"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Star, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface QuickReferenceCardProps {
  strategy: {
    id: string
    name: string
    category: string
    winRate: number
    profitFactor: number
    isFavorite: boolean
    marketConditions: string[]
    timeframes: string[]
    entryRules: string[]
    exitRules: string[]
    setupImage: string
    lastUsed?: string
  }
  compact?: boolean
  className?: string
}

export function QuickReferenceCard({ strategy, compact = false, className = "" }: QuickReferenceCardProps) {
  const [isFavorite, setIsFavorite] = useState(strategy.isFavorite)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      <div className="relative">
        <div className="h-32 overflow-hidden">
          <img
            src={strategy.setupImage || "/placeholder.svg?height=200&width=400&query=trading chart"}
            alt={`${strategy.name} setup example`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <button
          className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors"
          onClick={toggleFavorite}
        >
          <Star size={16} className={isFavorite ? "text-yellow-400 fill-yellow-400" : "text-white/70"} />
        </button>

        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="bg-white/10 border-white/20">
            {strategy.category}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{strategy.name}</h3>
          {strategy.lastUsed && (
            <div className="flex items-center text-xs text-white/50">
              <Clock size={12} className="mr-1" />
              <span>Used {strategy.lastUsed}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-xs text-white/50 mb-1">Win Rate</p>
            <p className="font-semibold">{strategy.winRate}%</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-xs text-white/50 mb-1">Profit Factor</p>
            <p className="font-semibold">{strategy.profitFactor.toFixed(1)}</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Market Conditions</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {strategy.marketConditions.map((condition, index) => (
              <Badge key={index} variant="secondary" className="bg-white/5 text-xs">
                {condition}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Timeframes</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {strategy.timeframes.map((timeframe, index) => (
              <Badge key={index} variant="secondary" className="bg-white/5 text-xs">
                {timeframe}
              </Badge>
            ))}
          </div>
        </div>

        {!compact && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">Entry Rules</h4>
                <ul className="space-y-1 text-sm text-white/70 list-disc pl-5">
                  {strategy.entryRules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">Exit Rules</h4>
                <ul className="space-y-1 text-sm text-white/70 list-disc pl-5">
                  {strategy.exitRules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" onClick={toggleExpand}>
            {isExpanded ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Less Details
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                More Details
              </>
            )}
          </Button>

          <Button size="sm" asChild>
            <Link href={`/playbook/${strategy.id}`}>
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Full View
            </Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
