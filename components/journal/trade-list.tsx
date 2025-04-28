"use client"

import { useState, useEffect } from "react"
import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Tag,
  Trash,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface TradeListProps {
  compact?: boolean
  limit?: number
}

export function TradeList({ compact = false, limit }: TradeListProps) {
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [sortColumn, setSortColumn] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTrades, setFilteredTrades] = useState(mockTrades)

  // Apply filters, sorting, and grouping
  useEffect(() => {
    let result = [...mockTrades]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (trade) =>
          trade.symbol.toLowerCase().includes(query) ||
          trade.setup.toLowerCase().includes(query) ||
          trade.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any = a[sortColumn as keyof typeof a]
      let valueB: any = b[sortColumn as keyof typeof b]

      // Handle null values
      if (valueA === null) return sortDirection === "asc" ? -1 : 1
      if (valueB === null) return sortDirection === "asc" ? 1 : -1

      // Handle date strings
      if (sortColumn === "date") {
        valueA = new Date(valueA).getTime()
        valueB = new Date(valueB).getTime()
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    // Apply limit if specified
    if (limit && result.length > limit) {
      result = result.slice(0, limit)
    }

    setFilteredTrades(result)
  }, [searchQuery, sortColumn, sortDirection, limit])

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  // Toggle trade selection
  const toggleTradeSelection = (id: string) => {
    setSelectedTrades((prev) => (prev.includes(id) ? prev.filter((tradeId) => tradeId !== id) : [...prev, id]))
  }

  // Toggle all trades selection
  const toggleAllSelection = () => {
    if (selectedTrades.length === filteredTrades.length) {
      setSelectedTrades([])
    } else {
      setSelectedTrades(filteredTrades.map((trade) => trade.id))
    }
  }

  // Group trades by the specified field
  const getGroupedTrades = () => {
    if (!groupBy) return { "All Trades": filteredTrades }

    return filteredTrades.reduce((groups: Record<string, typeof mockTrades>, trade) => {
      const groupValue = String(trade[groupBy as keyof typeof trade] || "Other")
      if (!groups[groupValue]) {
        groups[groupValue] = []
      }
      groups[groupValue].push(trade)
      return groups
    }, {})
  }

  const groupedTrades = getGroupedTrades()

  return (
    <GlassCard className="overflow-hidden">
      {!compact && (
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search trades, symbols, setups..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={groupBy || ""} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Group by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No grouping</SelectItem>
                  <SelectItem value="symbol">Symbol</SelectItem>
                  <SelectItem value="setup">Strategy</SelectItem>
                  <SelectItem value="type">Direction</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>

              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Advanced filters</span>
              </Button>
            </div>
          </div>

          {selectedTrades.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-2 bg-muted/50 rounded-md">
              <span className="text-sm font-medium">{selectedTrades.length} trades selected</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm">
                  <Tag className="mr-2 h-4 w-4" />
                  Tag
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        {Object.entries(groupedTrades).map(([group, trades]) => (
          <div key={group} className="border-b border-border last:border-0">
            {groupBy && (
              <div className="p-2 bg-muted/30 font-medium text-sm">
                {group}
                <span className="ml-2 text-muted-foreground">({trades.length} trades)</span>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedTrades.length === filteredTrades.length}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[180px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("symbol")}>
                      Symbol
                      <ArrowUpDown
                        className={cn("ml-1 h-4 w-4", sortColumn === "symbol" ? "opacity-100" : "opacity-40")}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("setup")}>
                      Setup
                      <ArrowUpDown
                        className={cn("ml-1 h-4 w-4", sortColumn === "setup" ? "opacity-100" : "opacity-40")}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("entry")}>
                      Entry
                      <ArrowUpDown
                        className={cn("ml-1 h-4 w-4", sortColumn === "entry" ? "opacity-100" : "opacity-40")}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("exit")}>
                      Exit
                      <ArrowUpDown
                        className={cn("ml-1 h-4 w-4", sortColumn === "exit" ? "opacity-100" : "opacity-40")}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("size")}>
                      Size
                      <ArrowUpDown
                        className={cn("ml-1 h-4 w-4", sortColumn === "size" ? "opacity-100" : "opacity-40")}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("pnl")}>
                      P&L
                      <ArrowUpDown
                        className={cn("ml-1 h-4 w-4", sortColumn === "pnl" ? "opacity-100" : "opacity-40")}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("date")}>
                      Date
                      <ArrowUpDown
                        className={cn("ml-1 h-4 w-4", sortColumn === "date" ? "opacity-100" : "opacity-40")}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <>
                    <TableRow key={trade.id} className={expandedRows.includes(trade.id) ? "border-0" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTrades.includes(trade.id)}
                          onCheckedChange={() => toggleTradeSelection(trade.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRowExpansion(trade.id)}
                        >
                          {expandedRows.includes(trade.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              trade.type === "Long"
                                ? "bg-blue-500/20 text-blue-500"
                                : "bg-purple-500/20 text-purple-500"
                            }`}
                          >
                            {trade.type === "Long" ? "L" : "S"}
                          </div>
                          <span className="font-medium">{trade.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell>{trade.setup}</TableCell>
                      <TableCell>${trade.entry.toFixed(2)}</TableCell>
                      <TableCell>{trade.exit ? `$${trade.exit.toFixed(2)}` : "-"}</TableCell>
                      <TableCell>{trade.size}</TableCell>
                      <TableCell>
                        {trade.pnl !== null ? (
                          <span className={trade.pnl > 0 ? "text-profit" : "text-loss"}>
                            {trade.pnl > 0 ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{trade.date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Trade</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="mr-2 h-4 w-4" />
                                Add Tags
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRows.includes(trade.id) && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={10} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Trade Details</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">Direction:</div>
                                <div>{trade.type}</div>
                                <div className="text-muted-foreground">R:R Ratio:</div>
                                <div>{trade.riskReward?.toFixed(2) || "-"}</div>
                                <div className="text-muted-foreground">Duration:</div>
                                <div>{trade.duration || "-"}</div>
                                <div className="text-muted-foreground">Commission:</div>
                                <div>${trade.commission?.toFixed(2) || "0.00"}</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Performance</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">P&L:</div>
                                <div
                                  className={trade.pnl !== null ? (trade.pnl > 0 ? "text-profit" : "text-loss") : ""}
                                >
                                  {trade.pnl !== null
                                    ? `${trade.pnl > 0 ? "+" : ""}$${Math.abs(trade.pnl).toFixed(2)}`
                                    : "-"}
                                </div>
                                <div className="text-muted-foreground">P&L %:</div>
                                <div
                                  className={
                                    trade.pnlPercent !== null
                                      ? trade.pnlPercent > 0
                                        ? "text-profit"
                                        : "text-loss"
                                      : ""
                                  }
                                >
                                  {trade.pnlPercent !== null
                                    ? `${trade.pnlPercent > 0 ? "+" : ""}${trade.pnlPercent.toFixed(2)}%`
                                    : "-"}
                                </div>
                                <div className="text-muted-foreground">MAE:</div>
                                <div>{trade.mae ? `${trade.mae}%` : "-"}</div>
                                <div className="text-muted-foreground">MFE:</div>
                                <div>{trade.mfe ? `${trade.mfe}%` : "-"}</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Tags</h4>
                              <div className="flex flex-wrap gap-1">
                                {trade.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              {trade.notes && (
                                <>
                                  <h4 className="text-sm font-medium mt-3">Notes</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-3">{trade.notes}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// Mock data for trades
const mockTrades = [
  {
    id: "1",
    symbol: "AAPL",
    type: "Long",
    entry: 175.23,
    exit: 182.67,
    size: 100,
    pnl: 744.0,
    pnlPercent: 4.25,
    date: "2023-12-15",
    time: "10:45 AM",
    duration: "2h 15m",
    setup: "Breakout",
    tags: ["Gap Up", "High Volume", "Earnings"],
    notes: "Strong momentum after earnings beat. Entered on breakout of previous day's high with increased volume.",
    commission: 9.99,
    riskReward: 3.2,
    mae: -0.8,
    mfe: 4.5,
  },
  {
    id: "2",
    symbol: "MSFT",
    type: "Long",
    entry: 340.12,
    exit: 352.45,
    size: 50,
    pnl: 616.5,
    pnlPercent: 3.62,
    date: "2023-12-14",
    time: "9:30 AM",
    duration: "4h 45m",
    setup: "Pullback",
    tags: ["Trend Continuation", "Support Bounce"],
    notes: "Entered on pullback to 20 EMA with bullish engulfing candle. Strong sector performance.",
    commission: 7.5,
    riskReward: 2.8,
    mae: -1.2,
    mfe: 3.9,
  },
  {
    id: "3",
    symbol: "TSLA",
    type: "Short",
    entry: 245.67,
    exit: 238.21,
    size: 75,
    pnl: 559.5,
    pnlPercent: 3.04,
    date: "2023-12-13",
    time: "3:15 PM",
    duration: "1d 2h",
    setup: "Reversal",
    tags: ["Overbought", "Resistance", "Double Top"],
    notes: "Shorted at double top resistance with bearish divergence on RSI. Volume confirmed the reversal.",
    commission: 8.25,
    riskReward: 2.5,
    mae: -1.5,
    mfe: 3.5,
  },
  {
    id: "4",
    symbol: "NVDA",
    type: "Long",
    entry: 465.23,
    exit: 452.1,
    size: 25,
    pnl: -328.25,
    pnlPercent: -2.82,
    date: "2023-12-12",
    time: "11:20 AM",
    duration: "3h 10m",
    setup: "Breakout",
    tags: ["Failed Breakout", "High Volume"],
    notes: "Entered on breakout but price quickly reversed. Should have waited for confirmation.",
    commission: 6.75,
    riskReward: 2.2,
    mae: -3.1,
    mfe: 0.5,
  },
  {
    id: "5",
    symbol: "META",
    type: "Short",
    entry: 320.45,
    exit: 315.2,
    size: 40,
    pnl: 210.0,
    pnlPercent: 1.64,
    date: "2023-12-11",
    time: "2:30 PM",
    duration: "1d 4h",
    setup: "Reversal",
    tags: ["Double Top", "Bearish Engulfing"],
    notes: "Shorted at key resistance level with bearish engulfing pattern. Good risk management.",
    commission: 7.2,
    riskReward: 1.8,
    mae: -0.9,
    mfe: 2.1,
  },
  {
    id: "6",
    symbol: "AMZN",
    type: "Long",
    entry: 145.78,
    exit: null,
    size: 100,
    pnl: null,
    pnlPercent: null,
    date: "2023-12-16",
    time: "9:45 AM",
    duration: null,
    setup: "Support Bounce",
    tags: ["Oversold", "Support", "Active"],
    notes: "Entered at key support level with bullish hammer candle. Watching for continuation.",
    commission: 9.99,
    riskReward: null,
    mae: null,
    mfe: null,
  },
]
