"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// Types for the component
interface Condition {
  id: string
  indicator: string
  timeframe: string
  operator: string
  value: string
  active: boolean
}

interface EntryExitEditorProps {
  initialEntryConditions?: Condition[]
  initialExitConditions?: Condition[]
  onSave?: (entryConditions: Condition[], exitConditions: Condition[]) => void
  className?: string
}

// Available indicators for selection
const indicators = [
  { value: "price", label: "Price" },
  { value: "ma20", label: "Moving Average (20)" },
  { value: "ma50", label: "Moving Average (50)" },
  { value: "ma200", label: "Moving Average (200)" },
  { value: "rsi", label: "RSI" },
  { value: "macd", label: "MACD" },
  { value: "volume", label: "Volume" },
  { value: "bollinger", label: "Bollinger Bands" },
  { value: "atr", label: "ATR" },
  { value: "vwap", label: "VWAP" },
]

// Available timeframes
const timeframes = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "1d", label: "Daily" },
  { value: "1w", label: "Weekly" },
]

// Available operators
const operators = [
  { value: "crosses_above", label: "Crosses Above" },
  { value: "crosses_below", label: "Crosses Below" },
  { value: "is_above", label: "Is Above" },
  { value: "is_below", label: "Is Below" },
  { value: "equals", label: "Equals" },
  { value: "increases_by", label: "Increases By" },
  { value: "decreases_by", label: "Decreases By" },
]

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9)

// Create a new condition with default values
const createNewCondition = (): Condition => ({
  id: generateId(),
  indicator: "price",
  timeframe: "1d",
  operator: "crosses_above",
  value: "",
  active: true,
})

export function EntryExitEditor({
  initialEntryConditions = [],
  initialExitConditions = [],
  onSave,
  className,
}: EntryExitEditorProps) {
  // State for entry and exit conditions
  const [entryConditions, setEntryConditions] = useState<Condition[]>(
    initialEntryConditions.length ? initialEntryConditions : [createNewCondition()],
  )
  const [exitConditions, setExitConditions] = useState<Condition[]>(
    initialExitConditions.length ? initialExitConditions : [createNewCondition()],
  )

  // State for preview visibility
  const [showPreview, setShowPreview] = useState(false)

  // Add a new condition
  const addCondition = (type: "entry" | "exit") => {
    const newCondition = createNewCondition()
    if (type === "entry") {
      setEntryConditions([...entryConditions, newCondition])
    } else {
      setExitConditions([...exitConditions, newCondition])
    }
  }

  // Remove a condition
  const removeCondition = (type: "entry" | "exit", id: string) => {
    if (type === "entry") {
      setEntryConditions(entryConditions.filter((condition) => condition.id !== id))
    } else {
      setExitConditions(exitConditions.filter((condition) => condition.id !== id))
    }
  }

  // Update a condition
  const updateCondition = (type: "entry" | "exit", id: string, field: keyof Condition, value: any) => {
    if (type === "entry") {
      setEntryConditions(
        entryConditions.map((condition) => (condition.id === id ? { ...condition, [field]: value } : condition)),
      )
    } else {
      setExitConditions(
        exitConditions.map((condition) => (condition.id === id ? { ...condition, [field]: value } : condition)),
      )
    }
  }

  // Move a condition up or down in the list
  const moveCondition = (type: "entry" | "exit", id: string, direction: "up" | "down") => {
    const conditions = type === "entry" ? entryConditions : exitConditions
    const index = conditions.findIndex((condition) => condition.id === id)

    if (direction === "up" && index > 0) {
      const newConditions = [...conditions]
      ;[newConditions[index], newConditions[index - 1]] = [newConditions[index - 1], newConditions[index]]

      if (type === "entry") {
        setEntryConditions(newConditions)
      } else {
        setExitConditions(newConditions)
      }
    } else if (direction === "down" && index < conditions.length - 1) {
      const newConditions = [...conditions]
      ;[newConditions[index], newConditions[index + 1]] = [newConditions[index + 1], newConditions[index]]

      if (type === "entry") {
        setEntryConditions(newConditions)
      } else {
        setExitConditions(newConditions)
      }
    }
  }

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(entryConditions, exitConditions)
    }
  }

  // Render a condition
  const renderCondition = (condition: Condition, type: "entry" | "exit", index: number, total: number) => {
    return (
      <div
        key={condition.id}
        className={cn(
          "p-4 mb-3 rounded-lg transition-all duration-300 border",
          condition.active
            ? type === "entry"
              ? "border-green-600/30 bg-green-950/20"
              : "border-red-600/30 bg-red-950/20"
            : "border-gray-700/50 bg-gray-900/20 opacity-60",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Switch
              checked={condition.active}
              onCheckedChange={(checked) => updateCondition(type, condition.id, "active", checked)}
              className={cn(
                condition.active && type === "entry" && "bg-green-600",
                condition.active && type === "exit" && "bg-red-600",
              )}
            />
            <Label className="ml-2 text-sm font-medium">{condition.active ? "Active" : "Inactive"}</Label>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveCondition(type, condition.id, "up")}
              disabled={index === 0}
              className="h-8 w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveCondition(type, condition.id, "down")}
              disabled={index === total - 1}
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCondition(type, condition.id)}
              className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4">
            <Label className="text-xs mb-1 block text-muted-foreground">Indicator</Label>
            <Select
              value={condition.indicator}
              onValueChange={(value) => updateCondition(type, condition.id, "indicator", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {indicators.map((indicator) => (
                  <SelectItem key={indicator.value} value={indicator.value}>
                    {indicator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label className="text-xs mb-1 block text-muted-foreground">Timeframe</Label>
            <Select
              value={condition.timeframe}
              onValueChange={(value) => updateCondition(type, condition.id, "timeframe", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((timeframe) => (
                  <SelectItem key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3">
            <Label className="text-xs mb-1 block text-muted-foreground">Operator</Label>
            <Select
              value={condition.operator}
              onValueChange={(value) => updateCondition(type, condition.id, "operator", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((operator) => (
                  <SelectItem key={operator.value} value={operator.value}>
                    {operator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3">
            <Label className="text-xs mb-1 block text-muted-foreground">Value</Label>
            <Input
              value={condition.value}
              onChange={(e) => updateCondition(type, condition.id, "value", e.target.value)}
              placeholder="Value"
            />
          </div>
        </div>
      </div>
    )
  }

  // Render the preview
  const renderPreview = () => {
    return (
      <div className="p-5 rounded-lg border border-gray-700 bg-gray-900/50 mt-4">
        <h3 className="text-lg font-semibold mb-4">Strategy Preview</h3>

        {entryConditions.some((c) => c.active) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-400 mb-2">Entry Conditions:</h4>
            <ul className="space-y-2 pl-5">
              {entryConditions
                .filter((c) => c.active)
                .map((condition, index) => {
                  const indicatorLabel =
                    indicators.find((i) => i.value === condition.indicator)?.label || condition.indicator
                  const operatorLabel =
                    operators.find((o) => o.value === condition.operator)?.label || condition.operator
                  const timeframeLabel =
                    timeframes.find((t) => t.value === condition.timeframe)?.label || condition.timeframe

                  return (
                    <li key={condition.id} className="flex items-center text-sm">
                      <ArrowRight className="h-3 w-3 text-green-500 mr-2" />
                      <span>
                        {indicatorLabel} ({timeframeLabel}) {operatorLabel.toLowerCase()} {condition.value}
                      </span>
                    </li>
                  )
                })}
            </ul>
          </div>
        )}

        {exitConditions.some((c) => c.active) && (
          <div>
            <h4 className="text-sm font-medium text-red-400 mb-2">Exit Conditions:</h4>
            <ul className="space-y-2 pl-5">
              {exitConditions
                .filter((c) => c.active)
                .map((condition, index) => {
                  const indicatorLabel =
                    indicators.find((i) => i.value === condition.indicator)?.label || condition.indicator
                  const operatorLabel =
                    operators.find((o) => o.value === condition.operator)?.label || condition.operator
                  const timeframeLabel =
                    timeframes.find((t) => t.value === condition.timeframe)?.label || condition.timeframe

                  return (
                    <li key={condition.id} className="flex items-center text-sm">
                      <ArrowLeft className="h-3 w-3 text-red-500 mr-2" />
                      <span>
                        {indicatorLabel} ({timeframeLabel}) {operatorLabel.toLowerCase()} {condition.value}
                      </span>
                    </li>
                  )
                })}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Entry & Exit Conditions</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show Preview
              </>
            )}
          </Button>
          <Button onClick={handleSave}>Save Conditions</Button>
        </div>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="entry" className="data-[state=active]:bg-green-900/30 data-[state=active]:text-green-300">
            Entry Conditions
          </TabsTrigger>
          <TabsTrigger value="exit" className="data-[state=active]:bg-red-900/30 data-[state=active]:text-red-300">
            Exit Conditions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            {entryConditions.map((condition, index) =>
              renderCondition(condition, "entry", index, entryConditions.length),
            )}

            <Button
              variant="outline"
              onClick={() => addCondition("entry")}
              className="w-full mt-2 border-dashed border-green-600/40 text-green-400 hover:bg-green-950/30"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Entry Condition
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="exit" className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            {exitConditions.map((condition, index) => renderCondition(condition, "exit", index, exitConditions.length))}

            <Button
              variant="outline"
              onClick={() => addCondition("exit")}
              className="w-full mt-2 border-dashed border-red-600/40 text-red-400 hover:bg-red-950/30"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Exit Condition
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {showPreview && renderPreview()}
    </div>
  )
}
