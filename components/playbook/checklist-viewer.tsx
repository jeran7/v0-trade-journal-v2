"use client"

import { useState } from "react"
import { CheckCircle, Circle, Copy, Edit, ListChecks } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ChecklistItem {
  id: string
  text: string
  isRequired: boolean
}

interface Checklist {
  preTrade: ChecklistItem[]
  duringTrade: ChecklistItem[]
  postTrade: ChecklistItem[]
}

interface ChecklistViewerProps {
  checklist: Checklist
}

export function ChecklistViewer({ checklist }: ChecklistViewerProps) {
  const [activeTab, setActiveTab] = useState("pre")
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) => {
    setChecklistItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const resetChecklist = () => {
    setChecklistItems({})
  }

  const copyChecklist = () => {
    // In a real app, this would copy the checklist to clipboard
    alert("Checklist copied to clipboard!")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-medium">Trading Checklist</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetChecklist}>
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={copyChecklist}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pre">Pre-Trade</TabsTrigger>
          <TabsTrigger value="during">During Trade</TabsTrigger>
          <TabsTrigger value="post">Post-Trade</TabsTrigger>
        </TabsList>

        <TabsContent value="pre" className="mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Pre-Trade Checklist</h3>
            </div>
            <div className="space-y-3">
              {checklist.preTrade.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/10 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="mt-0.5">
                    {checklistItems[item.id] ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`${checklistItems[item.id] ? "line-through opacity-70" : ""}`}>{item.text}</div>
                    {item.isRequired && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-muted-foreground">
              <div>
                {checklist.preTrade.filter((item) => checklistItems[item.id]).length} of {checklist.preTrade.length}{" "}
                completed
              </div>
              <div>{checklist.preTrade.filter((item) => item.isRequired).length} required items</div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="during" className="mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-primary" />
              <h3 className="font-medium">During Trade Checklist</h3>
            </div>
            <div className="space-y-3">
              {checklist.duringTrade.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/10 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="mt-0.5">
                    {checklistItems[item.id] ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`${checklistItems[item.id] ? "line-through opacity-70" : ""}`}>{item.text}</div>
                    {item.isRequired && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-muted-foreground">
              <div>
                {checklist.duringTrade.filter((item) => checklistItems[item.id]).length} of{" "}
                {checklist.duringTrade.length} completed
              </div>
              <div>{checklist.duringTrade.filter((item) => item.isRequired).length} required items</div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="post" className="mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Post-Trade Checklist</h3>
            </div>
            <div className="space-y-3">
              {checklist.postTrade.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/10 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="mt-0.5">
                    {checklistItems[item.id] ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`${checklistItems[item.id] ? "line-through opacity-70" : ""}`}>{item.text}</div>
                    {item.isRequired && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-muted-foreground">
              <div>
                {checklist.postTrade.filter((item) => checklistItems[item.id]).length} of {checklist.postTrade.length}{" "}
                completed
              </div>
              <div>{checklist.postTrade.filter((item) => item.isRequired).length} required items</div>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
