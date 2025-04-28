"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { RichTextEditor } from "@/components/journal/rich-text-editor"
import { TagInput } from "@/components/journal/tag-input"
import { MoodSelector } from "@/components/journal/mood-selector"
import { ConfidenceScore } from "@/components/journal/confidence-score"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/supabase-client"

// Default initial content structure for Tiptap
const defaultEditorContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
}

export default function NewJournalEntryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [title, setTitle] = useState("")
  const [tradeId, setTradeId] = useState("")
  const [content, setContent] = useState(defaultEditorContent)
  const [mood, setMood] = useState("neutral")
  const [confidenceScore, setConfidenceScore] = useState(5)
  const [lessonsLearned, setLessonsLearned] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [trades, setTrades] = useState([])
  const [tradesLoading, setTradesLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [tableError, setTableError] = useState<boolean>(false)
  const [isSettingUpTables, setIsSettingUpTables] = useState(false)
  const supabase = getSupabaseClient()

  // Add debugging
  useEffect(() => {
    console.log("Initial editor content:", defaultEditorContent)
  }, [])

  // Check authentication directly
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth check error:", error)
          setIsAuthenticated(false)
          toast({
            title: "Authentication Error",
            description: "Please log in to continue",
            variant: "destructive",
          })
          router.push("/auth/login?redirect=/journal/new")
          return
        }

        if (data.session) {
          console.log("Current session: exists")
          console.log("User authenticated:", data.session.user.email)
          setIsAuthenticated(true)

          // Check if journal_entries table exists
          try {
            const { count, error: tableError } = await supabase
              .from("journal_entries")
              .select("*", { count: "exact", head: true })

            if (tableError && tableError.message.includes("does not exist")) {
              console.log("journal_entries table does not exist")
              setTableError(true)
            } else {
              setTableError(false)
            }
          } catch (error) {
            console.error("Error checking table:", error)
            // Assume table doesn't exist if there's an error
            setTableError(true)
          }
        } else {
          console.log("No current session")
          setIsAuthenticated(false)
          toast({
            title: "Authentication Required",
            description: "Please log in to create a journal entry",
            variant: "destructive",
          })
          router.push("/auth/login?redirect=/journal/new")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsAuthChecking(false)
        console.log("Auth initialization complete")
      }
    }

    checkAuth()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)
      if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false)
        router.push("/auth/login?redirect=/journal/new")
      }
    })

    // Clean up listener
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, toast, supabase])

  // Fetch trades directly without using the API
  useEffect(() => {
    const fetchTrades = async () => {
      if (!isAuthenticated) return

      setTradesLoading(true)
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsAuthenticated(false)
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          router.push("/auth/login?redirect=/journal/new")
          return
        }

        // Fetch trades directly from Supabase
        const { data, error } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .order("entry_date", { ascending: false })

        if (error) {
          console.error("Error fetching trades:", error)
          toast({
            title: "Error",
            description: "Failed to load trades. You can still create a journal entry.",
            variant: "destructive",
          })
        } else {
          setTrades(data || [])
        }
      } catch (error) {
        console.error("Error fetching trades:", error)
        toast({
          title: "Error",
          description: "Failed to load trades. You can still create a journal entry.",
          variant: "destructive",
        })
      } finally {
        setTradesLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchTrades()
    }
  }, [isAuthenticated, router, toast, supabase])

  // Inside the setupJournalTables function
  const setupJournalTables = async () => {
    setIsSettingUpTables(true)
    setDebugInfo("Setting up journal tables...")

    try {
      const response = await fetch("/api/admin/setup-journal", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to set up journal tables")
      }

      setDebugInfo((prev) => prev + "\nTables created successfully!")
      setTableError(false)
      toast({
        title: "Success",
        description: data.message || "Journal tables created successfully!",
      })
    } catch (error) {
      console.error("Error setting up tables:", error)
      setDebugInfo(
        (prev) => prev + `\nError setting up tables: ${error instanceof Error ? error.message : String(error)}`,
      )
      toast({
        title: "Error",
        description: "Failed to set up journal tables. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSettingUpTables(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a journal entry",
        variant: "destructive",
      })
      router.push("/auth/login?redirect=/journal/new")
      return
    }

    // Check if table exists
    if (tableError) {
      toast({
        title: "Database Not Ready",
        description: "Please set up the journal tables first",
        variant: "destructive",
      })
      return
    }

    // Validate content
    if (!content || !content.type) {
      toast({
        title: "Error",
        description: "Please enter some content for your journal entry",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setDebugInfo("")

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push("/auth/login?redirect=/journal/new")
        return
      }

      // Log the data we're about to insert
      const journalEntry = {
        user_id: user.id,
        title,
        trade_id: tradeId && tradeId !== "none" ? tradeId : null,
        content,
        mood,
        confidence_score: confidenceScore,
        lessons_learned: lessonsLearned,
        tags: tags && tags.length > 0 ? tags : null, // Add null check for tags
      }

      console.log("Submitting journal entry with content:", JSON.stringify(content))
      setDebugInfo((prev) => prev + `\nPreparing to insert journal entry: ${JSON.stringify(journalEntry, null, 2)}`)

      // Insert journal entry directly with Supabase
      const { data, error } = await supabase.from("journal_entries").insert(journalEntry).select().single()

      if (error) {
        console.error("Supabase insert error:", error)
        setDebugInfo((prev) => prev + `\nSupabase insert error: ${JSON.stringify(error, null, 2)}`)

        // Check for specific error types
        if (error.code === "23505") {
          throw new Error("A journal entry with this title already exists.")
        } else if (error.code === "23503") {
          throw new Error("Referenced trade does not exist or belongs to another user.")
        } else if (error.code === "42P01" || error.message.includes("does not exist")) {
          setTableError(true)
          throw new Error("The journal_entries table does not exist. Please set up the journal tables first.")
        } else {
          throw new Error(error.message || error.details || "Failed to create journal entry")
        }
      }

      if (!data) {
        console.error("No data returned from insert")
        setDebugInfo((prev) => prev + `\nNo data returned from insert`)
        throw new Error("No data returned from insert operation")
      }

      setDebugInfo((prev) => prev + `\nJournal entry created successfully with ID: ${data.id}`)
      console.log("Journal entry created:", data)

      toast({
        title: "Success",
        description: "Journal entry created successfully",
      })

      router.push(`/journal/${data.id}`)
    } catch (error) {
      let errorMessage = "Failed to create journal entry"

      if (error instanceof Error) {
        errorMessage = error.message
        console.error("Error creating journal entry:", error)
        setDebugInfo((prev) => prev + `\nError (Error object): ${error.message}\n${error.stack || "No stack trace"}`)
      } else {
        // Log the actual error object
        console.error("Error creating journal entry:", error)
        setDebugInfo((prev) => prev + `\nError (unknown type): ${JSON.stringify(error, null, 2)}`)
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the form if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Show table setup UI if table doesn't exist
  if (tableError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">New Journal Entry</h1>
          <Button onClick={() => router.push("/journal")} variant="outline">
            Cancel
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription>
            The journal tables don't exist in your database yet. You need to set them up before creating journal
            entries.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Before you can create journal entries, you need to set up the required database tables. This only needs to
              be done once.
            </p>
            <Button onClick={setupJournalTables} disabled={isSettingUpTables}>
              {isSettingUpTables ? "Setting Up Tables..." : "Set Up Journal Tables"}
            </Button>
          </CardContent>
          {debugInfo && (
            <CardFooter>
              <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-[200px] p-4 bg-muted rounded-md w-full">
                {debugInfo}
              </pre>
            </CardFooter>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">New Journal Entry</h1>
        <Button onClick={() => router.push("/journal")} variant="outline">
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
                  {tradesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading trades...
                    </SelectItem>
                  ) : trades.length > 0 ? (
                    trades.map((trade: any) => (
                      <SelectItem key={trade.id} value={trade.id}>
                        {trade.symbol} - {new Date(trade.entry_date).toLocaleDateString()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-trades" disabled>
                      No trades found
                    </SelectItem>
                  )}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Mood</label>
              <MoodSelector value={mood as any} onChange={(value) => setMood(value)} />
            </div>

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
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput initialTags={tags} onChange={setTags} placeholder="Add tags (press Enter after each tag)" />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Journal Entry"}
          </Button>
        </div>
      </form>

      {debugInfo && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-[300px] p-4 bg-muted rounded-md">
              {debugInfo}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
