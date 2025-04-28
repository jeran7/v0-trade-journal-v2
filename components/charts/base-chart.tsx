"use client"

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

export interface ChartData {
  time: Time
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface ChartMarker {
  time: Time
  position: "aboveBar" | "belowBar"
  color: string
  shape: "arrow" | "circle" | "square"
  text: string
  size?: number
  id?: string
  type?: "entry" | "exit" | "stop" | "target"
}

export interface BaseChartProps {
  data: ChartData[]
  markers?: ChartMarker[]
  height?: number
  width?: string
  className?: string
  chartType?: "candlestick" | "bar" | "line" | "area"
  onMarkerClick?: (marker: ChartMarker) => void
  onTimeRangeChange?: (from: UTCTimestamp, to: UTCTimestamp) => void
  darkMode?: boolean
  autosize?: boolean
}

export function BaseChart({
  data,
  markers = [],
  height = 400,
  width = "100%",
  className,
  chartType = "candlestick",
  onMarkerClick,
  onTimeRangeChange,
  darkMode = true,
  autosize = true,
}: BaseChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const [series, setSeries] = useState<
    ISeriesApi<"candlestick"> | ISeriesApi<"bar"> | ISeriesApi<"line"> | ISeriesApi<"area"> | null
  >(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    setIsLoading(true)

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        fontSize: 12,
        fontFamily: "SF Pro Display, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: darkMode ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)" },
        horzLines: { color: darkMode ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: darkMode ? "rgba(30, 30, 30, 0.9)" : "rgba(250, 250, 250, 0.9)",
        },
        horzLine: {
          color: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: darkMode ? "rgba(30, 30, 30, 0.9)" : "rgba(250, 250, 250, 0.9)",
        },
      },
      timeScale: {
        borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
      },
      rightPriceScale: {
        borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        borderVisible: true,
      },
      handleScroll: {
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
      autoSize: autosize,
      width: autosize ? undefined : typeof width === "number" ? width : chartContainerRef.current.clientWidth,
      height: height,
    }

    const newChart = createChart(chartContainerRef.current, chartOptions)
    setChart(newChart)

    let newSeries

    switch (chartType) {
      case "candlestick":
        newSeries = newChart.addCandlestickSeries({
          upColor: "rgba(38, 166, 154, 0.8)",
          downColor: "rgba(239, 83, 80, 0.8)",
          borderVisible: false,
          wickUpColor: "rgba(38, 166, 154, 0.5)",
          wickDownColor: "rgba(239, 83, 80, 0.5)",
        })
        break
      case "bar":
        newSeries = newChart.addBarSeries({
          upColor: "rgba(38, 166, 154, 0.8)",
          downColor: "rgba(239, 83, 80, 0.8)",
        })
        break
      case "line":
        newSeries = newChart.addLineSeries({
          color: "rgba(41, 98, 255, 0.8)",
          lineWidth: 2,
        })
        break
      case "area":
        newSeries = newChart.addAreaSeries({
          topColor: "rgba(41, 98, 255, 0.4)",
          bottomColor: "rgba(41, 98, 255, 0.0)",
          lineColor: "rgba(41, 98, 255, 0.8)",
          lineWidth: 2,
        })
        break
    }

    setSeries(newSeries)

    // Add time range change handler
    if (onTimeRangeChange) {
      newChart.timeScale().subscribeVisibleTimeRangeChange((param) => {
        if (param?.from && param?.to) {
          onTimeRangeChange(param.from as UTCTimestamp, param.to as UTCTimestamp)
        }
      })
    }

    // Cleanup function
    return () => {
      if (newChart) {
        newChart.remove()
        setChart(null)
        setSeries(null)
      }
    }
  }, [chartType, darkMode, height, width, autosize, onTimeRangeChange])

  // Update data when it changes
  useEffect(() => {
    if (series && data.length > 0) {
      setIsLoading(true)

      // Add animation delay for smooth transition
      setTimeout(
        () => {
          series.setData(data)

          // Fit content after data is loaded
          if (chart) {
            chart.timeScale().fitContent()
          }

          setIsLoading(false)
          setIsInitialized(true)
        },
        isInitialized ? 300 : 0,
      )
    }
  }, [series, data, chart, isInitialized])

  // Update markers when they change
  useEffect(() => {
    if (series && markers.length > 0) {
      // Clear existing markers
      series.setMarkers([])

      // Add animation delay for smooth transition
      setTimeout(() => {
        // Format markers for the chart
        const formattedMarkers = markers.map((marker) => {
          const baseMarker = {
            time: marker.time,
            position: marker.position,
            color: marker.color,
            shape: marker.shape,
            text: marker.text,
            size: marker.size || 1,
            id: marker.id,
          }

          return baseMarker
        })

        series.setMarkers(formattedMarkers)

        // Add click handler for markers
        if (onMarkerClick) {
          chart?.subscribeCrosshairMove((param) => {
            if (param.hoveredObjectId) {
              const marker = markers.find((m) => m.id === param.hoveredObjectId)
              if (marker) {
                onMarkerClick(marker)
              }
            }
          })
        }
      }, 500)
    }
  }, [series, markers, chart, onMarkerClick])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chart && autosize) {
        chart.applyOptions({ width: chartContainerRef.current?.clientWidth })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [chart, autosize])

  return (
    <GlassCard className={cn("relative overflow-hidden", className)}>
      <div
        ref={chartContainerRef}
        className={cn("w-full transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      )}
    </GlassCard>
  )
}
