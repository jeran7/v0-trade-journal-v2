"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ChartType = "candlestick" | "bar" | "line" | "area"

interface ChartTypeSelectorProps {
  onChartTypeChange: (type: ChartType) => void
  defaultType?: ChartType
  className?: string
}

export function ChartTypeSelector({
  onChartTypeChange,
  defaultType = "candlestick",
  className,
}: ChartTypeSelectorProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultType)

  const handleTypeChange = (type: ChartType) => {
    setChartType(type)
    onChartTypeChange(type)
  }

  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case "candlestick":
        return (
          <div className="flex items-center gap-0.5">
            <div className="h-4 w-1 bg-red-500"></div>
            <div className="h-3 w-1 bg-green-500"></div>
            <div className="h-5 w-1 bg-red-500"></div>
            <div className="h-4 w-1 bg-green-500"></div>
          </div>
        )
      case "bar":
        return (
          <div className="flex items-end gap-0.5">
            <div className="h-3 w-1 bg-current"></div>
            <div className="h-2 w-1 bg-current"></div>
            <div className="h-4 w-1 bg-current"></div>
            <div className="h-3 w-1 bg-current"></div>
          </div>
        )
      case "line":
        return (
          <div className="flex items-center h-4">
            <div className="w-8 h-0.5 bg-current relative">
              <div className="absolute w-1 h-1 rounded-full bg-current top-1/2 -translate-y-1/2 left-0"></div>
              <div className="absolute w-1 h-1 rounded-full bg-current top-1/2 -translate-y-1/2 right-0"></div>
            </div>
          </div>
        )
      case "area":
        return (
          <div className="relative h-4 w-8">
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-primary/20 rounded-sm"></div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            <div className="absolute w-1 h-1 rounded-full bg-primary bottom-0 left-0"></div>
            <div className="absolute w-1 h-1 rounded-full bg-primary bottom-3 right-0"></div>
          </div>
        )
      default:
        return null
    }
  }

  const getChartTypeName = (type: ChartType): string => {
    switch (type) {
      case "candlestick":
        return "Candlestick"
      case "bar":
        return "Bar"
      case "line":
        return "Line"
      case "area":
        return "Area"
      default:
        return type
    }
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {getChartTypeIcon(chartType)}
            <span>{getChartTypeName(chartType)}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 backdrop-blur-xl bg-black/50 border-slate-800">
          <DropdownMenuLabel>Chart Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {["candlestick", "bar", "line", "area"].map((type) => (
              <DropdownMenuItem
                key={type}
                className={`flex items-center gap-2 cursor-pointer ${chartType === type ? "bg-primary/20" : ""}`}
                onClick={() => handleTypeChange(type as ChartType)}
              >
                {getChartTypeIcon(type as ChartType)}
                <span>{getChartTypeName(type as ChartType)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
