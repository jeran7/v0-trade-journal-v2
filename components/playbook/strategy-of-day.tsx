"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Star, Calendar, ChevronDown, ChevronUp, CheckCircle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface StrategyOfDayProps {
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
    checklist: {
      id: string
      text: string
      isCompleted: boolean
    }[]
    marketFit: number
  }
  className?: string
}

export function StrategyOfDay({ strategy, className = "" }: StrategyOfDayProps) {
  const [isFavorite, setIsFavorite] = useState(strategy.isFavorite)
  const [isExpanded, setIsExpanded] = useState(false)
  const [checklist, setChecklist] = useState(strategy.checklist)

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

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item)))
  }

  const completedItems = checklist.filter((item) => item.isCompleted).length
  const totalItems = checklist.length
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Strategy of the Day</h3>
            <p className="text-sm text-white/60">Selected based on current market conditions</p>
          </div>
        </div>
        <div className="flex items-center">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 mr-2">
            {strategy.marketFit}% Market Fit
          </Badge>
          <button
            className="h-8 w-8 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors"
            onClick={toggleFavorite}
          >
            <Star size={16} className={isFavorite ? "text-yellow-400 fill-yellow-400" : "text-white/70"} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative h-64 overflow-hidden">
          <img
            src={strategy.setupImage || "/placeholder.svg?height=400&width=600&query=trading chart"}
            alt={`${strategy.name} setup example`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          <div className="absolute bottom-4 left-4">
            <h2 className="text-xl font-bold mb-1">{strategy.name}</h2>
            <Badge variant="outline" className="bg-white/10 border-white/20">
              {strategy.category}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-xs text-white/50 mb-1">Win Rate</p>
              <p className="text-xl font-semibold">{strategy.winRate}%</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-xs text-white/50 mb-1">Profit Factor</p>
              <p className="text-xl font-semibold">{strategy.profitFactor.toFixed(1)}</p>
            </div>
          </div>

          <div className="mb-4">
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

          <div className="mb-4">
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

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" onClick={toggleExpand}>
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Hide Checklist
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  Show Checklist
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
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Pre-Trade Checklist</h3>
            <div className="flex items-center">
              <span className="text-sm mr-2">
                {completedItems} of {totalItems} completed
              </span>
              <Progress
                value={completionPercentage}
                className="w-24 h-2"
                style={
                  {
                    "--progress-background": "rgba(255, 255, 255, 0.1)",
                    "--progress-foreground": "hsl(var(--primary))",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start p-2 rounded-md hover:bg-white/5 cursor-pointer"
                onClick={() => toggleChecklistItem(item.id)}
              >
                <div className="mt-0.5 mr-3">
                  {item.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-white/30" />
                  )}
                </div>
                <span className={item.isCompleted ? "text-white/50 line-through" : ""}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </GlassCard>
  )
}
