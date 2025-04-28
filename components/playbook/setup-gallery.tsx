"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Maximize2, ThumbsDown, ThumbsUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Setup {
  id: string
  title: string
  description: string
  imageUrl: string
  result: "win" | "loss"
  gain: string
}

interface SetupGalleryProps {
  setups: Setup[]
}

export function SetupGallery({ setups }: SetupGalleryProps) {
  const [selectedSetup, setSelectedSetup] = useState<Setup | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevSetup = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNextSetup = () => {
    if (currentIndex < setups.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Setup Examples</h3>
        </div>
        <div className="text-sm text-muted-foreground">{setups.length} examples</div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {setups.map((setup) => (
          <Dialog key={setup.id}>
            <DialogTrigger asChild>
              <GlassCard
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:bg-accent/10"
                onClick={() => setSelectedSetup(setup)}
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={setup.imageUrl || "/placeholder.svg"}
                    alt={setup.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{setup.title}</h4>
                    <Badge variant={setup.result === "win" ? "default" : "destructive"} className="text-xs">
                      {setup.result === "win" ? (
                        <ThumbsUp className="mr-1 h-3 w-3" />
                      ) : (
                        <ThumbsDown className="mr-1 h-3 w-3" />
                      )}
                      {setup.gain}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{setup.description}</p>
                </div>
              </GlassCard>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{setup.title}</DialogTitle>
                <DialogDescription>{setup.description}</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <img
                  src={setup.imageUrl || "/placeholder.svg"}
                  alt={setup.title}
                  className="w-full rounded-lg object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={setup.result === "win" ? "default" : "destructive"} className="text-xs">
                  {setup.result === "win" ? (
                    <ThumbsUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ThumbsDown className="mr-1 h-3 w-3" />
                  )}
                  {setup.gain}
                </Badge>
                <Button variant="outline" size="sm">
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Full Screen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Setup Viewer</h4>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevSetup} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentIndex + 1} of {setups.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextSetup}
              disabled={currentIndex === setups.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={setups[currentIndex].imageUrl || "/placeholder.svg"}
            alt={setups[currentIndex].title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h4 className="font-medium">{setups[currentIndex].title}</h4>
            <p className="text-sm text-muted-foreground">{setups[currentIndex].description}</p>
          </div>
          <Badge variant={setups[currentIndex].result === "win" ? "default" : "destructive"} className="text-sm">
            {setups[currentIndex].result === "win" ? (
              <ThumbsUp className="mr-1 h-3 w-3" />
            ) : (
              <ThumbsDown className="mr-1 h-3 w-3" />
            )}
            {setups[currentIndex].gain}
          </Badge>
        </div>
      </GlassCard>
    </div>
  )
}
