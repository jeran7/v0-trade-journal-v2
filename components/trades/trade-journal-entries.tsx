"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, FileText, PlusCircle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface TradeJournalEntriesProps {
  tradeId: string
}

export function TradeJournalEntries({ tradeId }: TradeJournalEntriesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [journalEntries, setJournalEntries] = useState<any[]>([])

  useEffect(() => {
    const fetchJournalEntries = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/journal/entries?trade_id=${tradeId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch journal entries")
        }

        const data = await response.json()
        setJournalEntries(data.entries || [])
      } catch (error) {
        console.error("Error fetching journal entries:", error)
        toast({
          title: "Error",
          description: "Failed to load journal entries",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJournalEntries()
  }, [tradeId, toast])

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "confident":
        return "bg-green-500/20 text-green-500"
      case "anxious":
        return "bg-yellow-500/20 text-yellow-500"
      case "frustrated":
        return "bg-red-500/20 text-red-500"
      case "calm":
        return "bg-blue-500/20 text-blue-500"
      case "excited":
        return "bg-purple-500/20 text-purple-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (journalEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Journal Entries Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first journal entry for this trade to record your thoughts, emotions, and lessons learned.
        </p>
        <Button asChild>
          <Link href={`/journal/new?trade_id=${tradeId}`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Journal Entry
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Journal Entries</h2>
        <Button asChild>
          <Link href={`/journal/new?trade_id=${tradeId}`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {journalEntries.map((entry) => (
          <GlassCard
            key={entry.id}
            className="hover:bg-accent/10 transition-colors cursor-pointer"
            onClick={() => router.push(`/journal/${entry.id}`)}
          >
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{entry.title}</h3>
                <Badge className={getMoodColor(entry.mood)}>
                  {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>

              {entry.lessons_learned && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Lessons Learned:</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.lessons_learned}</p>
                </div>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
