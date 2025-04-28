"use client"

import { useState } from "react"
import { Check } from "lucide-react"

interface MoodOption {
  value: string
  label: string
  description: string
  color: string
}

interface MoodSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState(value)

  const moods: MoodOption[] = [
    {
      value: "confident",
      label: "Confident",
      description: "Feeling sure about my trading decisions",
      color: "bg-green-500/20 text-green-500 border-green-500/50",
    },
    {
      value: "excited",
      label: "Excited",
      description: "Enthusiastic about market opportunities",
      color: "bg-amber-500/20 text-amber-500 border-amber-500/50",
    },
    {
      value: "calm",
      label: "Calm",
      description: "Relaxed and focused on my trading plan",
      color: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    },
    {
      value: "neutral",
      label: "Neutral",
      description: "Neither positive nor negative",
      color: "bg-gray-500/20 text-gray-500 border-gray-500/50",
    },
    {
      value: "anxious",
      label: "Anxious",
      description: "Worried about potential losses",
      color: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    },
    {
      value: "frustrated",
      label: "Frustrated",
      description: "Upset about missed opportunities or losses",
      color: "bg-red-500/20 text-red-500 border-red-500/50",
    },
  ]

  const handleMoodChange = (mood: string) => {
    setSelectedMood(mood)
    onChange(mood)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {moods.map((mood) => (
        <div
          key={mood.value}
          className={`relative rounded-lg border p-3 cursor-pointer transition-all ${
            selectedMood === mood.value
              ? `${mood.color} ring-2 ring-offset-2 ring-offset-background ring-${mood.color.split(" ")[0].replace("bg-", "")}`
              : "border-muted-foreground/20 hover:border-muted-foreground/40"
          }`}
          onClick={() => handleMoodChange(mood.value)}
        >
          <div className="flex flex-col gap-1">
            <div className="font-medium">{mood.label}</div>
            <div className="text-xs text-muted-foreground">{mood.description}</div>
          </div>
          {selectedMood === mood.value && (
            <div className="absolute top-2 right-2">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
