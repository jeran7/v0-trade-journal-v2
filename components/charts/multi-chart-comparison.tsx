"use client"

import { useState, useEffect } from "react"
import { Maximize2, Minimize2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BaseChart, type ChartData, type ChartMarker } from "./base-chart"
import { TimeframeControls, type Timeframe } from "./timeframe-controls"
import { ChartTypeSelector, type ChartType } from "./chart-type-selector"
import { GlassCard } from "@/components/ui/glass-card"

interface ChartConfig {
  timeframe: Timeframe
  chartType: ChartType
  isMaximized: boolean
}

interface MultiChartComparisonProps {
  symbol: string
  data: {
    [key: string]: ChartData[]
  }
  markers?: {
    [key: string]: ChartMarker[]
  }
  className?: string
  onTimeframeChange?: (timeframe: Timeframe, chartIndex: number) => void
  onChartTypeChange?: (chartType: ChartType, chartIndex: number) => void
}

export function MultiChartComparison({
  symbol,
  data,
  markers = {},
  className,
  onTimeframeChange,
  onChartTypeChange,
}: MultiChartComparisonProps) {
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([
    { timeframe: "1D", chartType: "candlestick", isMaximized: false },
    { timeframe: "1h", chartType: "candlestick", isMaximized: false },
  ])

  const [syncScrolling, setSyncScrolling] = useState(true)
  const [chartData, setChartData] = useState<{ [key: string]: ChartData[] }>(data)
  const [chartMarkers, setChartMarkers] = useState<{ [key: string]: ChartMarker[] }>(markers)

  // Update data when props change
  useEffect(() => {
    setChartData(data)
  }, [data])

  // Update markers when props change
  useEffect(() => {
    setChartMarkers(markers)
  }, [markers])

  const handleTimeframeChange = (timeframe: Timeframe, index: number) => {
    const newConfigs = [...chartConfigs]
    newConfigs[index].timeframe = timeframe
    setChartConfigs(newConfigs)

    if (onTimeframeChange) {
      onTimeframeChange(timeframe, index)
    }
  }

  const handleChartTypeChange = (chartType: ChartType, index: number) => {
    const newConfigs = [...chartConfigs]
    newConfigs[index].chartType = chartType
    setChartConfigs(newConfigs)

    if (onChartTypeChange) {
      onChartTypeChange(chartType, index)
    }
  }

  const toggleMaximize = (index: number) => {
    const newConfigs = chartConfigs.map((config, i) => ({
      ...config,
      isMaximized: i === index ? !config.isMaximized : false,
    }))
    setChartConfigs(newConfigs)
  }

  const toggleSyncScrolling = () => {
    setSyncScrolling(!syncScrolling)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{symbol} Multi-Timeframe Analysis</h2>
        <Button
          variant={syncScrolling ? "default" : "outline"}
          size="sm"
          onClick={toggleSyncScrolling}
          className="gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sync Scrolling
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartConfigs.map((config, index) => {
          // If any chart is maximized, only show that one
          const anyMaximized = chartConfigs.some((c) => c.isMaximized)
          if (anyMaximized && !config.isMaximized) {
            return null
          }

          // Adjust column span if maximized
          const colSpan = config.isMaximized ? "md:col-span-2" : ""

          return (
            <GlassCard key={index} className={`overflow-hidden ${colSpan}`}>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TimeframeControls
                      onTimeframeChange={(tf) => handleTimeframeChange(tf, index)}
                      defaultTimeframe={config.timeframe}
                    />
                    <ChartTypeSelector
                      onChartTypeChange={(ct) => handleChartTypeChange(ct, index)}
                      defaultType={config.chartType}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleMaximize(index)}>
                    {config.isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>

                <BaseChart
                  data={chartData[config.timeframe] || []}
                  markers={chartMarkers[config.timeframe] || []}
                  chartType={config.chartType}
                  height={config.isMaximized ? 600 : 300}
                  className="w-full"
                />
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
