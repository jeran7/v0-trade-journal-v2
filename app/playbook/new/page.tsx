"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Save, BarChart2, CheckCircle2, AlertCircle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { SetupDocumentation } from "@/components/playbook/setup-documentation"
import { RiskCalculator } from "@/components/playbook/risk-calculator"
import { ChecklistBuilder } from "@/components/playbook/checklist-builder"

export default function NewStrategyPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [marketCondition, setMarketCondition] = useState("")
  const [timeframes, setTimeframes] = useState<string[]>([])
  const [tags, setTags] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [tagInput, setTagInput] = useState("")
  const [tagsList, setTagsList] = useState<string[]>([])

  useEffect(() => {
    setIsClient(true)

    // Simulate page load animation
    const timeout = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)

    return () => clearTimeout(timeout)
  }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !tagsList.includes(tagInput.trim())) {
      setTagsList([...tagsList, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTagsList(tagsList.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real app, this would save to a database
    console.log({
      name,
      description,
      category,
      marketCondition,
      timeframes,
      tags: tagsList,
      isActive,
    })

    setIsSaving(false)

    // Navigate to strategy list
    router.push("/playbook")
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/playbook">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to playbook</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
              Create New Strategy
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Strategy
                </>
              )}
            </Button>
          </div>
        </div>

        <GlassCard
          className="p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Strategy Name</Label>
                <Input
                  id="name"
                  placeholder="Enter a name for your strategy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="reversal">Reversal</SelectItem>
                    <SelectItem value="trend">Trend Following</SelectItem>
                    <SelectItem value="range">Range Trading</SelectItem>
                    <SelectItem value="breakout">Breakout</SelectItem>
                    <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="market-condition">Primary Market Condition</Label>
                <Select value={marketCondition} onValueChange={setMarketCondition}>
                  <SelectTrigger id="market-condition">
                    <SelectValue placeholder="Select market condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="range-bound">Range-bound</SelectItem>
                    <SelectItem value="volatile">Volatile</SelectItem>
                    <SelectItem value="choppy">Choppy</SelectItem>
                    <SelectItem value="low-volatility">Low Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Timeframes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["1m", "5m", "15m", "30m", "1h", "4h", "Daily", "Weekly"].map((tf) => (
                    <Badge
                      key={tf}
                      variant={timeframes.includes(tf) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        timeframes.includes(tf)
                          ? "bg-blue-500/30 hover:bg-blue-500/40 text-blue-200"
                          : "bg-transparent hover:bg-white/10"
                      }`}
                      onClick={() => {
                        if (timeframes.includes(tf)) {
                          setTimeframes(timeframes.filter((t) => t !== tf))
                        } else {
                          setTimeframes([...timeframes, tf])
                        }
                      }}
                    >
                      {tf}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tagsList.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/20 flex items-center gap-1"
                    >
                      {tag}
                      <button className="ml-1 text-white/50 hover:text-white" onClick={() => handleRemoveTag(tag)}>
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="active-status" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active-status">Active Strategy</Label>
                </div>
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={isActive ? "bg-green-500/20 text-green-400" : ""}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your trading strategy"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </GlassCard>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="setup">
              <BarChart2 className="mr-2 h-4 w-4" />
              Setup Documentation
            </TabsTrigger>
            <TabsTrigger value="risk">
              <AlertCircle className="mr-2 h-4 w-4" />
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Checklists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-medium mb-4">Strategy Overview</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="objective">Strategy Objective</Label>
                  <Textarea id="objective" placeholder="What is the primary goal of this strategy?" rows={2} />
                </div>

                <div>
                  <Label htmlFor="edge">Trading Edge</Label>
                  <Textarea id="edge" placeholder="What gives this strategy an edge in the market?" rows={2} />
                </div>

                <div>
                  <Label htmlFor="instruments">Tradable Instruments</Label>
                  <Input
                    id="instruments"
                    placeholder="Which instruments work best with this strategy? (e.g., Stocks, Futures, Forex)"
                  />
                </div>

                <div>
                  <Label>Expected Performance</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <Label htmlFor="win-rate" className="text-sm">
                        Target Win Rate (%)
                      </Label>
                      <Input id="win-rate" type="number" min="0" max="100" placeholder="e.g., 60" />
                    </div>
                    <div>
                      <Label htmlFor="profit-factor" className="text-sm">
                        Target Profit Factor
                      </Label>
                      <Input id="profit-factor" type="number" min="0" step="0.1" placeholder="e.g., 2.0" />
                    </div>
                    <div>
                      <Label htmlFor="avg-rr" className="text-sm">
                        Average R:R
                      </Label>
                      <Input id="avg-rr" type="number" min="0" step="0.1" placeholder="e.g., 1.5" />
                    </div>
                    <div>
                      <Label htmlFor="max-drawdown" className="text-sm">
                        Max Drawdown (%)
                      </Label>
                      <Input id="max-drawdown" type="number" min="0" max="100" placeholder="e.g., 15" />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="setup" className="mt-6">
            <SetupDocumentation />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <RiskCalculator />
          </TabsContent>

          <TabsContent value="checklist" className="mt-6">
            <ChecklistBuilder />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
