"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { BaseChart, type ChartData, type ChartMarker } from "./base-chart"
import { Badge } from "@/components/ui/badge"

interface PatternZone {
  startTime: number
  endTime: number
  type: "entry" | "exit" | "caution" | "avoid"
  label: string
  description: string
}

interface StrategyPatternVisualizationProps {
  strategyName: string
  description: string
  data: ChartData[]
  patternZones?: PatternZone[]
  similarityScore?: number
  className?: string
}

export function StrategyPatternVisualization({
  strategyName,
  description,
  data,
  patternZones = [],
  similarityScore,
  className,
}: StrategyPatternVisualizationProps) {
  const [showPatterns, setShowPatterns] = useState(true)

  // Convert pattern zones to chart markers
  const patternMarkers: ChartMarker[] = patternZones.map((zone, index) => {
    let color = "#4CAF50" // green for entry
    let shape: "arrow" | "circle" | "square" = "arrow"

    if (zone.type === "exit") {
      color = "#FF9800" // orange for exit
      shape = "arrow"
    } else if (zone.type === "caution") {
      color = "#FFC107" // yellow for caution
      shape = "circle"
    } else if (zone.type === "avoid") {
      color = "#F44336" // red for avoid
      shape = "square"
    }

    return {
      time: zone.startTime as any,
      position: "aboveBar",
      color,
      shape,
      text: zone.label,
      id: `pattern-${index}`,
      type: zone.type,
    }
  })

  const getSimilarityColor = (score?: number) => {
    if (!score) return "bg-gray-500"
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getSimilarityText = (score?: number) => {
    if (!score) return "Unknown"
    if (score >= 80) return "High"
    if (score >= 60) return "Medium"
    return "Low"
  }

  return (
    <GlassCard className={className}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{strategyName} Pattern</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {similarityScore !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Similarity:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${getSimilarityColor(similarityScore)}`}></div>
                <span>{getSimilarityText(similarityScore)}</span>
                <span className="text-xs">({similarityScore}%)</span>
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={showPatterns ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPatterns(!showPatterns)}
            >
              {showPatterns ? "Hide Patterns" : "Show Patterns"}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Entry</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span className="text-xs">Exit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Caution</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Avoid</span>
            </div>
          </div>
        </div>

        <BaseChart
          data={data}
          markers={showPatterns ? patternMarkers : []}
          height={400}
          className="w-full"
          onMarkerClick={(marker) => {
            // Find the corresponding pattern zone
            const zone = patternZones.find((z, i) => `pattern-${i}` === marker.id)
            if (zone) {
              // Show tooltip or modal with pattern details
              console.log("Pattern clicked:", zone)
            }
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patternZones.map((zone, index) => (
            <div key={index} className="flex items-start gap-2 p-3 rounded-md bg-card/50 border border-border">
              {zone.type === "entry" && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
              {zone.type === "exit" && <XCircle className="h-5 w-5 text-orange-500 shrink-0" />}
              {zone.type === "caution" && <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />}
              {zone.type === "avoid" && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}

              <div>
                <div className="font-medium">{zone.label}</div>
                <div className="text-sm text-muted-foreground">{zone.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
