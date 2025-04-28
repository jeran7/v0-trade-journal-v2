"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { TradeFormData } from "./trade-form"
import { Button } from "@/components/ui/button"
import { X, Upload, ImageIcon } from "lucide-react"

interface TradeAdditionalInfoProps {
  formData: TradeFormData
  updateFormData: (data: Partial<TradeFormData>) => void
}

export function TradeAdditionalInfo({ formData, updateFormData }: TradeAdditionalInfoProps) {
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      updateFormData({
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    updateFormData({
      tags: formData.tags?.filter((t) => t !== tag),
    })
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      updateFormData({
        screenshots: [...formData.screenshots, ...newFiles],
      })
    }
  }

  const removeScreenshot = (index: number) => {
    updateFormData({
      screenshots: formData.screenshots.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="setup">Setup</Label>
        <Input
          id="setup"
          placeholder="e.g., Breakout, Reversal, Gap and Go"
          value={formData.setup || ""}
          onChange={(e) => updateFormData({ setup: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <Button type="button" onClick={addTag} variant="secondary">
            Add
          </Button>
        </div>

        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-secondary-foreground/70 hover:text-secondary-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add your trade notes here..."
          rows={5}
          value={formData.notes || ""}
          onChange={(e) => updateFormData({ notes: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="screenshots">Screenshots</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Input
            id="screenshots"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Label htmlFor="screenshots" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">Click to upload or drag and drop</span>
            <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
          </Label>
        </div>

        {formData.screenshots.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {formData.screenshots.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground truncate max-w-[120px]">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeScreenshot(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
