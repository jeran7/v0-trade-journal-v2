"use client"

import { useState, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TradeReplayProps {
  data: any[]
  onPositionChange: (position: number) => void
  onSpeedChange: (speed: number) => void
  className?: string
  tradeEvents?: {
    position: number
    label: string
    type: "entry" | "exit" | "stop" | "target" | "note"
  }[]
}

export function TradeReplay({ data, onPositionChange, onSpeedChange, className, tradeEvents = [] }: TradeReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [currentEvent, setCurrentEvent] = useState<string | null>(null)

  // Handle playback
  useEffect(() => {
    if (!isPlaying || !data.length) return

    const interval = setInterval(() => {
      setPosition((prev) => {
        const next = prev + 1
        if (next >= data.length) {
          setIsPlaying(false)
          return prev
        }
        return next
      })
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, data.length, speed])

  // Update parent component when position changes
  useEffect(() => {
    onPositionChange(position)

    // Check if there's an event at the current position
    const event = tradeEvents.find((e) => e.position === position)
    if (event) {
      setCurrentEvent(event.label)

      // Auto-pause at important events
      if (event.type === "entry" || event.type === "exit") {
        setIsPlaying(false)
      }
    } else {
      setCurrentEvent(null)
    }
  }, [position, onPositionChange, tradeEvents])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePositionChange = (value: number[]) => {
    setPosition(value[0])
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    onSpeedChange(newSpeed)
  }

  const handleSkipBack = () => {
    const prevEvent = [...tradeEvents].sort((a, b) => b.position - a.position).find((e) => e.position < position)

    if (prevEvent) {
      setPosition(prevEvent.position)
    } else {
      setPosition(0)
    }
  }

  const handleSkipForward = () => {
    const nextEvent = tradeEvents.find((e) => e.position > position)

    if (nextEvent) {
      setPosition(nextEvent.position)
    } else {
      setPosition(data.length - 1)
    }
  }

  return (
    <GlassCard className={className}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Trade Replay</h3>
          {currentEvent && (
            <div className="px-2 py-1 text-xs font-medium bg-primary/20 rounded-md animate-pulse">{currentEvent}</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleSkipBack} disabled={position === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button variant={isPlaying ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={togglePlayback}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleSkipForward}
            disabled={position === data.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex-1 mx-2">
            <Slider value={[position]} min={0} max={data.length - 1} step={1} onValueChange={handlePositionChange} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {speed}x
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32 backdrop-blur-xl bg-black/50 border-slate-800">
              <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {[0.25, 0.5, 1, 2, 4, 8].map((speedOption) => (
                  <DropdownMenuItem
                    key={speedOption}
                    className={`cursor-pointer ${speed === speedOption ? "bg-primary/20" : ""}`}
                    onClick={() => handleSpeedChange(speedOption)}
                  >
                    {speedOption}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-xs text-muted-foreground">
          {data[position]?.time || ""} • {position + 1} of {data.length}
        </div>
      </div>
    </GlassCard>
  )
}
