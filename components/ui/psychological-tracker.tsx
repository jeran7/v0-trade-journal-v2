"use client"

import { useState } from "react"
import { Angry, Frown, Meh, Smile, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EmotionData {
  emotion: "confident" | "calm" | "anxious" | "fearful" | "excited"
  level: number
  notes?: string
}

interface PsychologicalTrackerProps {
  preTrade: EmotionData
  duringTrade: EmotionData
  postTrade: EmotionData
  className?: string
}

export function PsychologicalTracker({ preTrade, duringTrade, postTrade, className }: PsychologicalTrackerProps) {
  const [activeTab, setActiveTab] = useState("pre")

  const getEmotionIcon = (emotion: EmotionData["emotion"], size = 5) => {
    switch (emotion) {
      case "confident":
        return <ThumbsUp className={`h-${size} w-${size}`} />
      case "calm":
        return <Smile className={`h-${size} w-${size}`} />
      case "anxious":
        return <Meh className={`h-${size} w-${size}`} />
      case "fearful":
        return <Frown className={`h-${size} w-${size}`} />
      case "excited":
        return <Angry className={`h-${size} w-${size}`} />
    }
  }

  const getEmotionColor = (emotion: EmotionData["emotion"]) => {
    switch (emotion) {
      case "confident":
        return "text-green-500"
      case "calm":
        return "text-blue-500"
      case "anxious":
        return "text-amber-500"
      case "fearful":
        return "text-orange-500"
      case "excited":
        return "text-purple-500"
    }
  }

  const getEmotionLabel = (emotion: EmotionData["emotion"]) => {
    return emotion.charAt(0).toUpperCase() + emotion.slice(1)
  }

  const getLevelLabel = (level: number) => {
    if (level <= 2) return "Low"
    if (level <= 3) return "Moderate"
    return "High"
  }

  const renderEmotionData = (data: EmotionData) => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-muted",
            getEmotionColor(data.emotion),
          )}
        >
          {getEmotionIcon(data.emotion)}
        </div>
        <div>
          <h4 className="text-lg font-semibold">{getEmotionLabel(data.emotion)}</h4>
          <p className="text-sm text-muted-foreground">Intensity: {getLevelLabel(data.level)}</p>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", getEmotionColor(data.emotion))}
          style={{ width: `${(data.level / 5) * 100}%` }}
        />
      </div>

      {data.notes && (
        <div className="rounded-lg bg-muted p-3">
          <p className="text-sm">{data.notes}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Psychological State</h3>

      <Tabs defaultValue="pre" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pre">Pre-Trade</TabsTrigger>
          <TabsTrigger value="during">During Trade</TabsTrigger>
          <TabsTrigger value="post">Post-Trade</TabsTrigger>
        </TabsList>
        <TabsContent value="pre" className="mt-4 animate-in">
          {renderEmotionData(preTrade)}
        </TabsContent>
        <TabsContent value="during" className="mt-4 animate-in">
          {renderEmotionData(duringTrade)}
        </TabsContent>
        <TabsContent value="post" className="mt-4 animate-in">
          {renderEmotionData(postTrade)}
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-3 gap-2">
        <div
          className={cn(
            "flex flex-col items-center rounded-lg p-3 transition-colors",
            activeTab === "pre" ? "bg-accent" : "bg-muted/50",
          )}
        >
          <div className={cn("mb-2", getEmotionColor(preTrade.emotion))}>{getEmotionIcon(preTrade.emotion, 4)}</div>
          <span className="text-xs font-medium">Pre-Trade</span>
        </div>
        <div
          className={cn(
            "flex flex-col items-center rounded-lg p-3 transition-colors",
            activeTab === "during" ? "bg-accent" : "bg-muted/50",
          )}
        >
          <div className={cn("mb-2", getEmotionColor(duringTrade.emotion))}>
            {getEmotionIcon(duringTrade.emotion, 4)}
          </div>
          <span className="text-xs font-medium">During Trade</span>
        </div>
        <div
          className={cn(
            "flex flex-col items-center rounded-lg p-3 transition-colors",
            activeTab === "post" ? "bg-accent" : "bg-muted/50",
          )}
        >
          <div className={cn("mb-2", getEmotionColor(postTrade.emotion))}>{getEmotionIcon(postTrade.emotion, 4)}</div>
          <span className="text-xs font-medium">Post-Trade</span>
        </div>
      </div>
    </div>
  )
}
