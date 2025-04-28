"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { TradeJournalDashboard } from "@/components/journal/trade-journal-dashboard"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/supabase-client"

export default function JournalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("entries")
  const [searchQuery, setSearchQuery] = useState("")
  const [journalEntries, setJournalEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [isSettingUpTables, setIsSettingUpTables] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const supabase = getSupabaseClient()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth check error:", error)
          setIsAuthenticated(false)
          return
        }

        setIsAuthenticated(!!data.session)
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      const currentPath = window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)

      toast({
        title: "Authentication Required",
        description: "Please log in to access the journal",
        variant: "destructive",
      })
    }
  }, [isAuthenticated, router, toast])

  // Check if journal_entries table exists
  useEffect(() => {
    if (isAuthenticated !== true) return

    const checkTable = async () => {
      try {
        const { count, error } = await supabase.from("journal_entries").select("*", { count: "exact", head: true })

        if (error && error.message.includes("does not exist")) {
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
    }

    checkTable()
  }, [supabase, isAuthenticated])

  // Inside the setupJournalTables function
  const setupJournalTables = async () => {
    setIsSettingUpTables(true)
    setApiError(null)

    try {
      const response = await fetch("/api/admin/setup-journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up journal tables")
      }

      setTableError(false)
      toast({
        title: "Success",
        description: data.message || "Journal tables created successfully!",
      })

      // Refresh the page to load entries
      window.location.reload()
    } catch (error) {
      console.error("Error setting up tables:", error)
      toast({
        title: "Error",
        description: "Failed to set up journal tables. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSettingUpTables(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated !== true || tableError) {
      setIsLoading(false)
      return
    }

    const fetchJournalEntries = async () => {
      setIsLoading(true)
      setApiError(null)

      try {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime()
        const response = await fetch(
          `/api/journal/entries?${searchQuery ? `search=${searchQuery}&` : ""}t=${timestamp}`,
          {
            credentials: "include", // Important for sending cookies
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API error response:", errorData)

          // Check if the error is due to missing table
          if (errorData.error && errorData.error.includes("does not exist")) {
            setTableError(true)
          } else if (response.status === 401) {
            // Handle unauthorized error
            setApiError("Authentication error. Please log in again.")
            toast({
              title: "Authentication Error",
              description: "Please log in again to continue.",
              variant: "destructive",
            })
            // Redirect to login
            router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
          } else {
            setApiError(errorData.error || "Failed to fetch journal entries")
            toast({
              title: "Error",
              description: errorData.error || "Failed to fetch journal entries",
              variant: "destructive",
            })
          }
          return
        }

        const data = await response.json()
        setJournalEntries(data.entries || [])
      } catch (error) {
        console.error("Error fetching journal entries:", error)
        setApiError("An unexpected error occurred while fetching journal entries")
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
  }, [searchQuery, toast, tableError, isAuthenticated, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is handled by the useEffect dependency on searchQuery
  }

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

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Show table setup UI if table doesn't exist
  if (tableError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Trading Journal</h1>
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
        </Card>
      </div>
    )
  }

  // Show API error if there is one
  if (apiError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Trading Journal</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              There was an error connecting to the journal API. This might be due to missing environment variables or a
              server configuration issue.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button variant="outline" onClick={() => router.push("/auth/login")}>
                Log In Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trading Journal</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/journal/new")}>New Entry</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by title, trade symbol, mood, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>

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
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                          {entry.trade && (
                            <>
                              <span>•</span>
                              <span>Trade: {entry.trade.symbol}</span>
                            </>
                          )}
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
              <p className="text-muted-foreground">No journal entries found.</p>
              <Button onClick={() => router.push("/journal/new")} variant="outline" className="mt-4">
                Create Your First Entry
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dashboard">
          <TradeJournalDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
