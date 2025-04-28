"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { TradeFormData } from "./trade-form"

interface TradeBasicInfoProps {
  formData: TradeFormData
  updateFormData: (data: Partial<TradeFormData>) => void
}

export function TradeBasicInfo({ formData, updateFormData }: TradeBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="symbol">Symbol</Label>
        <Input
          id="symbol"
          placeholder="AAPL"
          value={formData.symbol}
          onChange={(e) => updateFormData({ symbol: e.target.value.toUpperCase() })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Direction</Label>
        <RadioGroup
          value={formData.direction}
          onValueChange={(value: "long" | "short") => updateFormData({ direction: value })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="long" id="long" />
            <Label htmlFor="long" className="cursor-pointer">
              Long
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="short" id="short" />
            <Label htmlFor="short" className="cursor-pointer">
              Short
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="0.0001"
          step="0.0001"
          placeholder="100"
          value={formData.quantity || ""}
          onChange={(e) => updateFormData({ quantity: Number.parseFloat(e.target.value) || 0 })}
          required
        />
      </div>
    </div>
  )
}
