"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, DollarSign, Hash, Info, Plus, Tag, X } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface QuickAddTradeFormProps {
  onClose: () => void
}

export function QuickAddTradeForm({ onClose }: QuickAddTradeFormProps) {
  const [formData, setFormData] = useState({
    symbol: "",
    type: "Long",
    entry: "",
    exit: "",
    size: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    setup: "",
    notes: "",
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState("")

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Process form submission
    console.log("Submitting trade:", formData)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl p-4"
    >
      <GlassCard className="relative overflow-hidden">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Add New Trade</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="symbol"
                      placeholder="AAPL"
                      className="pl-8"
                      value={formData.symbol}
                      onChange={(e) => handleChange("symbol", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Direction</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry">Entry Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="entry"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      value={formData.entry}
                      onChange={(e) => handleChange("entry", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exit">
                    Exit Price
                    <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="exit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      value={formData.exit}
                      onChange={(e) => handleChange("exit", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Position Size</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="Number of shares/contracts"
                    value={formData.size}
                    onChange={(e) => handleChange("size", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-8"
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        className="pl-8"
                        value={formData.time}
                        onChange={(e) => handleChange("time", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup">Setup/Strategy</Label>
                  <Select value={formData.setup} onValueChange={(value) => handleChange("setup", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select setup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakout">Breakout</SelectItem>
                      <SelectItem value="Pullback">Pullback</SelectItem>
                      <SelectItem value="Reversal">Reversal</SelectItem>
                      <SelectItem value="Gap Fill">Gap Fill</SelectItem>
                      <SelectItem value="Support Bounce">Support Bounce</SelectItem>
                      <SelectItem value="Resistance Rejection">Resistance Rejection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tags">Tags</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 gap-1">
                          <Info className="h-3 w-3" />
                          <span className="text-xs">Common Tags</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="end">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Frequently Used Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {commonTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => {
                                  if (!formData.tags.includes(tag)) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      tags: [...prev.tags, tag],
                                    }))
                                  }
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tags"
                        placeholder="Add tag..."
                        className="pl-8"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className={cn("flex flex-wrap gap-1 mt-2", formData.tags.length === 0 && "hidden")}>
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 rounded-full p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-2 w-2" />
                          <span className="sr-only">Remove {tag}</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this trade..."
                className="min-h-[100px]"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Trade</Button>
            </div>
          </form>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Common tags for quick selection
const commonTags = [
  "Gap Up",
  "Gap Down",
  "High Volume",
  "Low Volume",
  "Earnings",
  "Trend Continuation",
  "Reversal",
  "Breakout",
  "Failed Breakout",
  "Support",
  "Resistance",
]
