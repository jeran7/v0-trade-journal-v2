"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Maximize2, Minimize2, Play, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface ChartDataPoint {
  time: string
  price: number
  volume: number
  ma20?: number
  ma50?: number
  ma200?: number
  upperBand?: number
  lowerBand?: number
  entry?: number
  exit?: number
  stopLoss?: number
  takeProfit?: number
}

interface MultiTimeframeChartProps {
  symbol: string
  data: {
    [key: string]: ChartDataPoint[]
  }
  entryPrice: number
  exitPrice: number
  stopLossPrice: number
  takeProfitPrice: number
  entryTime: string
  exitTime: string
  type: "Long" | "Short"
  className?: string
}

export function MultiTimeframeChart({
  symbol,
  data,
  entryPrice,
  exitPrice,
  stopLossPrice,
  takeProfitPrice,
  entryTime,
  exitTime,
  type,
  className,
}: MultiTimeframeChartProps) {
  const [timeframe, setTimeframe] = useState("15m")
  const [chartType, setChartType] = useState("candle")
  const [indicators, setIndicators] = useState(["ma20", "ma50"])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isReplaying, setIsReplaying] = useState(false)
  const [replayProgress, setReplayProgress] = useState(0)
  const [visibleData, setVisibleData] = useState<ChartDataPoint[]>([])

  // Initialize with all data
  useEffect(() => {
    if (data && data[timeframe]) {
      setVisibleData(data[timeframe])
    }
  }, [data, timeframe])

  // Handle replay functionality
  useEffect(() => {
    if (!isReplaying || !data || !data[timeframe]) return

    const totalPoints = data[timeframe].length
    const interval = setInterval(() => {
      setReplayProgress((prev) => {
        const newProgress = prev + 1
        if (newProgress >= totalPoints) {
          setIsReplaying(false)
          return totalPoints
        }
        return newProgress
      })
    }, 300)

    return () => clearInterval(interval)
  }, [isReplaying, data, timeframe])

  // Update visible data based on replay progress
  useEffect(() => {
    if (!data || !data[timeframe]) return

    if (isReplaying) {
      const endIndex = Math.max(1, Math.floor((replayProgress / 100) * data[timeframe].length))
      setVisibleData(data[timeframe].slice(0, endIndex))
    } else {
      setVisibleData(data[timeframe])
    }
  }, [replayProgress, isReplaying, data, timeframe])

  const toggleReplay = () => {
    if (isReplaying) {
      setIsReplaying(false)
    } else {
      setReplayProgress(0)
      setIsReplaying(true)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Find min and max for chart scaling
  const priceData = visibleData.map((d) => d.price)
  const minPrice = Math.min(...priceData) * 0.995
  const maxPrice = Math.max(...priceData) * 1.005

  // Determine if trade was profitable
  const isProfitable = type === "Long" ? exitPrice > entryPrice : exitPrice < entryPrice

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg bg-card transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 p-4" : "",
        className,
      )}
    >
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{symbol}</span>
          <span className="text-sm text-muted-foreground">{timeframe}</span>
        </div>

        <div className="flex items-center gap-2">
          <Tabs defaultValue={chartType} onValueChange={setChartType} className="h-8">
            <TabsList className="h-8">
              <TabsTrigger value="candle" className="h-7 px-2 text-xs">
                Candle
              </TabsTrigger>
              <TabsTrigger value="line" className="h-7 px-2 text-xs">
                Line
              </TabsTrigger>
              <TabsTrigger value="area" className="h-7 px-2 text-xs">
                Area
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="h-8">
            <TabsList className="h-8">
              <TabsTrigger value="1m" className="h-7 px-2 text-xs">
                1m
              </TabsTrigger>
              <TabsTrigger value="5m" className="h-7 px-2 text-xs">
                5m
              </TabsTrigger>
              <TabsTrigger value="15m" className="h-7 px-2 text-xs">
                15m
              </TabsTrigger>
              <TabsTrigger value="1h" className="h-7 px-2 text-xs">
                1h
              </TabsTrigger>
              <TabsTrigger value="1d" className="h-7 px-2 text-xs">
                1D
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Indicators</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={indicators.includes("ma20") ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setIndicators((prev) =>
                        prev.includes("ma20") ? prev.filter((i) => i !== "ma20") : [...prev, "ma20"],
                      )
                    }
                    className="h-7 text-xs"
                  >
                    MA 20
                  </Button>
                  <Button
                    variant={indicators.includes("ma50") ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setIndicators((prev) =>
                        prev.includes("ma50") ? prev.filter((i) => i !== "ma50") : [...prev, "ma50"],
                      )
                    }
                    className="h-7 text-xs"
                  >
                    MA 50
                  </Button>
                  <Button
                    variant={indicators.includes("ma200") ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setIndicators((prev) =>
                        prev.includes("ma200") ? prev.filter((i) => i !== "ma200") : [...prev, "ma200"],
                      )
                    }
                    className="h-7 text-xs"
                  >
                    MA 200
                  </Button>
                  <Button
                    variant={indicators.includes("bollinger") ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setIndicators((prev) =>
                        prev.includes("bollinger") ? prev.filter((i) => i !== "bollinger") : [...prev, "bollinger"],
                      )
                    }
                    className="h-7 text-xs"
                  >
                    Bollinger
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="relative flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />

            {/* Main price line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              dot={false}
              strokeWidth={2}
              animationDuration={1000}
            />

            {/* Moving averages */}
            {indicators.includes("ma20") && (
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="hsl(var(--chart-1))"
                dot={false}
                strokeWidth={1.5}
                animationDuration={1000}
              />
            )}
            {indicators.includes("ma50") && (
              <Line
                type="monotone"
                dataKey="ma50"
                stroke="hsl(var(--chart-2))"
                dot={false}
                strokeWidth={1.5}
                animationDuration={1000}
              />
            )}
            {indicators.includes("ma200") && (
              <Line
                type="monotone"
                dataKey="ma200"
                stroke="hsl(var(--chart-3))"
                dot={false}
                strokeWidth={1.5}
                animationDuration={1000}
              />
            )}

            {/* Bollinger bands */}
            {indicators.includes("bollinger") && (
              <>
                <Line
                  type="monotone"
                  dataKey="upperBand"
                  stroke="hsl(var(--chart-4))"
                  strokeDasharray="3 3"
                  dot={false}
                  strokeWidth={1.5}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="hsl(var(--chart-4))"
                  strokeDasharray="3 3"
                  dot={false}
                  strokeWidth={1.5}
                  animationDuration={1000}
                />
              </>
            )}

            {/* Entry and exit points */}
            <Line
              type="monotone"
              dataKey="entry"
              stroke={type === "Long" ? "hsl(var(--profit))" : "hsl(var(--loss))"}
              strokeWidth={0}
              dot={{
                r: 6,
                fill: type === "Long" ? "hsl(var(--profit))" : "hsl(var(--loss))",
                strokeWidth: 2,
                stroke: "hsl(var(--background))",
              }}
              activeDot={{
                r: 8,
                fill: type === "Long" ? "hsl(var(--profit))" : "hsl(var(--loss))",
                strokeWidth: 2,
                stroke: "hsl(var(--background))",
              }}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="exit"
              stroke={isProfitable ? "hsl(var(--profit))" : "hsl(var(--loss))"}
              strokeWidth={0}
              dot={{
                r: 6,
                fill: isProfitable ? "hsl(var(--profit))" : "hsl(var(--loss))",
                strokeWidth: 2,
                stroke: "hsl(var(--background))",
              }}
              activeDot={{
                r: 8,
                fill: isProfitable ? "hsl(var(--profit))" : "hsl(var(--loss))",
                strokeWidth: 2,
                stroke: "hsl(var(--background))",
              }}
              animationDuration={1000}
            />

            {/* Stop loss and take profit levels */}
            <Line
              type="monotone"
              dataKey="stopLoss"
              stroke="hsl(var(--loss))"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={false}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="takeProfit"
              stroke="hsl(var(--profit))"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Volume chart */}
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="volume" fill="hsl(var(--muted-foreground))" opacity={0.5} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Replay controls */}
      <div className="flex items-center gap-4 p-2">
        <Button
          variant="outline"
          size="icon"
          className={cn("h-8 w-8", isReplaying && "bg-primary text-primary-foreground")}
          onClick={toggleReplay}
        >
          <Play className="h-4 w-4" />
        </Button>
        <Slider
          value={[replayProgress]}
          max={100}
          step={1}
          className="flex-1"
          onValueChange={(value) => {
            setReplayProgress(value[0])
            if (data && data[timeframe]) {
              const endIndex = Math.max(1, Math.floor((value[0] / 100) * data[timeframe].length))
              setVisibleData(data[timeframe].slice(0, endIndex))
            }
          }}
        />
        <span className="text-xs text-muted-foreground">{Math.floor(replayProgress)}%</span>
      </div>
    </div>
  )
}
