"use client"

import { useEffect, useState } from "react"
import { Check, Clock, DollarSign, Flag, Lightbulb, Target, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  id: string
  time: string
  title: string
  description: string
  type: "entry" | "exit" | "stop" | "target" | "idea" | "adjustment" | "success" | "failure"
}

interface TradeTimelineProps {
  events: TimelineEvent[]
  className?: string
}

export function TradeTimeline({ events, className }: TradeTimelineProps) {
  const [visibleEvents, setVisibleEvents] = useState<string[]>([])

  useEffect(() => {
    // Animate events in sequence
    const timeouts: NodeJS.Timeout[] = []

    events.forEach((event, index) => {
      const timeout = setTimeout(
        () => {
          setVisibleEvents((prev) => [...prev, event.id])
        },
        300 * (index + 1),
      )

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [events])

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "entry":
        return <Flag className="h-5 w-5" />
      case "exit":
        return <DollarSign className="h-5 w-5" />
      case "stop":
        return <X className="h-5 w-5" />
      case "target":
        return <Target className="h-5 w-5" />
      case "idea":
        return <Lightbulb className="h-5 w-5" />
      case "adjustment":
        return <Clock className="h-5 w-5" />
      case "success":
        return <Check className="h-5 w-5" />
      case "failure":
        return <X className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "entry":
        return "bg-blue-500"
      case "exit":
        return "bg-purple-500"
      case "stop":
        return "bg-loss"
      case "target":
        return "bg-profit"
      case "idea":
        return "bg-amber-500"
      case "adjustment":
        return "bg-orange-500"
      case "success":
        return "bg-profit"
      case "failure":
        return "bg-loss"
      default:
        return "bg-neutral"
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Trade Timeline</h3>
      <div className="relative space-y-8 before:absolute before:inset-0 before:left-4 before:ml-0.5 before:h-full before:w-0.5 before:bg-muted">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "flex gap-4 transition-all duration-500",
              visibleEvents.includes(event.id) ? "opacity-100" : "opacity-0 translate-x-8",
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                getEventColor(event.type),
              )}
            >
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{event.title}</h4>
                <time className="text-xs text-muted-foreground">{event.time}</time>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
