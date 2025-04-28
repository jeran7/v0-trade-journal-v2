"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, FileImage, Mic, MicOff, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"

export interface MediaItem {
  id: string
  type: "image" | "audio" | "screenshot"
  url: string
  name: string
  timestamp: string
}

interface MediaToolbarProps {
  onAddMedia?: (media: MediaItem) => void
  onRemoveMedia?: (id: string) => void
  mediaItems?: MediaItem[]
  className?: string
}

export function MediaToolbar({ onAddMedia, onRemoveMedia, mediaItems = [], className }: MediaToolbarProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          const newMedia: MediaItem = {
            id: `media-${Date.now()}`,
            type: file.type.startsWith("image/") ? "image" : "audio",
            url: event.target.result,
            name: file.name,
            timestamp: new Date().toLocaleString(),
          }

          onAddMedia?.(newMedia)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleScreenshot = () => {
    // In a real app, this would use a screenshot library
    // For now, we'll simulate it with a placeholder
    const newMedia: MediaItem = {
      id: `screenshot-${Date.now()}`,
      type: "screenshot",
      url: "/placeholder.svg?height=400&width=600",
      name: `Screenshot ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toLocaleString(),
    }

    onAddMedia?.(newMedia)
  }

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recordingInterval) {
        clearInterval(recordingInterval)
        setRecordingInterval(null)
      }

      // In a real app, this would process the audio recording
      // For now, we'll simulate it with a placeholder
      const newMedia: MediaItem = {
        id: `audio-${Date.now()}`,
        type: "audio",
        url: "https://example.com/audio.mp3", // Placeholder URL
        name: `Voice Note ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toLocaleString(),
      }

      onAddMedia?.(newMedia)
      setRecordingTime(0)
    } else {
      // Start recording
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      setRecordingInterval(interval)
    }

    setIsRecording(!isRecording)
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FileImage className="mr-2 h-4 w-4" />
          Upload Media
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,audio/*"
            onChange={handleFileUpload}
          />
        </Button>

        <Button variant="outline" size="sm" onClick={handleScreenshot}>
          <Camera className="mr-2 h-4 w-4" />
          Take Screenshot
        </Button>

        <Button variant={isRecording ? "destructive" : "outline"} size="sm" onClick={toggleRecording}>
          {isRecording ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              Stop Recording ({formatRecordingTime(recordingTime)})
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Record Voice
            </>
          )}
        </Button>
      </div>

      {isRecording && (
        <GlassCard className="bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
            <span className="font-medium text-destructive">Recording in progress...</span>
            <span className="ml-auto font-mono">{formatRecordingTime(recordingTime)}</span>
          </div>
          <div className="mt-2 h-8 w-full">
            {/* This would be a waveform visualization */}
            <div className="flex h-full items-center justify-around">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 w-1 animate-pulse rounded-full bg-destructive"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {mediaItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attached Media ({mediaItems.length})</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {mediaItems.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <GlassCard
                    className="group relative aspect-square cursor-pointer overflow-hidden"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.type === "audio" ? (
                      <div className="flex h-full flex-col items-center justify-center p-2">
                        <Mic className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-2 text-xs text-center">{item.name}</span>
                      </div>
                    ) : (
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveMedia?.(item.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </GlassCard>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    {item.type === "audio" ? (
                      <audio src={item.url} controls className="w-full" />
                    ) : (
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.name}
                        className="mx-auto max-h-[60vh] object-contain"
                      />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Added on {item.timestamp}</div>
                  <div className="mt-4 flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onRemoveMedia?.(item.id)
                        setSelectedMedia(null)
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
            <GlassCard
              className="flex aspect-square cursor-pointer flex-col items-center justify-center border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="mt-2 text-xs text-muted-foreground">Add Media</span>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  )
}
