"use client"

import type React from "react"

import { useState } from "react"
import { Angry, Brain, Frown, Lightbulb, Meh, Smile, ThumbsUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type EmotionType =
  | "confident"
  | "focused"
  | "calm"
  | "excited"
  | "anxious"
  | "frustrated"
  | "disappointed"
  | "distracted"

export interface EmotionState {
  type: EmotionType
  intensity: number
  notes: string
}

interface PsychologicalTrackerProps {
  initialState?: EmotionState
  onChange?: (state: EmotionState) => void
  className?: string
}

export function PsychologicalTracker({
  initialState = {
    type: "focused",
    intensity: 3,
    notes: "",
  },
  onChange,
  className,
}: PsychologicalTrackerProps) {
  const [emotionState, setEmotionState] = useState<EmotionState>(initialState)

  const emotions: { type: EmotionType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: "confident", label: "Confident", icon: <ThumbsUp className="h-6 w-6" />, color: "text-green-500" },
    { type: "focused", label: "Focused", icon: <Zap className="h-6 w-6" />, color: "text-blue-500" },
    { type: "calm", label: "Calm", icon: <Smile className="h-6 w-6" />, color: "text-cyan-500" },
    { type: "excited", label: "Excited", icon: <Lightbulb className="h-6 w-6" />, color: "text-yellow-500" },
    { type: "anxious", label: "Anxious", icon: <Meh className="h-6 w-6" />, color: "text-amber-500" },
    { type: "frustrated", label: "Frustrated", icon: <Frown className="h-6 w-6" />, color: "text-orange-500" },
    { type: "disappointed", label: "Disappointed", icon: <Angry className="h-6 w-6" />, color: "text-red-500" },
    { type: "distracted", label: "Distracted", icon: <Brain className="h-6 w-6" />, color: "text-purple-500" },
  ]

  const handleEmotionChange = (type: EmotionType) => {
    const newState = { ...emotionState, type }
    setEmotionState(newState)
    onChange?.(newState)
  }

  const handleIntensityChange = (value: number[]) => {
    const newState = { ...emotionState, intensity: value[0] }
    setEmotionState(newState)
    onChange?.(newState)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newState = { ...emotionState, notes: e.target.value }
    setEmotionState(newState)
    onChange?.(newState)
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 1) return "Very Low"
    if (intensity <= 2) return "Low"
    if (intensity <= 3) return "Moderate"
    if (intensity <= 4) return "High"
    return "Very High"
  }

  const selectedEmotion = emotions.find((e) => e.type === emotionState.type) || emotions[0]

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <Label className="mb-2 block text-sm font-medium">Emotional State</Label>
        <div className="grid grid-cols-4 gap-2">
          {emotions.map((emotion) => (
            <Button
              key={emotion.type}
              variant={emotionState.type === emotion.type ? "default" : "outline"}
              className={cn(
                "flex h-auto flex-col items-center gap-1 p-3 transition-all",
                emotionState.type === emotion.type && "border-primary",
              )}
              onClick={() => handleEmotionChange(emotion.type)}
            >
              <div className={cn("transition-colors", emotion.color)}>{emotion.icon}</div>
              <span className="text-xs">{emotion.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Intensity</Label>
          <span className={cn("text-sm font-medium", selectedEmotion.color)}>
            {getIntensityLabel(emotionState.intensity)}
          </span>
        </div>
        <Slider
          value={[emotionState.intensity]}
          min={1}
          max={5}
          step={1}
          onValueChange={handleIntensityChange}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very Low</span>
          <span>Moderate</span>
          <span>Very High</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emotion-notes" className="text-sm font-medium">
          Notes about your emotional state
        </Label>
        <Textarea
          id="emotion-notes"
          placeholder="Describe your emotional state in more detail..."
          value={emotionState.notes}
          onChange={handleNotesChange}
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="rounded-lg bg-accent/50 p-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-full p-2", selectedEmotion.color)}>{selectedEmotion.icon}</div>
          <div>
            <h4 className="font-medium">
              {selectedEmotion.label} - {getIntensityLabel(emotionState.intensity)}
            </h4>
            <p className="text-sm text-muted-foreground">{emotionState.notes || "No additional notes provided."}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
