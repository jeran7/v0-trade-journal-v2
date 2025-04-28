"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { TradeFormData } from "./trade-form"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface TradePriceInfoProps {
  formData: TradeFormData
  updateFormData: (data: Partial<TradeFormData>) => void
  profitLoss: number | null
  profitLossPercent: number | null
}

export function TradePriceInfo({ formData, updateFormData, profitLoss, profitLossPercent }: TradePriceInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="entry_price">Entry Price</Label>
        <Input
          id="entry_price"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="150.00"
          value={formData.entry_price || ""}
          onChange={(e) => updateFormData({ entry_price: Number.parseFloat(e.target.value) || 0 })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exit_price">Exit Price (optional for open trades)</Label>
        <Input
          id="exit_price"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="155.00"
          value={formData.exit_price || ""}
          onChange={(e) => {
            const value = e.target.value ? Number.parseFloat(e.target.value) : undefined
            updateFormData({ exit_price: value })
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entry_date">Entry Date</Label>
        <Input
          id="entry_date"
          type="datetime-local"
          value={formData.entry_date ? new Date(formData.entry_date).toISOString().slice(0, 16) : ""}
          onChange={(e) => updateFormData({ entry_date: new Date(e.target.value) })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exit_date">Exit Date (optional for open trades)</Label>
        <Input
          id="exit_date"
          type="datetime-local"
          value={formData.exit_date ? new Date(formData.exit_date).toISOString().slice(0, 16) : ""}
          onChange={(e) => {
            const value = e.target.value ? new Date(e.target.value) : undefined
            updateFormData({ exit_date: value })
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fees">Fees (optional)</Label>
        <Input
          id="fees"
          type="number"
          min="0"
          step="0.01"
          placeholder="1.99"
          value={formData.fees || ""}
          onChange={(e) => {
            const value = e.target.value ? Number.parseFloat(e.target.value) : undefined
            updateFormData({ fees: value })
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Trade Status</Label>
        <RadioGroup
          value={formData.status}
          onValueChange={(value: "open" | "closed" | "cancelled") => updateFormData({ status: value })}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="open" id="open" />
            <Label htmlFor="open" className="cursor-pointer">
              Open
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="closed" id="closed" />
            <Label htmlFor="closed" className="cursor-pointer">
              Closed
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cancelled" id="cancelled" />
            <Label htmlFor="cancelled" className="cursor-pointer">
              Cancelled
            </Label>
          </div>
        </RadioGroup>
      </div>

      {profitLoss !== null && profitLossPercent !== null && (
        <div className="mt-6 p-4 border rounded-md bg-muted">
          <h3 className="font-medium mb-2">Calculated P&L</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Profit/Loss</p>
              <p className={`text-lg font-semibold ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(profitLoss)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Percentage</p>
              <p className={`text-lg font-semibold ${profitLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatPercentage(profitLossPercent)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
