"use client"

import { useState } from "react"
import { Check, ChevronDown, Settings } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export type IndicatorType = "ma" | "ema" | "vwap" | "bollinger" | "rsi" | "macd" | "volume"

interface IndicatorSettings {
  period?: number
  source?: "close" | "open" | "high" | "low" | "hl2" | "hlc3" | "ohlc4"
  color?: string
  lineWidth?: number
  deviation?: number
  visible: boolean
}

export interface Indicator {
  type: IndicatorType
  settings: IndicatorSettings
}

interface TechnicalIndicatorsProps {
  onIndicatorChange: (indicators: Indicator[]) => void
  className?: string
}

export function TechnicalIndicators({ onIndicatorChange, className }: TechnicalIndicatorsProps) {
  const [indicators, setIndicators] = useState<Indicator[]>([
    { type: "ma", settings: { period: 20, source: "close", color: "#2962FF", lineWidth: 1.5, visible: false } },
    { type: "ema", settings: { period: 50, source: "close", color: "#FF6D00", lineWidth: 1.5, visible: false } },
    { type: "vwap", settings: { color: "#9C27B0", lineWidth: 1.5, visible: false } },
    { type: "bollinger", settings: { period: 20, deviation: 2, color: "#26A69A", lineWidth: 1.5, visible: false } },
    { type: "rsi", settings: { period: 14, color: "#EF5350", lineWidth: 1.5, visible: false } },
    { type: "macd", settings: { period: 12, source: "close", color: "#42A5F5", lineWidth: 1.5, visible: false } },
    { type: "volume", settings: { color: "#78909C", visible: false } },
  ])

  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const toggleIndicator = (type: IndicatorType) => {
    const updatedIndicators = indicators.map((indicator) => {
      if (indicator.type === type) {
        return { ...indicator, settings: { ...indicator.settings, visible: !indicator.settings.visible } }
      }
      return indicator
    })

    setIndicators(updatedIndicators)
    onIndicatorChange(updatedIndicators.filter((ind) => ind.settings.visible))
  }

  const openSettings = (indicator: Indicator) => {
    setSelectedIndicator(indicator)
    setIsSettingsOpen(true)
  }

  const updateIndicatorSettings = (settings: Partial<IndicatorSettings>) => {
    if (!selectedIndicator) return

    const updatedIndicators = indicators.map((indicator) => {
      if (indicator.type === selectedIndicator.type) {
        return { ...indicator, settings: { ...indicator.settings, ...settings } }
      }
      return indicator
    })

    setIndicators(updatedIndicators)
    onIndicatorChange(updatedIndicators.filter((ind) => ind.settings.visible))
  }

  const getIndicatorName = (type: IndicatorType): string => {
    switch (type) {
      case "ma":
        return "Moving Average"
      case "ema":
        return "Exponential MA"
      case "vwap":
        return "VWAP"
      case "bollinger":
        return "Bollinger Bands"
      case "rsi":
        return "RSI"
      case "macd":
        return "MACD"
      case "volume":
        return "Volume"
      default:
        return type
    }
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Indicators
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 backdrop-blur-xl bg-black/50 border-slate-800">
          <DropdownMenuLabel>Technical Indicators</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {indicators.map((indicator) => (
              <DropdownMenuItem
                key={indicator.type}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleIndicator(indicator.type)}
              >
                <span>{getIndicatorName(indicator.type)}</span>
                <div className="flex items-center gap-2">
                  {indicator.settings.visible && <Check className="h-4 w-4" />}
                  <Settings
                    className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      openSettings(indicator)
                    }}
                  />
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-black/70 border-slate-800">
          <DialogHeader>
            <DialogTitle>Indicator Settings</DialogTitle>
            <DialogDescription>
              Customize the {selectedIndicator ? getIndicatorName(selectedIndicator.type) : ""} indicator parameters.
            </DialogDescription>
          </DialogHeader>

          {selectedIndicator && (
            <div className="grid gap-4 py-4">
              {(selectedIndicator.type === "ma" ||
                selectedIndicator.type === "ema" ||
                selectedIndicator.type === "bollinger" ||
                selectedIndicator.type === "rsi") && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">
                    Period
                  </Label>
                  <Input
                    id="period"
                    type="number"
                    value={selectedIndicator.settings.period}
                    className="col-span-3"
                    onChange={(e) => updateIndicatorSettings({ period: Number.parseInt(e.target.value) })}
                  />
                </div>
              )}

              {selectedIndicator.type === "bollinger" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deviation" className="text-right">
                    Deviation
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <Slider
                      id="deviation"
                      min={0.5}
                      max={4}
                      step={0.1}
                      value={[selectedIndicator.settings.deviation || 2]}
                      onValueChange={(value) => updateIndicatorSettings({ deviation: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{selectedIndicator.settings.deviation}</span>
                  </div>
                </div>
              )}

              {(selectedIndicator.type === "ma" ||
                selectedIndicator.type === "ema" ||
                selectedIndicator.type === "macd") && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">
                    Source
                  </Label>
                  <select
                    id="source"
                    value={selectedIndicator.settings.source}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => updateIndicatorSettings({ source: e.target.value as any })}
                  >
                    <option value="close">Close</option>
                    <option value="open">Open</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                    <option value="hl2">HL/2</option>
                    <option value="hlc3">HLC/3</option>
                    <option value="ohlc4">OHLC/4</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={selectedIndicator.settings.color}
                    className="w-10 h-10 p-1 cursor-pointer"
                    onChange={(e) => updateIndicatorSettings({ color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={selectedIndicator.settings.color}
                    className="flex-1"
                    onChange={(e) => updateIndicatorSettings({ color: e.target.value })}
                  />
                </div>
              </div>

              {selectedIndicator.type !== "volume" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lineWidth" className="text-right">
                    Line Width
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <Slider
                      id="lineWidth"
                      min={0.5}
                      max={4}
                      step={0.5}
                      value={[selectedIndicator.settings.lineWidth || 1.5]}
                      onValueChange={(value) => updateIndicatorSettings({ lineWidth: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{selectedIndicator.settings.lineWidth}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
