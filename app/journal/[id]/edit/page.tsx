"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/journal/rich-text-editor"
import { MediaUploader } from "@/components/journal/media-uploader"
import { TagInput } from "@/components/journal/tag-input"
import { MoodSelector } from "@/components/journal/mood-selector"
import { ConfidenceScore } from "@/components/journal/confidence-score"
import { useToast } from "@/hooks/use-toast"

export default function EditJournalEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [tradeId, setTradeId] = useState("")
  const [content, setContent] = useState({})
  const [mood, setMood] = useState("neutral")
  const [confidenceScore, setConfidenceScore] = useState(5)
  const [lessonsLearned, setLessonsLearned] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [existingMedia, setExistingMedia] = useState<any[]>([])
  const [trades, setTrades] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch journal entry
        const entryResponse = await fetch(`/api/journal/entries/${params.id}`)
        if (!entryResponse.ok) {
          throw new Error("Failed to fetch journal entry")
        }
        const entryData = await entryResponse.json()
        const entry = entryData.entry

        // Set form data
        setTitle(entry.title)
        setTradeId(entry.trade_id || "")
        setContent(entry.content || {})
        setMood(entry.mood)
        setConfidenceScore(entry.confidence_score || 5)
        setLessonsLearned(entry.lessons_learned || "")
        setTags(entry.tags || [])
        setExistingMedia(entryData.media || [])

        // Fetch trades for dropdown
        const tradesResponse = await fetch("/api/trades")
        if (tradesResponse.ok) {
          const tradesData = await tradesResponse.json()
          setTrades(tradesData.trades || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load journal entry",
          variant: "destructive",
        })
        router.push("/journal")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Update journal entry
      const journalResponse = await fetch(`/api/admin/journal/entries/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          trade_id: tradeId || null,
          content,
          mood,
          confidence_score: confidenceScore,
          lessons_learned: lessonsLearned,
          tags,
        }),
      })

      if (!journalResponse.ok) {
        throw new Error("Failed to update journal entry")
      }

      // Upload new media files if any
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("journalEntryId", params.id)

          // Determine media type
          let mediaType = "document"
          if (file.type.startsWith("image/")) mediaType = "image"
          else if (file.type.startsWith("video/")) mediaType = "video"
          else if (file.type.startsWith("audio/")) mediaType = "audio"

          formData.append("media_type", mediaType)

          const mediaResponse = await fetch("/api/admin/journal/media", {
            method: "POST",
            body: formData,
          })

          if (!mediaResponse.ok) {
            toast({
              title: "Warning",
              description: `Failed to upload media file: ${file.name}`,
              variant: "destructive",
            })
          }
        }
      }

      toast({
        title: "Success",
        description: "Journal entry updated successfully",
      })

      router.push(`/journal/${params.id}`)
    } catch (error) {
      console.error("Error updating journal entry:", error)
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/admin/journal/media/${mediaId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setExistingMedia(existingMedia.filter((media) => media.id !== mediaId))
        toast({
          title: "Success",
          description: "Media deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete media",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting media:", error)
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Journal Entry</h1>
        <Button onClick={() => router.push(`/journal/${params.id}`)} variant="outline">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your journal entry"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="trade" className="text-sm font-medium">
                Related Trade
              </label>
              <Select value={tradeId} onValueChange={setTradeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trade (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {trades.map((trade: any) => (
                    <SelectItem key={trade.id} value={trade.id}>
                      {trade.symbol} - {new Date(trade.entry_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journal Content</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              initialContent={content}
              onChange={setContent}
              placeholder="Write your journal entry here..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Psychological Factors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MoodSelector value={mood} onChange={setMood} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Confidence Score</label>
              <ConfidenceScore value={confidenceScore} onChange={setConfidenceScore} />
            </div>

            <div className="space-y-2">
              <label htmlFor="lessons" className="text-sm font-medium">
                Lessons Learned
              </label>
              <Textarea
                id="lessons"
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                placeholder="What did you learn from this experience?"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags & Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <TagInput initialTags={tags} onChange={setTags} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Existing Media</label>
              {existingMedia.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingMedia.map((media) => (
                    <div key={media.id} className="relative group">
                      {media.media_type === "image" ? (
                        <img
                          src={media.media_url || "/placeholder.svg"}
                          alt="Journal media"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : media.media_type === "video" ? (
                        <video src={media.media_url} controls className="w-full h-32 object-cover rounded-md" />
                      ) : media.media_type === "audio" ? (
                        <div className="w-full h-32 bg-accent flex items-center justify-center rounded-md">
                          <audio src={media.media_url} controls className="w-full px-2" />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-accent flex items-center justify-center rounded-md">
                          <a href={media.media_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                            View Document
                          </a>
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMedia(media.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No media files attached</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add New Media</label>
              <MediaUploader journalEntryId={params.id} onChange={(media) => setExistingMedia(media)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
