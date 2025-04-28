"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDown, ArrowUp, Download, Filter, Plus, Search, SlidersHorizontal, X } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { type Trade, getTrades } from "@/lib/supabase/trades-service"

// Mock data for initial render
const mockTrades = [
  {
    id: "1",
    symbol: "AAPL",
    direction: "long",
    entry_price: 175.23,
    exit_price: 182.67,
    quantity: 100,
    profit_loss: 744.0,
    profit_loss_percent: 4.25,
    entry_date: "2023-12-15",
    exit_date: "2023-12-16",
    status: "closed",
    setup: "Breakout",
    tags: ["Gap Up", "High Volume"],
    user_id: "1",
    created_at: "2023-12-15",
    updated_at: "2023-12-16",
    fees: 0,
    notes: "",
    import_source: "manual",
  },
  // Add more mock trades if needed
]

export default function TradesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const initialLoadComplete = useRef(false)

  const [trades, setTrades] = useState<Trade[]>(mockTrades)
  const [loading, setLoading] = useState(true)
  const [totalTrades, setTotalTrades] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  // Sorting
  const [sortField, setSortField] = useState<string>("entry_date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Filtering
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    symbol: "",
    direction: "",
    status: "",
    startDate: "",
    endDate: "",
    setup: "",
  })

  // Load data only once on initial render
  useEffect(() => {
    if (initialLoadComplete.current) return

    const loadInitialData = async () => {
      setLoading(true)

      try {
        // Get params from URL
        const symbol = searchParams.get("symbol") || ""
        const direction = searchParams.get("direction") || ""
        const status = searchParams.get("status") || ""
        const startDate = searchParams.get("startDate") || ""
        const endDate = searchParams.get("endDate") || ""
        const setup = searchParams.get("setup") || ""
        const sort = searchParams.get("sort") || "entry_date"
        const order = searchParams.get("order") || "desc"
        const query = searchParams.get("q") || ""
        const pageParam = searchParams.get("page") || "1"

        // Set state without triggering re-renders
        setFilters({
          symbol,
          direction: direction as any,
          status: status as any,
          startDate,
          endDate,
          setup,
        })
        setSortField(sort)
        setSortDirection(order as "asc" | "desc")
        setSearchQuery(query)
        setPage(Number.parseInt(pageParam, 10))

        // Fetch trades
        const result = await getTrades(Number.parseInt(pageParam, 10), pageSize, sort as any, order as "asc" | "desc", {
          symbol,
          direction: direction as any,
          status: status as any,
          startDate,
          endDate,
          setup,
          query,
        })

        setTrades(result.trades)
        setTotalTrades(result.count)
        initialLoadComplete.current = true
      } catch (error) {
        console.error("Error fetching trades:", error)
        toast({
          title: "Error",
          description: "Failed to load trades. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [searchParams, pageSize, toast])

  // Function to fetch trades (used for manual refreshes)
  const fetchTrades = async () => {
    setLoading(true)

    try {
      // Get current URL params
      const currentParams = new URLSearchParams(window.location.search)
      const currentPage = currentParams.get("page") || page.toString()
      const currentSort = currentParams.get("sort") || sortField
      const currentOrder = currentParams.get("order") || sortDirection
      const currentQuery = currentParams.get("q") || searchQuery

      // Get filter values from URL or state
      const filterParams = {
        symbol: currentParams.get("symbol") || filters.symbol,
        direction: currentParams.get("direction") || filters.direction,
        status: currentParams.get("status") || filters.status,
        startDate: currentParams.get("startDate") || filters.startDate,
        endDate: currentParams.get("endDate") || filters.endDate,
        setup: currentParams.get("setup") || filters.setup,
        query: currentQuery,
      }

      // Fetch trades
      const result = await getTrades(
        Number.parseInt(currentPage, 10),
        pageSize,
        currentSort as any,
        currentOrder as "asc" | "desc",
        filterParams,
      )

      setTrades(result.trades)
      setTotalTrades(result.count)
    } catch (error) {
      console.error("Error fetching trades:", error)
      toast({
        title: "Error",
        description: "Failed to load trades. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === "desc" ? "asc" : "desc"
    setSortField(field)
    setSortDirection(newDirection)

    // Update URL without triggering a navigation
    const url = new URL(window.location.href)
    url.searchParams.set("sort", field)
    url.searchParams.set("order", newDirection)

    // Use replace to avoid adding to history stack
    router.replace(url.pathname + url.search)

    // Manually fetch trades after state update
    setTimeout(fetchTrades, 0)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Update URL without triggering a navigation
    const url = new URL(window.location.href)
    if (searchQuery) {
      url.searchParams.set("q", searchQuery)
    } else {
      url.searchParams.delete("q")
    }
    url.searchParams.set("page", "1")

    // Use replace to avoid adding to history stack
    router.replace(url.pathname + url.search)

    // Manually fetch trades after state update
    setTimeout(fetchTrades, 0)
  }

  const applyFilters = () => {
    setFilterOpen(false)

    // Update URL without triggering a navigation
    const url = new URL(window.location.href)

    // Update filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }
    })

    url.searchParams.set("page", "1")

    // Use replace to avoid adding to history stack
    router.replace(url.pathname + url.search)

    // Manually fetch trades after state update
    setTimeout(fetchTrades, 0)
  }

  const clearFilters = () => {
    const emptyFilters = {
      symbol: "",
      direction: "",
      status: "",
      startDate: "",
      endDate: "",
      setup: "",
    }
    setFilters(emptyFilters)

    // Update URL without triggering a navigation
    const url = new URL(window.location.href)

    // Remove filter params
    Object.keys(emptyFilters).forEach((key) => {
      url.searchParams.delete(key)
    })

    url.searchParams.set("page", "1")

    // Use replace to avoid adding to history stack
    router.replace(url.pathname + url.search)

    // Manually fetch trades after state update
    setTimeout(fetchTrades, 0)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)

    // Update URL without triggering a navigation
    const url = new URL(window.location.href)
    url.searchParams.set("page", newPage.toString())

    // Use replace to avoid adding to history stack
    router.replace(url.pathname + url.search)

    // Manually fetch trades after state update
    setTimeout(fetchTrades, 0)
  }

  const exportTrades = () => {
    // Convert trades to CSV
    const headers = ["Symbol", "Direction", "Entry Price", "Exit Price", "Quantity", "P&L", "Date", "Status"]
    const csvContent = [
      headers.join(","),
      ...trades.map((trade) =>
        [
          trade.symbol,
          trade.direction,
          trade.entry_price,
          trade.exit_price || "",
          trade.quantity,
          trade.profit_loss || "",
          new Date(trade.entry_date).toLocaleDateString(),
          trade.status,
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `trades_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AppShell>
      <ContentWrapper>
        <div className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-sf-pro">Trades</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportTrades}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/trades/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Trade
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <form className="relative flex-1" onSubmit={handleSearch}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search trades, symbols..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex gap-2">
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filters</h4>
                      <p className="text-sm text-muted-foreground">Filter trades by various criteria</p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="direction">Direction</Label>
                          <Select
                            value={filters.direction}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, direction: value }))}
                          >
                            <SelectTrigger id="direction">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="long">Long</SelectItem>
                              <SelectItem value="short">Short</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="setup">Setup</Label>
                        <Input
                          id="setup"
                          placeholder="e.g. Breakout"
                          value={filters.setup}
                          onChange={(e) => setFilters((prev) => ({ ...prev, setup: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="startDate">From</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">To</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          <X className="mr-2 h-4 w-4" />
                          Clear
                        </Button>
                        <Button size="sm" onClick={applyFilters}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSort("entry_date")}>
                    Date {sortField === "entry_date" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("symbol")}>
                    Symbol {sortField === "symbol" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("profit_loss")}>
                    P&L {sortField === "profit_loss" && (sortDirection === "desc" ? "↓" : "↑")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : trades.length === 0 ? (
            <GlassCard className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium">No trades found</h3>
                <p className="text-muted-foreground mt-2">
                  {Object.values(filters).some(Boolean) || searchQuery
                    ? "Try adjusting your filters or search query"
                    : "Get started by adding your first trade"}
                </p>
                {!Object.values(filters).some(Boolean) && !searchQuery && (
                  <Button className="mt-4" asChild>
                    <Link href="/trades/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Trade
                    </Link>
                  </Button>
                )}
              </div>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {trades.map((trade) => (
                <Link key={trade.id} href={`/trades/${trade.id}`}>
                  <GlassCard className="transition-all duration-300 hover:bg-accent/10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${trade.direction === "long" ? "bg-profit/20" : "bg-loss/20"}`}
                        >
                          {trade.direction === "long" ? (
                            <ArrowUp className="h-5 w-5 text-profit" />
                          ) : (
                            <ArrowDown className="h-5 w-5 text-loss" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{trade.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)} •{" "}
                            {trade.setup || "No setup"}
                          </div>
                        </div>
                      </div>

                      <div className="hidden flex-1 grid-cols-4 gap-4 sm:grid">
                        <div>
                          <div className="text-xs text-muted-foreground">Entry</div>
                          <div className="font-medium">${trade.entry_price}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Exit</div>
                          <div className="font-medium">{trade.exit_price ? `$${trade.exit_price}` : "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Size</div>
                          <div className="font-medium">{trade.quantity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Date</div>
                          <div className="font-medium">{new Date(trade.entry_date).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:hidden">
                        {trade.tags && trade.tags.length > 0 ? (
                          trade.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No tags
                          </Badge>
                        )}
                      </div>

                      <div className="ml-auto text-right">
                        <div
                          className={`font-medium ${trade.profit_loss && trade.profit_loss > 0 ? "text-profit" : trade.profit_loss && trade.profit_loss < 0 ? "text-loss" : ""}`}
                        >
                          {trade.profit_loss
                            ? `${trade.profit_loss > 0 ? "+" : ""}$${Math.abs(Number(trade.profit_loss)).toFixed(2)}`
                            : trade.status === "open"
                              ? "Open"
                              : "—"}
                        </div>
                        <div
                          className={`text-xs ${trade.profit_loss_percent && trade.profit_loss_percent > 0 ? "text-profit" : trade.profit_loss_percent && trade.profit_loss_percent < 0 ? "text-loss" : ""}`}
                        >
                          {trade.profit_loss_percent
                            ? `${trade.profit_loss_percent > 0 ? "+" : ""}${Number(trade.profit_loss_percent).toFixed(2)}%`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}

          {totalTrades > pageSize && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                  Previous
                </Button>
                <div className="flex items-center text-sm">
                  Page {page} of {Math.ceil(totalTrades / pageSize)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(totalTrades / pageSize)}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
