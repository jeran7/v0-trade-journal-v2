"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { seedAllData } from "@/lib/supabase/seed-data"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SeedPage() {
  const { toast } = useToast()
  const [isSeeding, setIsSeeding] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const [progress, setProgress] = useState<{
    symbol: string
    timeframe: string
    current: number
    total: number
    percent: number
  } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState("seed")
  const [existingData, setExistingData] = useState<{
    priceData: number
    preferences: number
    drawings: number
    patterns: number
    templates: number
  } | null>(null)

  const supabase = createClientComponentClient()

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()
  }, [supabase])

  // Check existing data
  useEffect(() => {
    const fetchExistingData = async () => {
      if (isAuthenticated) {
        const { count: priceDataCount } = await supabase.from("price_data").select("*", { count: "exact", head: true })

        const { count: preferencesCount } = await supabase
          .from("chart_preferences")
          .select("*", { count: "exact", head: true })

        const { count: drawingsCount } = await supabase
          .from("chart_drawings")
          .select("*", { count: "exact", head: true })

        const { count: patternsCount } = await supabase
          .from("chart_patterns")
          .select("*", { count: "exact", head: true })

        const { count: templatesCount } = await supabase
          .from("indicator_templates")
          .select("*", { count: "exact", head: true })

        setExistingData({
          priceData: priceDataCount || 0,
          preferences: preferencesCount || 0,
          drawings: drawingsCount || 0,
          patterns: patternsCount || 0,
          templates: templatesCount || 0,
        })
      }
    }

    fetchExistingData()
  }, [isAuthenticated, supabase])

  const handleSeed = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to seed the database",
        variant: "destructive",
      })
      return
    }

    setIsSeeding(true)
    setResults(null)
    setProgress(null)

    try {
      const result = await seedAllData((progressData) => {
        setProgress({
          ...progressData,
          percent: Math.round((progressData.current / progressData.total) * 100),
        })
      })

      setResults(result.results)

      toast({
        title: result.success ? "Success" : "Completed with Errors",
        description: result.success
          ? "Database seeded successfully"
          : "Some errors occurred while seeding the database",
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error seeding database:", error)

      toast({
        title: "Error",
        description: "An error occurred while seeding the database",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
      setProgress(null)

      // Refresh existing data counts
      const { count: priceDataCount } = await supabase.from("price_data").select("*", { count: "exact", head: true })

      const { count: preferencesCount } = await supabase
        .from("chart_preferences")
        .select("*", { count: "exact", head: true })

      const { count: drawingsCount } = await supabase.from("chart_drawings").select("*", { count: "exact", head: true })

      const { count: patternsCount } = await supabase.from("chart_patterns").select("*", { count: "exact", head: true })

      const { count: templatesCount } = await supabase
        .from("indicator_templates")
        .select("*", { count: "exact", head: true })

      setExistingData({
        priceData: priceDataCount || 0,
        preferences: preferencesCount || 0,
        drawings: drawingsCount || 0,
        patterns: patternsCount || 0,
        templates: templatesCount || 0,
      })
    }
  }

  const handleClearData = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to clear the database",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Are you sure you want to clear all chart data? This action cannot be undone.")) {
      return
    }

    setIsSeeding(true)

    try {
      // Clear all tables
      await supabase.from("price_data").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("chart_preferences").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("chart_drawings").delete().neq('  "00000000-0000-0000-0000-000000000000')
      await supabase.from("chart_drawings").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("chart_patterns").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("indicator_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      toast({
        title: "Success",
        description: "All chart data has been cleared",
        variant: "default",
      })

      // Reset existing data counts
      setExistingData({
        priceData: 0,
        preferences: 0,
        drawings: 0,
        patterns: 0,
        templates: 0,
      })
    } catch (error) {
      console.error("Error clearing database:", error)

      toast({
        title: "Error",
        description: "An error occurred while clearing the database",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated === false) {
    return (
      <div className="container mx-auto py-12">
        <GlassCard className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">You must be logged in to access the database seed tool.</p>
            <Button onClick={() => (window.location.href = "/login")}>Log In</Button>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Chart Database Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="seed">Seed Database</TabsTrigger>
          <TabsTrigger value="status">Database Status</TabsTrigger>
          <TabsTrigger value="clear">Clear Data</TabsTrigger>
        </TabsList>

        <TabsContent value="seed">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Seed Chart Data</h2>
            <p className="text-muted-foreground mb-6">
              This tool will populate the database with sample price data, chart preferences, drawings, patterns, and
              indicator templates. This is useful for testing and development purposes.
            </p>

            <div className="space-y-6">
              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Seeding {progress.symbol} ({progress.timeframe})
                    </span>
                    <span>
                      {progress.current} / {progress.total} records
                    </span>
                  </div>
                  <Progress value={progress.percent} />
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button onClick={handleSeed} disabled={isSeeding} className="w-40">
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    "Seed Database"
                  )}
                </Button>
              </div>

              {results && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Results:</h3>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span>
                          {result.type}: {result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>This will seed the following data:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>11 symbols: AAPL, MSFT, GOOGL, AMZN, META, TSLA, NVDA, SPY, QQQ, BTC, ETH</li>
                  <li>7 timeframes: 1m, 5m, 15m, 1h, 4h, 1D, 1W</li>
                  <li>Sample chart preferences, drawings, patterns, and indicator templates</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 text-yellow-500">
                <p className="font-medium">Warning</p>
                <p className="text-sm">
                  This operation will insert a large amount of data into your database. It may take some time to
                  complete and could affect database performance.
                </p>
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="status">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Database Status</h2>
            <p className="text-muted-foreground mb-6">Current status of chart data in the database.</p>

            {existingData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-2">Price Data</h3>
                    <p className="text-3xl font-bold">{existingData.priceData.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Records</p>
                  </div>

                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-2">Chart Preferences</h3>
                    <p className="text-3xl font-bold">{existingData.preferences.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Saved preferences</p>
                  </div>

                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-2">Chart Drawings</h3>
                    <p className="text-3xl font-bold">{existingData.drawings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Saved drawings</p>
                  </div>

                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-2">Chart Patterns</h3>
                    <p className="text-3xl font-bold">{existingData.patterns.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Saved patterns</p>
                  </div>

                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-2">Indicator Templates</h3>
                    <p className="text-3xl font-bold">{existingData.templates.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Saved templates</p>
                  </div>
                </div>

                <Button onClick={() => window.location.reload()} className="mt-4">
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="clear">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Clear Chart Data</h2>
            <p className="text-muted-foreground mb-6">
              This tool will clear all chart data from the database. This action cannot be undone.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button onClick={handleClearData} disabled={isSeeding} variant="destructive" className="w-40">
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    "Clear All Data"
                  )}
                </Button>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 text-red-500">
                <p className="font-medium">Danger</p>
                <p className="text-sm">
                  This operation will delete all chart data from your database. This action cannot be undone. Make sure
                  you have a backup if you need to preserve any data.
                </p>
              </div>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
