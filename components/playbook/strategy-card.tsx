"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, BarChart2, Calendar, Edit, MoreHorizontal, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Strategy {
  id: string
  name: string
  description: string
  category: string
  winRate: number
  profitFactor: number
  tradesCount: number
  marketConditions: string[]
  lastUpdated: string
  setupImages: string[]
  isActive: boolean
  tags: string[]
}

interface StrategyCardProps {
  strategy: Strategy
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Format the last updated date
  const lastUpdated = formatDistanceToNow(new Date(strategy.lastUpdated), { addSuffix: true })

  // Determine performance color based on profit factor
  const getPerformanceColor = (profitFactor: number) => {
    if (profitFactor >= 2.5) return "text-green-400"
    if (profitFactor >= 1.5) return "text-blue-400"
    if (profitFactor >= 1) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/playbook/${strategy.id}`} className="block">
        <div className="relative h-40 overflow-hidden">
          <img
            src={strategy.setupImages[0] || "/placeholder.svg"}
            alt={`${strategy.name} setup example`}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="flex justify-between items-center">
              <Badge
                variant="outline"
                className={`${strategy.isActive ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-gray-500/20 text-gray-400 border-gray-500/50"}`}
              >
                {strategy.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="bg-white/10 border-white/20">
                {strategy.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            {strategy.name}
            <motion.span
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight size={16} className="ml-2" />
            </motion.span>
          </h3>

          <p className="text-white/70 text-sm mb-4 line-clamp-2">{strategy.description}</p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-xs text-white/50 mb-1">Win Rate</p>
              <p className="font-semibold">{strategy.winRate}%</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-xs text-white/50 mb-1">Profit Factor</p>
              <p className={`font-semibold ${getPerformanceColor(strategy.profitFactor)}`}>
                {strategy.profitFactor.toFixed(1)}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-xs text-white/50 mb-1">Trades</p>
              <p className="font-semibold">{strategy.tradesCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {strategy.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-white/5 text-xs">
                {tag}
              </Badge>
            ))}
            {strategy.tags.length > 3 && (
              <Badge variant="secondary" className="bg-white/5 text-xs">
                +{strategy.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>Updated {lastUpdated}</span>
            </div>
            <div className="flex items-center">
              <BarChart2 size={12} className="mr-1" />
              <span>{strategy.tradesCount} trades</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-md border-white/10">
            <DropdownMenuItem className="cursor-pointer">
              <Link href={`/playbook/${strategy.id}/edit`} className="flex items-center w-full">
                <Edit size={14} className="mr-2" />
                Edit Strategy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Link href={`/playbook/${strategy.id}`} className="flex items-center w-full">
                <BarChart2 size={14} className="mr-2" />
                View Performance
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="text-red-400 cursor-pointer">
              <Trash size={14} className="mr-2" />
              Delete Strategy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
