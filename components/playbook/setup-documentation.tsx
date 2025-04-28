"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ImageIcon, Plus, Trash, Edit, X, Check, Info } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface SetupImage {
  id: string
  url: string
  caption: string
  isEditing?: boolean
}

export function SetupDocumentation() {
  const [activeTab, setActiveTab] = useState("entry")
  const [setupImages, setSetupImages] = useState<SetupImage[]>([
    {
      id: "1",
      url: "/stock-breakout.png",
      caption: "Example of a valid breakout setup with volume confirmation",
      isEditing: false,
    },
  ])
  const [newCaption, setNewCaption] = useState("")

  const handleAddImage = () => {
    const newImage: SetupImage = {
      id: Date.now().toString(),
      url: "/placeholder.svg?height=400&width=600&query=stock chart pattern",
      caption: "New setup example",
      isEditing: true,
    }
    setSetupImages([...setupImages, newImage])
    setNewCaption("New setup example")
  }

  const handleRemoveImage = (id: string) => {
    setSetupImages(setupImages.filter((img) => img.id !== id))
  }

  const handleEditCaption = (id: string) => {
    setSetupImages(
      setupImages.map((img) => {
        if (img.id === id) {
          setNewCaption(img.caption)
          return { ...img, isEditing: true }
        }
        return img
      }),
    )
  }

  const handleSaveCaption = (id: string) => {
    setSetupImages(
      setupImages.map((img) => {
        if (img.id === id) {
          return { ...img, caption: newCaption, isEditing: false }
        }
        return img
      }),
    )
  }

  const handleCancelEdit = (id: string) => {
    setSetupImages(
      setupImages.map((img) => {
        if (img.id === id) {
          return { ...img, isEditing: false }
        }
        return img
      }),
    )
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-medium mb-4">Setup Documentation</h3>

        <Tabs defaultValue="entry" className="w-full">
          <TabsList>
            <TabsTrigger value="entry" onClick={() => setActiveTab("entry")}>
              Entry Criteria
            </TabsTrigger>
            <TabsTrigger value="exit" onClick={() => setActiveTab("exit")}>
              Exit Criteria
            </TabsTrigger>
            <TabsTrigger value="confirmation" onClick={() => setActiveTab("confirmation")}>
              Confirmation Signals
            </TabsTrigger>
            <TabsTrigger value="invalidation" onClick={() => setActiveTab("invalidation")}>
              Invalidation Points
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="entry-criteria">Entry Criteria</Label>
                <Textarea
                  id="entry-criteria"
                  placeholder="Describe the specific conditions that must be met for a valid entry..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="entry-timing">Entry Timing</Label>
                <Textarea id="entry-timing" placeholder="Describe the precise timing for entry execution..." rows={2} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Key Indicators</Label>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Indicator
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Moving Average</Badge>
                    <Button variant="ghost" size="sm">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Input value="EMA" className="h-8" />
                      </div>
                      <div>
                        <Label className="text-xs">Period</Label>
                        <Input value="20" type="number" className="h-8" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Condition</Label>
                      <Input value="Price crosses above" className="h-8" />
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Volume</Badge>
                    <Button variant="ghost" size="sm">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Input value="Relative Volume" className="h-8" />
                      </div>
                      <div>
                        <Label className="text-xs">Threshold</Label>
                        <Input value="1.5" type="number" step="0.1" className="h-8" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Condition</Label>
                      <Input value="Greater than average" className="h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exit" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="profit-target">Profit Target Criteria</Label>
                <Textarea id="profit-target" placeholder="Describe how profit targets are determined..." rows={3} />
              </div>

              <div>
                <Label htmlFor="stop-loss">Stop Loss Criteria</Label>
                <Textarea id="stop-loss" placeholder="Describe how stop losses are determined..." rows={3} />
              </div>

              <div>
                <Label htmlFor="trailing-stop">Trailing Stop Methodology (if applicable)</Label>
                <Textarea id="trailing-stop" placeholder="Describe any trailing stop methodology..." rows={2} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="confirmation" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmation-signals">Confirmation Signals</Label>
                <Textarea
                  id="confirmation-signals"
                  placeholder="Describe the signals that confirm a valid setup..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2 p-3 border border-white/10 rounded-lg bg-white/5">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-white/70">
                  Confirmation signals increase the probability of a successful trade. They should be observed after the
                  initial setup conditions are met but before entering the trade.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invalidation" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="invalidation-points">Invalidation Points</Label>
                <Textarea
                  id="invalidation-points"
                  placeholder="Describe the conditions that would invalidate this setup..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2 p-3 border border-white/10 rounded-lg bg-white/5">
                <Info className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-white/70">
                  Invalidation points help you avoid bad trades by clearly defining when a setup is no longer valid.
                  This prevents forcing trades that don't meet your criteria.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Setup Examples</h3>
          <Button variant="outline" onClick={handleAddImage}>
            <Plus className="h-4 w-4 mr-2" />
            Add Example
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {setupImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-lg border border-white/10">
                <ImageIcon
                  src={image.url || "/placeholder.svg"}
                  alt={image.caption}
                  className="w-full h-48 object-cover"
                />

                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEditCaption(image.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                {image.isEditing ? (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/70 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <Input value={newCaption} onChange={(e) => setNewCaption(e.target.value)} className="text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSaveCaption(image.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCancelEdit(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50 backdrop-blur-sm">
                    <p className="text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
