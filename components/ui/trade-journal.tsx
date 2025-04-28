"use client"

import { useState } from "react"
import { Bold, Italic, Link, List, ListOrdered, Mic, MicOff, Save, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TradeJournalProps {
  initialNotes?: string
  className?: string
}

export function TradeJournal({ initialNotes = "", className }: TradeJournalProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isRecording, setIsRecording] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedNotes, setSavedNotes] = useState(initialNotes)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSavedNotes(notes)
    setIsSaving(false)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const formatText = (formatter: string) => {
    // Simple text formatting for demo purposes
    switch (formatter) {
      case "bold":
        setNotes(notes + "**bold text**")
        break
      case "italic":
        setNotes(notes + "*italic text*")
        break
      case "link":
        setNotes(notes + "[link text](https://example.com)")
        break
      case "list":
        setNotes(notes + "\n- List item\n- List item")
        break
      case "ordered-list":
        setNotes(notes + "\n1. List item\n2. List item")
        break
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trade Journal</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="write">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="space-y-4">
          <div className="flex flex-wrap gap-2 rounded-lg bg-muted p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("bold")}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("italic")}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("link")}>
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("list")}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("ordered-list")}>
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your trade notes here..."
            className="min-h-[200px] resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {notes === savedNotes ? "All changes saved" : "Unsaved changes"}
            </span>
            <Button onClick={handleSave} disabled={isSaving || notes === savedNotes}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="preview" className="rounded-lg border border-border p-4">
          {notes ? (
            <div className="prose prose-invert max-w-none">
              {/* This would normally use a markdown renderer */}
              <div className="whitespace-pre-wrap">{notes}</div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No content to preview</p>
          )}
        </TabsContent>
      </Tabs>

      {isRecording && (
        <div className="rounded-lg bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
            <span className="font-medium text-destructive">Recording in progress...</span>
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
        </div>
      )}
    </div>
  )
}
