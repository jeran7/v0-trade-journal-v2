"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  MessageSquare,
  Share2,
  Tag,
  Trash2,
  ImageIcon,
  ExternalLink,
  Lightbulb,
  BarChart,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"
import { RichTextEditor } from "@/components/journal/rich-text-editor"
import { MediaUploader } from "@/components/journal/media-uploader"
import { deleteJournalEntry } from "@/lib/supabase/journal-entries-service"
import type { JournalMedia } from "@/lib/supabase/journal-media-service"
import { getTrade } from "@/lib/supabase/trades-service"

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  const [entry, setEntry] = useState<any>(null)
  const [media, setMedia] = useState<JournalMedia[]>([])
  const [trade, setTrade] = useState<any>(null)

  useEffect(() => {
    setIsPageLoaded(true)
    fetchJournalEntry()
  }, [params.id])

  const fetchJournalEntry = async () => {
    try {
      setIsLoading(true)

      // Fetch journal entry
      const response = await fetch(`/api/journal/entries/${params.id}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setEntry(data.entry)
      setMedia(data.media || [])

      if (data.trade) {
        setTrade(data.trade)
      } else if (data.entry.trade_id) {
        // Fallback to fetch trade
        const trade = await getTrade(data.entry.trade_id)
        setTrade(trade)
      }
    } catch (error) {
      console.error("Error fetching journal entry:", error)
      toast({
        title: "Error",
        description: "Failed to load journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const success = await deleteJournalEntry(params.id)

      if (success) {
        toast({
          title: "Success",
          description: "Journal entry deleted successfully",
        })

        router.push("/journal")
      } else {
        throw new Error("Failed to delete journal entry")
      }
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "confident":
        return "bg-green-500/20 text-green-500"
      case "excited":
        return "bg-amber-500/20 text-amber-500"
      case "calm":
        return "bg-blue-500/20 text-blue-500"
      case "neutral":
        return "bg-muted text-muted-foreground"
      case "anxious":
        return "bg-orange-500/20 text-orange-500"
      case "frustrated":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score <= 3) return "text-red-500"
    if (score <= 6) return "text-amber-500"
    return "text-green-500"
  }

  const getConfidenceLabel = (score: number) => {
    if (score <= 2) return "Very Low"
    if (score <= 4) return "Low"
    if (score <= 6) return "Moderate"
    if (score <= 8) return "High"
    return "Very High"
  }

  if (isLoading) {
    return (
      <AppShell>
        <ContentWrapper>
          <div className="flex justify-center items-center h-[60vh]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </ContentWrapper>
      </AppShell>
    )
  }

  if (!entry) {
    return (
      <AppShell>
        <ContentWrapper>
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-2">Journal Entry Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The journal entry you're looking for might have been deleted or doesn't exist.
            </p>
            <Button asChild>
              <Link href="/journal">Back to Journal</Link>
            </Button>
          </div>
        </ContentWrapper>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <ContentWrapper>
        <div className="container mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/journal">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to journal</span>
                  </Link>
                </Button>
                <h1
                  className={`text-2xl font-bold tracking-tight transition-all duration-500 ${
                    isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                  }`}
                >
                  {entry.title}
                </h1>
              </div>
              <div
                className={`flex gap-2 transition-all duration-500 ${
                  isPageLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/journal/${params.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the journal entry and all associated
                        media.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div
              className={`grid gap-6 md:grid-cols-3 transition-all duration-500 ${
                isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <GlassCard className="md:col-span-2">
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/50">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {trade ? `Linked to ${trade.symbol} trade` : "Journal Entry"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.created_at).toLocaleDateString()}
                          <span className="mx-1">•</span>
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs ${getMoodColor(entry.mood)}`}>
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </div>
                  </div>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="font-medium">Psychological State</h3>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${getMoodColor(entry.mood)}`}>
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</div>
                      {entry.confidence_score && (
                        <p className="text-xs text-muted-foreground">
                          Confidence:
                          <span className={`ml-1 ${getConfidenceColor(entry.confidence_score)}`}>
                            {entry.confidence_score}/10 ({getConfidenceLabel(entry.confidence_score)})
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className={`transition-all duration-500 ${
                isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <TabsList>
                <TabsTrigger value="content">
                  <FileText className="mr-2 h-4 w-4" />
                  Content
                </TabsTrigger>
                {media.length > 0 && (
                  <TabsTrigger value="media">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Media ({media.length})
                  </TabsTrigger>
                )}
                {entry.lessons_learned && (
                  <TabsTrigger value="lessons">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Lessons Learned
                  </TabsTrigger>
                )}
                {trade && (
                  <TabsTrigger value="trade">
                    <BarChart className="mr-2 h-4 w-4" />
                    Trade Details
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <GlassCard className="p-6">
                  <RichTextEditor initialContent={entry.content} readOnly />
                </GlassCard>
              </TabsContent>

              <TabsContent value="media" className="mt-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Media</h3>
                  <MediaUploader journalEntryId={params.id} initialMedia={media} readOnly />
                </GlassCard>
              </TabsContent>

              <TabsContent value="lessons" className="mt-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Lessons Learned</h3>
                  <div className="bg-accent/10 p-4 rounded-md">
                    <p className="whitespace-pre-wrap">{entry.lessons_learned}</p>
                  </div>
                </GlassCard>
              </TabsContent>

              {trade && (
                <TabsContent value="trade" className="mt-6">
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Linked Trade</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Symbol</div>
                          <div>{trade.symbol}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Direction</div>
                          <div>{trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Entry Price</div>
                          <div>${trade.entry_price}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Exit Price</div>
                          <div>{trade.exit_price ? `$${trade.exit_price}` : "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">P&L</div>
                          <div
                            className={
                              trade.profit_loss && trade.profit_loss > 0
                                ? "text-profit"
                                : trade.profit_loss && trade.profit_loss < 0
                                  ? "text-loss"
                                  : ""
                            }
                          >
                            {trade.profit_loss !== null
                              ? `${trade.profit_loss > 0 ? "+" : ""}$${trade.profit_loss.toFixed(2)} (${
                                  trade.profit_loss_percent
                                    ? `${trade.profit_loss_percent > 0 ? "+" : ""}${trade.profit_loss_percent.toFixed(2)}%`
                                    : ""
                                })`
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Entry Date</div>
                          <div>{new Date(trade.entry_date).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/trades/${trade.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Full Trade
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
