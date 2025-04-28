"use client"

import type React from "react"

import { useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Settings,
  Trash,
  Upload,
  X,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { SemanticBadge } from "@/components/ui/semantic-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export function ImportCleanupTools() {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [importedData, setImportedData] = useState<ImportedTrade[] | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDuplicates, setShowDuplicates] = useState(false)

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setUploadedFile(file)

    // Simulate file processing
    setIsProcessing(true)
    setTimeout(() => {
      setImportedData(mockImportedTrades)
      setIsProcessing(false)
      setActiveStep(1)
    }, 1500)
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleFileUpload(file)
      }
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0])
    }
  }

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  // Toggle all rows selection
  const toggleAllSelection = () => {
    if (!importedData) return

    if (selectedRows.length === importedData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(importedData.map((row) => row.id))
    }
  }

  // Filter imported data
  const getFilteredData = () => {
    if (!importedData) return []

    let filtered = [...importedData]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (trade) => trade.symbol.toLowerCase().includes(query) || trade.broker.toLowerCase().includes(query),
      )
    }

    // Filter duplicates if needed
    if (showDuplicates) {
      const symbolDateMap: Record<string, boolean> = {}
      const duplicates: string[] = []

      importedData.forEach((trade) => {
        const key = `${trade.symbol}-${trade.date}-${trade.type}`
        if (symbolDateMap[key]) {
          duplicates.push(trade.id)
        } else {
          symbolDateMap[key] = true
        }
      })

      filtered = filtered.filter((trade) => duplicates.includes(trade.id))
    }

    return filtered
  }

  // Process and import data
  const processAndImport = () => {
    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setActiveStep(2)
    }, 2000)
  }

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Instructions</AlertTitle>
              <AlertDescription>
                Upload a CSV file with your trade data. The file should include columns for Symbol, Date, Type
                (Buy/Sell), Price, Quantity, and optionally Notes.
              </AlertDescription>
            </Alert>

            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                isDragging ? "border-primary bg-accent/20" : "border-border",
                isProcessing && "opacity-50 pointer-events-none",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="flex w-full flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/50">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(2)} KB • CSV File
                    </p>
                  </div>

                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing file...</span>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setUploadedFile(null)}>
                      <X className="mr-2 h-4 w-4" />
                      Remove File
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/50">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="mt-4 font-medium">Drag and drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or</p>
                  <label htmlFor="csv-upload" className="mt-4">
                    <Button variant="outline" className="cursor-pointer" as="span">
                      Browse Files
                    </Button>
                    <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                  </label>
                </>
              )}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Data Cleanup</h3>
                <Badge variant="outline" className="text-xs">
                  {importedData?.length || 0} trades found
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button
                  variant={showDuplicates ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDuplicates(!showDuplicates)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Duplicates
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={importedData && selectedRows.length === importedData.length}
                        onCheckedChange={toggleAllSelection}
                      />
                    </TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredData().map((trade) => (
                    <TableRow key={trade.id} className={trade.issues.length > 0 ? "bg-warning-muted/10" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(trade.id)}
                          onCheckedChange={() => toggleRowSelection(trade.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>{trade.date}</TableCell>
                      <TableCell>{trade.type}</TableCell>
                      <TableCell>${trade.price.toFixed(2)}</TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>{trade.broker}</TableCell>
                      <TableCell>
                        {trade.issues.length > 0 ? (
                          <SemanticBadge type="warning" size="sm">
                            Issues
                          </SemanticBadge>
                        ) : (
                          <SemanticBadge type="success" size="sm">
                            Ready
                          </SemanticBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Collapsible className="rounded-lg border border-border">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Data Issues</h3>
                    <Badge variant="outline" className="text-xs">
                      {importedData?.filter((t) => t.issues.length > 0).length || 0} trades with issues
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 border-t border-border">
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/20 p-4">
                    <h4 className="font-medium mb-2">Common Issues</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span>3 trades with missing exit prices</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span>2 potential duplicate trades</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>5 trades with non-standard time format</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Auto-Fix Issues
                    </Button>
                    <Button variant="outline">
                      <X className="mr-2 h-4 w-4" />
                      Remove Problematic Trades
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setActiveStep(0)}>
                Back
              </Button>
              <Button onClick={processAndImport} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Process and Import
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 mb-6">
              <Check className="h-10 w-10 text-success" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Import Successful!</h2>
            <p className="text-muted-foreground mb-8">
              {importedData?.length || 0} trades have been successfully imported and processed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <Button>View Imported Trades</Button>
              <Button variant="outline">Import More</Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <GlassCard>
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Import & Data Cleanup</h2>
        <p className="text-sm text-muted-foreground">
          Import your trades from CSV files and clean up the data before adding to your journal
        </p>
      </div>

      <div className="p-4">
        <div className="mb-8">
          <div className="relative">
            <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-muted">
              <div
                className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
                style={{ width: `${(activeStep / 2) * 100}%` }}
              />
            </div>

            <div className="relative flex justify-between">
              {["Upload", "Clean", "Complete"].map((step, index) => (
                <div
                  key={step}
                  className="flex flex-col items-center"
                  onClick={() => {
                    if (index < activeStep) {
                      setActiveStep(index)
                    }
                  }}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      index <= activeStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background",
                    )}
                  >
                    {index < activeStep ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                  </div>
                  <span className={cn("mt-2 text-sm", index <= activeStep ? "font-medium" : "text-muted-foreground")}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderStepContent()}
      </div>
    </GlassCard>
  )
}

// Types for imported trades
interface ImportedTrade {
  id: string
  symbol: string
  date: string
  type: string
  price: number
  quantity: number
  broker: string
  issues: string[]
}

// Mock data for imported trades
const mockImportedTrades: ImportedTrade[] = [
  {
    id: "1",
    symbol: "AAPL",
    date: "2023-12-15",
    type: "Buy",
    price: 175.23,
    quantity: 100,
    broker: "TD Ameritrade",
    issues: [],
  },
  {
    id: "2",
    symbol: "MSFT",
    date: "2023-12-14",
    type: "Buy",
    price: 340.12,
    quantity: 50,
    broker: "Interactive Brokers",
    issues: [],
  },
  {
    id: "3",
    symbol: "TSLA",
    date: "2023-12-13",
    type: "Sell",
    price: 245.67,
    quantity: 75,
    broker: "TD Ameritrade",
    issues: ["Missing exit price"],
  },
  {
    id: "4",
    symbol: "NVDA",
    date: "2023-12-12",
    type: "Buy",
    price: 465.23,
    quantity: 25,
    broker: "Robinhood",
    issues: ["Non-standard time format"],
  },
  {
    id: "5",
    symbol: "META",
    date: "2023-12-11",
    type: "Sell",
    price: 320.45,
    quantity: 40,
    broker: "Interactive Brokers",
    issues: [],
  },
  {
    id: "6",
    symbol: "AAPL",
    date: "2023-12-15",
    type: "Buy",
    price: 175.23,
    quantity: 100,
    broker: "Webull",
    issues: ["Potential duplicate"],
  },
]
