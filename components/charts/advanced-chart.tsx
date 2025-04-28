"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createChart, ColorType, type IChartApi, type ISeriesApi, type Time } from "lightweight-charts"
import { Save, Share2, Settings, Maximize2, Minimize2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getPriceData, type PriceDataPoint, type Timeframe } from "@/lib/supabase/price-data-service"
import { saveChartPreference, getDefaultChartPreference } from "@/lib/supabase/chart-preferences-service"
import { getChartDrawings, saveChartDrawing } from "@/lib/supabase/chart-drawings-service"
import { subscribeToRealtimeUpdates } from "@/lib/supabase/price-data-service"
import { useUser } from "@/lib/supabase/auth-context" // You'll need to create this context

export type ChartType = "candlestick" | "bar" | "line" | "area"

interface AdvancedChartProps {
  symbol: string
  initialTimeframe?: Timeframe
  initialChartType?: ChartType
  height?: number
  className?: string
  showToolbar?: boolean
  showTabs?: boolean
  onSymbolChange?: (symbol: string) => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  tradeMarkers?: {
    time: number
    position: "aboveBar" | "belowBar"
    color: string
    shape: "arrow" | "circle" | "square"
    text: string
    id: string
  }[]
}

export function AdvancedChart({
  symbol,
  initialTimeframe = "1D",
  initialChartType = "candlestick",
  height = 500,
  className = "",
  showToolbar = true,
  showTabs = true,
  onSymbolChange,
  isFullscreen = false,
  onToggleFullscreen,
  tradeMarkers = [],
}: AdvancedChartProps) {
  const { user } = useUser()
  const { toast } = useToast()

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const [series, setSeries] = useState<ISeriesApi<any> | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe)
  const [chartType, setChartType] = useState<ChartType>(initialChartType)
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawings, setDrawings] = useState<any[]>([])
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null)
  const [indicators, setIndicators] = useState<any[]>([])

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (chart) {
        chart.applyOptions({
          width: chartContainerRef.current?.clientWidth || 600,
        })
      }
    }

    const newChart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255, 255, 255, 0.7)",
        fontSize: 12,
        fontFamily: "SF Pro Display, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.07)" },
        horzLines: { color: "rgba(255, 255, 255, 0.07)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255, 255, 255, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "rgba(30, 30, 30, 0.9)",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "rgba(30, 30, 30, 0.9)",
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    })

    setChart(newChart)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (newChart) {
        newChart.remove()
      }
    }
  }, [height])

  // Update chart height when fullscreen mode changes
  useEffect(() => {
    if (chart) {
      chart.applyOptions({
        height: isFullscreen ? window.innerHeight - 200 : height,
      })
    }
  }, [isFullscreen, height, chart])

  // Create series based on chart type
  useEffect(() => {
    if (!chart) return

    // Remove existing series
    if (series) {
      chart.removeSeries(series)
    }

    let newSeries

    switch (chartType) {
      case "candlestick":
        newSeries = chart.addCandlestickSeries({
          upColor: "rgba(38, 166, 154, 0.8)",
          downColor: "rgba(239, 83, 80, 0.8)",
          borderVisible: false,
          wickUpColor: "rgba(38, 166, 154, 0.5)",
          wickDownColor: "rgba(239, 83, 80, 0.5)",
        })
        break
      case "bar":
        newSeries = chart.addBarSeries({
          upColor: "rgba(38, 166, 154, 0.8)",
          downColor: "rgba(239, 83, 80, 0.8)",
        })
        break
      case "line":
        newSeries = chart.addLineSeries({
          color: "rgba(41, 98, 255, 0.8)",
          lineWidth: 2,
        })
        break
      case "area":
        newSeries = chart.addAreaSeries({
          topColor: "rgba(41, 98, 255, 0.4)",
          bottomColor: "rgba(41, 98, 255, 0.0)",
          lineColor: "rgba(41, 98, 255, 0.8)",
          lineWidth: 2,
        })
        break
    }

    setSeries(newSeries)

    // Apply data to the new series if available
    if (priceData.length > 0) {
      newSeries.setData(
        priceData.map((point) => ({
          time: point.time as Time,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
          volume: point.volume || 0,
        })),
      )

      // Add trade markers if available
      if (tradeMarkers.length > 0) {
        newSeries.setMarkers(tradeMarkers)
      }

      // Fit content to view
      chart.timeScale().fitContent()
    }
  }, [chart, chartType, priceData, tradeMarkers])

  // Fetch price data when symbol or timeframe changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Calculate time range based on timeframe
        const now = Math.floor(Date.now() / 1000)
        let from

        switch (timeframe) {
          case "1m":
            from = now - 60 * 60 * 24 // 1 day
            break
          case "5m":
            from = now - 60 * 60 * 24 * 3 // 3 days
            break
          case "15m":
            from = now - 60 * 60 * 24 * 7 // 7 days
            break
          case "1h":
            from = now - 60 * 60 * 24 * 30 // 30 days
            break
          case "4h":
            from = now - 60 * 60 * 24 * 90 // 90 days
            break
          case "1D":
            from = now - 60 * 60 * 24 * 365 // 1 year
            break
          case "1W":
            from = now - 60 * 60 * 24 * 365 * 2 // 2 years
            break
          default:
            from = now - 60 * 60 * 24 * 30 // Default to 30 days
        }

        const data = await getPriceData(symbol, timeframe, from)
        setPriceData(data)

        // Fetch user's drawings if user is logged in
        if (user) {
          const userDrawings = await getChartDrawings(symbol, timeframe, user.id)
          setDrawings(userDrawings)
        }

        // Load user preferences if available
        if (user) {
          const preferences = await getDefaultChartPreference(user.id, symbol, timeframe)
          if (preferences) {
            // Apply saved indicators
            if (preferences.indicators) {
              setIndicators(preferences.indicators)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setError("Failed to load chart data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealtimeUpdates(symbol, timeframe, (newData) => {
      setPriceData((prevData) => {
        // Check if this update already exists in our data
        const existingIndex = prevData.findIndex((p) => p.time === newData.time)

        if (existingIndex >= 0) {
          // Update existing candle
          const updatedData = [...prevData]
          updatedData[existingIndex] = newData
          return updatedData
        } else {
          // Add new candle
          return [...prevData, newData]
        }
      })
    })

    return () => {
      unsubscribe()
    }
  }, [symbol, timeframe, user])

  // Apply indicators to chart
  useEffect(() => {
    if (!chart || !series || indicators.length === 0) return

    // Clear existing indicators
    chart.series().forEach((s) => {
      if (s !== series) {
        chart.removeSeries(s)
      }
    })

    // Add each indicator
    indicators.forEach((indicator) => {
      if (!indicator.visible) return

      switch (indicator.type) {
        case "ma":
          addMovingAverage(indicator.settings.period, indicator.settings.color)
          break
        case "ema":
          addExponentialMovingAverage(indicator.settings.period, indicator.settings.color)
          break
        case "bollinger":
          addBollingerBands(indicator.settings.period, indicator.settings.deviation, indicator.settings.color)
          break
        // Add more indicators as needed
      }
    })
  }, [chart, series, indicators, priceData])

  // Helper functions for indicators
  const addMovingAverage = useCallback(
    (period: number, color: string) => {
      if (!chart || !priceData.length) return

      const maData = []
      for (let i = period - 1; i < priceData.length; i++) {
        let sum = 0
        for (let j = 0; j < period; j++) {
          sum += priceData[i - j].close
        }

        maData.push({
          time: priceData[i].time as Time,
          value: sum / period,
        })
      }

      const maSeries = chart.addLineSeries({
        color,
        lineWidth: 1.5,
        priceLineVisible: false,
      })

      maSeries.setData(maData)
    },
    [chart, priceData],
  )

  const addExponentialMovingAverage = useCallback(
    (period: number, color: string) => {
      if (!chart || !priceData.length || period >= priceData.length) return

      const emaData = []
      const multiplier = 2 / (period + 1)
      let ema = priceData[0].close

      for (let i = 0; i < priceData.length; i++) {
        ema = (priceData[i].close - ema) * multiplier + ema

        emaData.push({
          time: priceData[i].time as Time,
          value: ema,
        })
      }

      const emaSeries = chart.addLineSeries({
        color,
        lineWidth: 1.5,
        priceLineVisible: false,
      })

      emaSeries.setData(emaData)
    },
    [chart, priceData],
  )

  const addBollingerBands = useCallback(
    (period: number, deviation: number, color: string) => {
      if (!chart || !priceData.length || period >= priceData.length) return

      const upperData = []
      const middleData = []
      const lowerData = []

      for (let i = period - 1; i < priceData.length; i++) {
        let sum = 0
        for (let j = 0; j < period; j++) {
          sum += priceData[i - j].close
        }

        const sma = sum / period

        let squaredDeviationSum = 0
        for (let j = 0; j < period; j++) {
          const diff = priceData[i - j].close - sma
          squaredDeviationSum += diff * diff
        }

        const stdDev = Math.sqrt(squaredDeviationSum / period)

        upperData.push({
          time: priceData[i].time as Time,
          value: sma + stdDev * deviation,
        })

        middleData.push({
          time: priceData[i].time as Time,
          value: sma,
        })

        lowerData.push({
          time: priceData[i].time as Time,
          value: sma - stdDev * deviation,
        })
      }

      const upperSeries = chart.addLineSeries({
        color,
        lineWidth: 1,
        priceLineVisible: false,
      })

      const middleSeries = chart.addLineSeries({
        color,
        lineWidth: 1.5,
        priceLineVisible: false,
      })

      const lowerSeries = chart.addLineSeries({
        color,
        lineWidth: 1,
        priceLineVisible: false,
      })

      upperSeries.setData(upperData)
      middleSeries.setData(middleData)
      lowerSeries.setData(lowerData)
    },
    [chart, priceData],
  )

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  // Handle chart type change
  const handleChartTypeChange = (newChartType: ChartType) => {
    setChartType(newChartType)
  }

  // Save user preferences
  const handleSavePreferences = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to save preferences",
        variant: "destructive",
      })
      return
    }

    try {
      const preference = await saveChartPreference({
        user_id: user.id,
        name: `${symbol} ${timeframe} Default`,
        symbol,
        timeframe,
        chart_type: chartType,
        indicators,
        drawings: drawings.map((d) => d.id),
      })

      if (preference) {
        toast({
          title: "Preferences saved",
          description: "Your chart preferences have been saved",
        })
      }
    } catch (err) {
      console.error("Error saving preferences:", err)
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    }
  }

  // Handle drawing tool selection
  const handleDrawingToolSelect = (tool: string | null) => {
    setActiveDrawingTool(tool)

    // Implement drawing tool logic here
    // This would involve adding event listeners to the chart
    // and handling mouse interactions
  }

  // Save a drawing
  const handleSaveDrawing = async (drawingData: any) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to save drawings",
        variant: "destructive",
      })
      return
    }

    try {
      const drawing = await saveChartDrawing({
        user_id: user.id,
        symbol,
        timeframe,
        drawing_type: activeDrawingTool || "line",
        drawing_data: drawingData,
        is_public: false,
      })

      if (drawing) {
        setDrawings((prev) => [...prev, drawing])
        toast({
          title: "Drawing saved",
          description: "Your drawing has been saved",
        })
      }
    } catch (err) {
      console.error("Error saving drawing:", err)
      toast({
        title: "Error",
        description: "Failed to save drawing",
        variant: "destructive",
      })
    }
  }

  return (
    <GlassCard className={`${className} ${isFullscreen ? "fixed inset-0 z-50 m-0 rounded-none" : ""}`}>
      <div className="p-4 space-y-4">
        {/* Chart Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{symbol}</h2>
            <span className="text-sm text-muted-foreground">
              {timeframe} • {chartType}
            </span>
          </div>

          {showToolbar && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSavePreferences}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              {onToggleFullscreen && (
                <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {["1m", "5m", "15m", "1h", "4h", "1D", "1W"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeframeChange(tf as Timeframe)}
              className="h-8 px-3 text-xs font-medium"
            >
              {tf}
            </Button>
          ))}

          {/* Chart Type Selector */}
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="gap-1">
              {chartType}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="text-destructive">{error}</div>
            </div>
          )}

          <div
            ref={chartContainerRef}
            className="w-full transition-opacity duration-500"
            style={{ height: isFullscreen ? "calc(100vh - 200px)" : height }}
          />
        </div>

        {/* Tabs Section */}
        {showTabs && (
          <Tabs defaultValue="trades" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="drawings">Drawings</TabsTrigger>
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
            </TabsList>

            <TabsContent value="trades" className="mt-4">
              {tradeMarkers.length > 0 ? (
                <div className="space-y-2">
                  {tradeMarkers.map((marker, index) => (
                    <div key={index} className="p-3 rounded-md border border-border bg-card/50">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: marker.color }} />
                        <span>{marker.text}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(marker.time * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No trades available for this chart</div>
              )}
            </TabsContent>

            <TabsContent value="drawings" className="mt-4">
              {drawings.length > 0 ? (
                <div className="space-y-2">
                  {drawings.map((drawing, index) => (
                    <div key={index} className="p-3 rounded-md border border-border bg-card/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{drawing.drawing_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No drawings available for this chart</div>
              )}
            </TabsContent>

            <TabsContent value="indicators" className="mt-4">
              {indicators.length > 0 ? (
                <div className="space-y-2">
                  {indicators.map((indicator, index) => (
                    <div key={index} className="p-3 rounded-md border border-border bg-card/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: indicator.settings.color }} />
                          <span>{indicator.type.toUpperCase()}</span>
                          {indicator.settings.period && (
                            <span className="text-xs text-muted-foreground">Period: {indicator.settings.period}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIndicators((prev) =>
                                prev.map((ind, i) => (i === index ? { ...ind, visible: !ind.visible } : ind)),
                              )
                            }}
                          >
                            {indicator.visible ? "Hide" : "Show"}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No indicators added to this chart</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </GlassCard>
  )
}
