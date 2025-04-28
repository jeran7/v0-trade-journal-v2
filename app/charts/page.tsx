"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/navigation/header"
import { Sidebar } from "@/components/navigation/sidebar"
import { AdvancedChart } from "@/components/charts/advanced-chart"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAvailableSymbols } from "@/lib/supabase/price-data-service"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/supabase/auth-context"

export default function ChartsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [symbol, setSymbol] = useState("AAPL")
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available symbols
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const symbols = await getAvailableSymbols()
        setAvailableSymbols(symbols.length > 0 ? symbols : ["AAPL", "MSFT", "GOOGL", "AMZN", "META"])
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching symbols:", err)
        setAvailableSymbols(["AAPL", "MSFT", "GOOGL", "AMZN", "META"])
        setIsLoading(false)
      }
    }

    fetchSymbols()
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol.toUpperCase())
  }

  // Mock trade markers for demo
  const tradeMarkers = [
    {
      time: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 5,
      position: "belowBar" as const,
      color: "#4CAF50",
      shape: "arrow" as const,
      text: "Buy",
      id: "trade-1",
    },
    {
      time: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 2,
      position: "aboveBar" as const,
      color: "#F44336",
      shape: "arrow" as const,
      text: "Sell",
      id: "trade-2",
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Advanced Chart Analysis</h1>

            <div className="mb-6">
              <GlassCard className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                  <div className="w-full md:w-auto">
                    <Label htmlFor="symbol">Symbol</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="symbol"
                        value={symbol}
                        onChange={(e) => handleSymbolChange(e.target.value)}
                        className="w-32"
                      />
                      <Button
                        variant="default"
                        onClick={() => {
                          if (!availableSymbols.includes(symbol)) {
                            toast({
                              title: "Symbol not available",
                              description: "Please select from the available symbols",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        Load
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSymbols.slice(0, 5).map((sym) => (
                      <Button
                        key={sym}
                        variant={symbol === sym ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSymbolChange(sym)}
                      >
                        {sym}
                      </Button>
                    ))}
                  </div>

                  {!user && (
                    <div className="ml-auto text-sm text-muted-foreground">
                      <span>Sign in to save preferences</span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="single">Single Chart</TabsTrigger>
                <TabsTrigger value="multi">Multi-Timeframe</TabsTrigger>
                <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <AdvancedChart
                  symbol={symbol}
                  initialTimeframe="1D"
                  tradeMarkers={tradeMarkers}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={toggleFullscreen}
                />
              </TabsContent>

              <TabsContent value="multi">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdvancedChart symbol={symbol} initialTimeframe="1D" height={400} showTabs={false} />
                  <AdvancedChart symbol={symbol} initialTimeframe="1h" height={400} showTabs={false} />
                  <AdvancedChart symbol={symbol} initialTimeframe="15m" height={400} showTabs={false} />
                  <AdvancedChart symbol={symbol} initialTimeframe="5m" height={400} showTabs={false} />
                </div>
              </TabsContent>

              <TabsContent value="trades">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AdvancedChart symbol={symbol} initialTimeframe="1h" tradeMarkers={tradeMarkers} />
                  </div>

                  <div className="space-y-4">
                    <GlassCard className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Trade Details</h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Entry</h4>
                          <p className="text-lg">${(Math.random() * 100 + 100).toFixed(2)}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Exit</h4>
                          <p className="text-lg">${(Math.random() * 100 + 110).toFixed(2)}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Profit/Loss</h4>
                          <p className="text-lg text-green-500">+${(Math.random() * 10 + 5).toFixed(2)}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Strategy</h4>
                          <p className="text-lg">Breakout</p>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Trade Notes</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Entered on breakout above resistance with increased volume. Took profit at target level.
                      </p>

                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          View Full Trade Details
                        </Button>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Similar Patterns</h3>

                      <div className="space-y-2">
                        <div className="p-2 rounded-md border border-border hover:bg-card/50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>Breakout Pattern #1</span>
                            <span className="text-xs text-muted-foreground">85% match</span>
                          </div>
                        </div>

                        <div className="p-2 rounded-md border border-border hover:bg-card/50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>Breakout Pattern #2</span>
                            <span className="text-xs text-muted-foreground">72% match</span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
