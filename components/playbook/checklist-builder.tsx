"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, CirclePlus, FlipVerticalIcon as DragVertical, Edit, Save, Trash } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ChecklistItem {
  id: string
  text: string
  isRequired: boolean
  isEditing?: boolean
}

export function ChecklistBuilder() {
  const [activeTab, setActiveTab] = useState("pre")
  const [preTrade, setPreTrade] = useState<ChecklistItem[]>([
    { id: "pre-1", text: "Identified clear support/resistance level", isRequired: true },
    { id: "pre-2", text: "Confirmed overall market direction", isRequired: true },
    { id: "pre-3", text: "Checked economic calendar for potential market-moving events", isRequired: true },
    { id: "pre-4", text: "Determined position size based on account risk parameters", isRequired: true },
  ])
  const [duringTrade, setDuringTrade] = useState<ChecklistItem[]>([
    { id: "during-1", text: "Confirmed volume increase on breakout", isRequired: true },
    { id: "during-2", text: "Entered only after candle close beyond level", isRequired: true },
    { id: "during-3", text: "Placed stop loss at predetermined level", isRequired: true },
  ])
  const [postTrade, setPostTrade] = useState<ChecklistItem[]>([
    { id: "post-1", text: "Followed exit rules without emotion", isRequired: true },
    { id: "post-2", text: "Documented trade outcome", isRequired: true },
    { id: "post-3", text: "Reviewed trade execution against plan", isRequired: true },
  ])

  const addItem = (section: "pre" | "during" | "post") => {
    const newItem: ChecklistItem = {
      id: `${section}-${Date.now()}`,
      text: "",
      isRequired: false,
      isEditing: true,
    }

    if (section === "pre") {
      setPreTrade([...preTrade, newItem])
    } else if (section === "during") {
      setDuringTrade([...duringTrade, newItem])
    } else {
      setPostTrade([...postTrade, newItem])
    }
  }

  const removeItem = (section: "pre" | "during" | "post", id: string) => {
    if (section === "pre") {
      setPreTrade(preTrade.filter((item) => item.id !== id))
    } else if (section === "during") {
      setDuringTrade(duringTrade.filter((item) => item.id !== id))
    } else {
      setPostTrade(postTrade.filter((item) => item.id !== id))
    }
  }

  const toggleRequired = (section: "pre" | "during" | "post", id: string) => {
    if (section === "pre") {
      setPreTrade(preTrade.map((item) => (item.id === id ? { ...item, isRequired: !item.isRequired } : item)))
    } else if (section === "during") {
      setDuringTrade(duringTrade.map((item) => (item.id === id ? { ...item, isRequired: !item.isRequired } : item)))
    } else {
      setPostTrade(postTrade.map((item) => (item.id === id ? { ...item, isRequired: !item.isRequired } : item)))
    }
  }

  const toggleEditing = (section: "pre" | "during" | "post", id: string) => {
    if (section === "pre") {
      setPreTrade(preTrade.map((item) => (item.id === id ? { ...item, isEditing: !item.isEditing } : item)))
    } else if (section === "during") {
      setDuringTrade(duringTrade.map((item) => (item.id === id ? { ...item, isEditing: !item.isEditing } : item)))
    } else {
      setPostTrade(postTrade.map((item) => (item.id === id ? { ...item, isEditing: !item.isEditing } : item)))
    }
  }

  const updateItemText = (section: "pre" | "during" | "post", id: string, text: string) => {
    if (section === "pre") {
      setPreTrade(preTrade.map((item) => (item.id === id ? { ...item, text } : item)))
    } else if (section === "during") {
      setDuringTrade(duringTrade.map((item) => (item.id === id ? { ...item, text } : item)))
    } else {
      setPostTrade(postTrade.map((item) => (item.id === id ? { ...item, text } : item)))
    }
  }

  const moveItem = (section: "pre" | "during" | "post", id: string, direction: "up" | "down") => {
    let items: ChecklistItem[] = []
    if (section === "pre") {
      items = [...preTrade]
    } else if (section === "during") {
      items = [...duringTrade]
    } else {
      items = [...postTrade]
    }

    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return

    if (direction === "up" && index > 0) {
      const temp = items[index]
      items[index] = items[index - 1]
      items[index - 1] = temp
    } else if (direction === "down" && index < items.length - 1) {
      const temp = items[index]
      items[index] = items[index + 1]
      items[index + 1] = temp
    }

    if (section === "pre") {
      setPreTrade([...items])
    } else if (section === "during") {
      setDuringTrade([...items])
    } else {
      setPostTrade([...items])
    }
  }

  return (
    <GlassCard className="relative">
      <Tabs defaultValue="pre" className="w-full">
        <TabsList>
          <TabsTrigger value="pre" onClick={() => setActiveTab("pre")}>
            Pre-Trade
          </TabsTrigger>
          <TabsTrigger value="during" onClick={() => setActiveTab("during")}>
            During Trade
          </TabsTrigger>
          <TabsTrigger value="post" onClick={() => setActiveTab("post")}>
            Post-Trade
          </TabsTrigger>
        </TabsList>
        <div className="absolute top-2 right-2">
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Checklist
          </Button>
        </div>
        <TabsContent value="pre">
          <ChecklistSection
            section="pre"
            items={preTrade}
            addItem={addItem}
            removeItem={removeItem}
            toggleRequired={toggleRequired}
            toggleEditing={toggleEditing}
            updateItemText={updateItemText}
            moveItem={moveItem}
          />
        </TabsContent>
        <TabsContent value="during">
          <ChecklistSection
            section="during"
            items={duringTrade}
            addItem={addItem}
            removeItem={removeItem}
            toggleRequired={toggleRequired}
            toggleEditing={toggleEditing}
            updateItemText={updateItemText}
            moveItem={moveItem}
          />
        </TabsContent>
        <TabsContent value="post">
          <ChecklistSection
            section="post"
            items={postTrade}
            addItem={addItem}
            removeItem={removeItem}
            toggleRequired={toggleRequired}
            toggleEditing={toggleEditing}
            updateItemText={updateItemText}
            moveItem={moveItem}
          />
        </TabsContent>
      </Tabs>
    </GlassCard>
  )
}

interface ChecklistSectionProps {
  section: "pre" | "during" | "post"
  items: ChecklistItem[]
  addItem: (section: "pre" | "during" | "post") => void
  removeItem: (section: "pre" | "during" | "post", id: string) => void
  toggleRequired: (section: "pre" | "during" | "post", id: string) => void
  toggleEditing: (section: "pre" | "during" | "post", id: string) => void
  updateItemText: (section: "pre" | "during" | "post", id: string, text: string) => void
  moveItem: (section: "pre" | "during" | "post", id: string, direction: "up" | "down") => void
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  section,
  items,
  addItem,
  removeItem,
  toggleRequired,
  toggleEditing,
  updateItemText,
  moveItem,
}) => {
  return (
    <Accordion type="single" collapsible>
      {items.map((item, index) => (
        <AccordionItem value={item.id} key={item.id}>
          <AccordionTrigger>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <DragVertical className="mr-2 h-4 w-4 cursor-grab" />
                {item.isEditing ? (
                  <Input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateItemText(section, item.id, e.target.value)}
                    onBlur={() => toggleEditing(section, item.id)}
                    autoFocus
                    className="w-64"
                  />
                ) : (
                  <span className="mr-2">{item.text}</span>
                )}
                {item.isRequired && <Badge variant="secondary">Required</Badge>}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 peer-data-[state=expanded]:rotate-180" />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label htmlFor={`required-${item.id}`} className="mr-2 text-sm">
                  Required
                </Label>
                <Switch
                  id={`required-${item.id}`}
                  checked={item.isRequired}
                  onCheckedChange={() => toggleRequired(section, item.id)}
                />
                {!item.isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => toggleEditing(section, item.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(section, item.id, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Move Up
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(section, item.id, "down")}
                  disabled={index === items.length - 1}
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Move Down
                </Button>
                <Button variant="destructive" size="sm" onClick={() => removeItem(section, item.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
      <Button variant="outline" className="w-full justify-start" onClick={() => addItem(section)}>
        <CirclePlus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </Accordion>
  )
}
