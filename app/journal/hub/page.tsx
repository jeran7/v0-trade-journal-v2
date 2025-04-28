"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Calendar, Tag, Filter, SlidersHorizontal, FileText, MessageSquare } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"
import { getJournalEntries, type JournalEntry, type JournalEntryFilter } from "@/lib/supabase/journal-entries-service"

export default function JournalHubPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<JournalEntryFilter>({})
  const [sortField, setSortField] = useState<"created_at" | "updated_at" | "title">("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  const pageSize = 10

  useEffect(() => {
    setIsPageLoaded(true)
    fetchJournalEntries()
  }, [currentPage, sortField, sortDirection, filters])

  const fetchJournalEntries = async () => {
    try {
      setIsLoading(true)

      // Apply search query to title filter if present
      const appliedFilters = { ...filters }
      if (searchQuery) {
        appliedFilters.title = searchQuery
      }

      const { entries, count } = await getJournalEntries(
        currentPage,
        pageSize,
        sortField,
        sortDirection,
        appliedFilters,
      )

      setEntries(entries)
      setTotalEntries(count)
    } catch (error) {
      console.error("Error fetching journal entries:", error)
      toast({
        title: "Error",
        description: "Failed to load journal entries. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchJournalEntries()
  }

  const handleFilterChange = (newFilters: Partial<JournalEntryFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery("")
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-") as ["created_at" | "updated_at" | "title", "asc" | "desc"]
    setSortField(field)
    setSortDirection(direction)
  }

  const totalPages = Math.ceil(totalEntries / pageSize)

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

  return (
    <AppShell>
      <ContentWrapper>
        <div className="container mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1
                className={`text-2xl font-bold tracking-tight transition-all duration-500 ${
                  isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
              >
                Journal Entries
              </h1>
              <div
                className={`transition-all duration-500 ${
                  isPageLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                <Button asChild>
                  <Link href="/journal/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                  </Link>
                </Button>
              </div>
            </div>

            <div
              className={`flex flex-col gap-4 sm:flex-row transition-all duration-500 ${
                isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search journal entries..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Mood</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleFilterChange({ mood: "confident" })}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                        Confident
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleFilterChange({ mood: "excited" })}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
                        Excited
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleFilterChange({ mood: "calm" })}>
                        <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                        Calm
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleFilterChange({ mood: "neutral" })}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-slate-500" />
                        Neutral
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleFilterChange({ mood: "anxious" })}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-orange-500" />
                        Anxious
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleFilterChange({ mood: "frustrated" })}
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                        Frustrated
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={clearFilters}>
                      Clear Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select defaultValue="created_at-desc" onValueChange={handleSortChange}>
                  <SelectTrigger className="gap-2 w-[180px]">
                    <SlidersHorizontal className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort By</SelectLabel>
                      <SelectItem value="created_at-desc">Newest First</SelectItem>
                      <SelectItem value="created_at-asc">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                      <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ${
                isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : entries.length > 0 ? (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <GlassCard key={entry.id} className="hover:bg-accent/5 transition-colors">
                      <Link href={`/journal/${entry.id}`} className="block p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/50">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{entry.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(entry.created_at).toLocaleDateString()}
                                {entry.tags && entry.tags.length > 0 && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <Tag className="h-3 w-3" />
                                    {entry.tags.slice(0, 3).join(", ")}
                                    {entry.tags.length > 3 && "..."}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {entry.trade_id && (
                              <Badge variant="outline" className="text-xs">
                                Linked Trade
                              </Badge>
                            )}
                            <div className={`rounded-full px-3 py-1 text-xs ${getMoodColor(entry.mood)}`}>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </GlassCard>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          const pageNumber = i + 1
                          return (
                            <Button
                              key={pageNumber}
                              variant={pageNumber === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="w-8"
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                        {totalPages > 5 && <span className="px-2">...</span>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Journal Entries Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {Object.keys(filters).length > 0 || searchQuery
                      ? "No entries match your search criteria. Try adjusting your filters or search query."
                      : "Start documenting your trading journey by creating your first journal entry."}
                  </p>
                  <Button asChild>
                    <Link href="/journal/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Entry
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
