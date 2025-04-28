"use client"

import { useState } from "react"
import { CirclePlus, Plus, Trash } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"

// Mock data for rule components
const ruleComponents = [
  {
    category: "Price Action",
    items: [
      { id: "pa-1", name: "Candle Pattern", description: "Check for specific candle patterns" },
      { id: "pa-2", name: "Support/Resistance", description: "Check price relative to support/resistance levels" },
      { id: "pa-3", name: "Price Breakout", description: "Check if price breaks above/below a level" },
      { id: "pa-4", name: "Inside Bar", description: "Check for inside bar pattern" },
      { id: "pa-5", name: "Outside Bar", description: "Check for outside bar pattern" },
    ],
  },
  {
    category: "Indicators",
    items: [
      { id: "ind-1", name: "Moving Average", description: "Check price relative to moving average" },
      { id: "ind-2", name: "RSI", description: "Check RSI conditions" },
      { id: "ind-3", name: "MACD", description: "Check MACD conditions" },
      { id: "ind-4", name: "Bollinger Bands", description: "Check price relative to Bollinger Bands" },
      { id: "ind-5", name: "Volume", description: "Check volume conditions" },
    ],
  },
  {
    category: "Time-Based",
    items: [
      { id: "time-1", name: "Time of Day", description: "Check specific time of day" },
      { id: "time-2", name: "Day of Week", description: "Check specific day of week" },
      { id: "time-3", name: "Market Session", description: "Check specific market session" },
      { id: "time-4", name: "Before/After Event", description: "Check time relative to market events" },
    ],
  },
]

interface Rule {
  id: string
  type: string
  name: string
  condition: string
  value: string
  isRequired: boolean
}

export function VisualRuleBuilder() {
  const [activeTab, setActiveTab] = useState("entry")
  const [entryRules, setEntryRules] = useState<Rule[]>([
    {
      id: "rule-1",
      type: "Price Action",
      name: "Price Breakout",
      condition: "breaks above",
      value: "resistance level",
      isRequired: true,
    },
    {
      id: "rule-2",
      type: "Indicators",
      name: "Volume",
      condition: "is greater than",
      value: "1.5x average",
      isRequired: true,
    },
  ])
  const [exitRules, setExitRules] = useState<Rule[]>([
    {
      id: "rule-3",
      type: "Price Action",
      name: "Take Profit",
      condition: "reaches",
      value: "next resistance level",
      isRequired: false,
    },
    {
      id: "rule-4",
      type: "Indicators",
      name: "RSI",
      condition: "crosses above",
      value: "70",
      isRequired: false,
    },
  ])

  const addRule = (ruleType: "entry" | "exit") => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      type: "Price Action",
      name: "New Rule",
      condition: "is",
      value: "",
      isRequired: false,
    }

    if (ruleType === "entry") {
      setEntryRules([...entryRules, newRule])
    } else {
      setExitRules([...exitRules, newRule])
    }
  }

  const removeRule = (ruleType: "entry" | "exit", id: string) => {
    if (ruleType === "entry") {
      setEntryRules(entryRules.filter((rule) => rule.id !== id))
    } else {
      setExitRules(exitRules.filter((rule) => rule.id !== id))
    }
  }

  const toggleRequired = (ruleType: "entry" | "exit", id: string) => {
    if (ruleType === "entry") {
      setEntryRules(entryRules.map((rule) => (rule.id === id ? { ...rule, isRequired: !rule.isRequired } : rule)))
    } else {
      setExitRules(exitRules.map((rule) => (rule.id === id ? { ...rule, isRequired: !rule.isRequired } : rule)))
    }
  }

  const updateRule = (ruleType: "entry" | "exit", id: string, field: keyof Rule, value: string) => {
    if (ruleType === "entry") {
      setEntryRules(entryRules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
    } else {
      setExitRules(exitRules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry">Entry Rules</TabsTrigger>
          <TabsTrigger value="exit">Exit Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Entry Rules</h3>
            <Button variant="outline" size="sm" onClick={() => addRule("entry")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {entryRules.map((rule) => (
              <GlassCard key={rule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Badge variant={rule.isRequired ? "default" : "outline"} className="text-xs">
                        {rule.isRequired ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor={`rule-type-${rule.id}`}>Rule Type</Label>
                          <Select
                            value={rule.type}
                            onValueChange={(value) => updateRule("entry", rule.id, "type", value)}
                          >
                            <SelectTrigger id={`rule-type-${rule.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Price Action">Price Action</SelectItem>
                              <SelectItem value="Indicators">Indicators</SelectItem>
                              <SelectItem value="Time-Based">Time-Based</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-name-${rule.id}`}>Rule Name</Label>
                          <Select
                            value={rule.name}
                            onValueChange={(value) => updateRule("entry", rule.id, "name", value)}
                          >
                            <SelectTrigger id={`rule-name-${rule.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ruleComponents
                                .find((category) => category.category === rule.type)
                                ?.items.map((item) => (
                                  <SelectItem key={item.id} value={item.name}>
                                    {item.name}
                                  </SelectItem>
                                )) || <SelectItem value="Custom">Custom</SelectItem>}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-condition-${rule.id}`}>Condition</Label>
                          <Select
                            value={rule.condition}
                            onValueChange={(value) => updateRule("entry", rule.id, "condition", value)}
                          >
                            <SelectTrigger id={`rule-condition-${rule.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="is">is</SelectItem>
                              <SelectItem value="is not">is not</SelectItem>
                              <SelectItem value="greater than">greater than</SelectItem>
                              <SelectItem value="less than">less than</SelectItem>
                              <SelectItem value="crosses above">crosses above</SelectItem>
                              <SelectItem value="crosses below">crosses below</SelectItem>
                              <SelectItem value="breaks above">breaks above</SelectItem>
                              <SelectItem value="breaks below">breaks below</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-value-${rule.id}`}>Value</Label>
                          <Input
                            id={`rule-value-${rule.id}`}
                            value={rule.value}
                            onChange={(e) => updateRule("entry", rule.id, "value", e.target.value)}
                            placeholder="Enter value"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id={`rule-required-${rule.id}`}
                          checked={rule.isRequired}
                          onCheckedChange={() => toggleRequired("entry", rule.id)}
                        />
                        <Label htmlFor={`rule-required-${rule.id}`}>Required Rule</Label>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRule("entry", rule.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-4">
            <h4 className="mb-4 font-medium">Rule Logic Preview</h4>
            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2">
                {entryRules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    {index > 0 && (
                      <div className="flex h-6 items-center text-muted-foreground">
                        <span className="px-2">AND</span>
                      </div>
                    )}
                    <div className="rounded-md bg-background px-3 py-1.5 text-sm">
                      <span className="font-medium">{rule.name}</span>{" "}
                      <span className="text-muted-foreground">{rule.condition}</span>{" "}
                      <span className="font-medium">{rule.value}</span>
                    </div>
                    {rule.isRequired && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Test Rules</Button>
            <Button>Save Rules</Button>
          </div>
        </TabsContent>

        <TabsContent value="exit" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Exit Rules</h3>
            <Button variant="outline" size="sm" onClick={() => addRule("exit")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {exitRules.map((rule) => (
              <GlassCard key={rule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Badge variant={rule.isRequired ? "default" : "outline"} className="text-xs">
                        {rule.isRequired ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor={`rule-type-${rule.id}`}>Rule Type</Label>
                          <Select
                            value={rule.type}
                            onValueChange={(value) => updateRule("exit", rule.id, "type", value)}
                          >
                            <SelectTrigger id={`rule-type-${rule.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Price Action">Price Action</SelectItem>
                              <SelectItem value="Indicators">Indicators</SelectItem>
                              <SelectItem value="Time-Based">Time-Based</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-name-${rule.id}`}>Rule Name</Label>
                          <Select
                            value={rule.name}
                            onValueChange={(value) => updateRule("exit", rule.id, "name", value)}
                          >
                            <SelectTrigger id={`rule-name-${rule.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ruleComponents
                                .find((category) => category.category === rule.type)
                                ?.items.map((item) => (
                                  <SelectItem key={item.id} value={item.name}>
                                    {item.name}
                                  </SelectItem>
                                )) || <SelectItem value="Custom">Custom</SelectItem>}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-condition-${rule.id}`}>Condition</Label>
                          <Select
                            value={rule.condition}
                            onValueChange={(value) => updateRule("exit", rule.id, "condition", value)}
                          >
                            <SelectTrigger id={`rule-condition-${rule.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="is">is</SelectItem>
                              <SelectItem value="is not">is not</SelectItem>
                              <SelectItem value="greater than">greater than</SelectItem>
                              <SelectItem value="less than">less than</SelectItem>
                              <SelectItem value="crosses above">crosses above</SelectItem>
                              <SelectItem value="crosses below">crosses below</SelectItem>
                              <SelectItem value="reaches">reaches</SelectItem>
                              <SelectItem value="fails to reach">fails to reach</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-value-${rule.id}`}>Value</Label>
                          <Input
                            id={`rule-value-${rule.id}`}
                            value={rule.value}
                            onChange={(e) => updateRule("exit", rule.id, "value", e.target.value)}
                            placeholder="Enter value"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id={`rule-required-${rule.id}`}
                          checked={rule.isRequired}
                          onCheckedChange={() => toggleRequired("exit", rule.id)}
                        />
                        <Label htmlFor={`rule-required-${rule.id}`}>Required Rule</Label>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRule("exit", rule.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-4">
            <h4 className="mb-4 font-medium">Rule Logic Preview</h4>
            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2">
                {exitRules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    {index > 0 && (
                      <div className="flex h-6 items-center text-muted-foreground">
                        <span className="px-2">OR</span>
                      </div>
                    )}
                    <div className="rounded-md bg-background px-3 py-1.5 text-sm">
                      <span className="font-medium">{rule.name}</span>{" "}
                      <span className="text-muted-foreground">{rule.condition}</span>{" "}
                      <span className="font-medium">{rule.value}</span>
                    </div>
                    {rule.isRequired && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Test Rules</Button>
            <Button>Save Rules</Button>
          </div>
        </TabsContent>
      </Tabs>

      <GlassCard className="p-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="components">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <CirclePlus className="h-4 w-4" />
                <span>Available Rule Components</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-4 space-y-4">
                {ruleComponents.map((category) => (
                  <div key={category.category}>
                    <h4 className="mb-2 font-medium">{category.category}</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {category.items.map((item) => (
                        <GlassCard key={item.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{item.name}</h5>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </GlassCard>
    </div>
  )
}
