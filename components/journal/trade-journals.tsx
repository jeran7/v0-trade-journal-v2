"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface TradeJournalsProps {
  tradeId: string
}

export function TradeJournals({ tradeId }: TradeJournalsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [journalEntries, setJournalEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJournalEntries = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/journal/entries?trade_id=${tradeId}`)
        if (response.ok) {
          const data = await response.json()
          setJournalEntries(data.entries || [])
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch journal entries",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error)
        toast({
          title: "Error",
          description: "Failed to fetch journal entries",
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
        return "bg-green-500"
      case "anxious":
        return "bg-yellow-500"
      case "frustrated":
        return "bg-red-500"
      case "calm":
        return "bg-blue-500"
      case "excited":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleNewJournalEntry = () => {
    router.push(`/journal/new?trade_id=${tradeId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Journal Entries</h2>
        <Button onClick={handleNewJournalEntry}>New Journal Entry</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : journalEntries.length > 0 ? (
        <div className="grid gap-4">
          {journalEntries.map((entry: any) => (
            <Card
              key={entry.id}
              className="hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => router.push(`/journal/${entry.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{entry.title}</h3>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood)}`} />
                    <span className="text-sm capitalize">{entry.mood}</span>
                  </div>
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {entry.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No journal entries for this trade yet.</p>
          <Button onClick={handleNewJournalEntry} variant="outline" className="mt-4">
            Create Your First Entry
          </Button>
        </div>
      )}
    </div>
  )
}
