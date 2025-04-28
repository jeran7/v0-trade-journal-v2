"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronRight, FileText, Layout, LayoutTemplate } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  sections: {
    title: string
    type: "text" | "checklist" | "rating" | "media"
    placeholder?: string
    options?: string[]
  }[]
}

// Predefined templates
export const journalTemplates: Template[] = [
  {
    id: "pre-market",
    name: "Pre-Market Plan",
    description: "Plan your trading day before the market opens",
    icon: <Layout className="h-6 w-6" />,
    sections: [
      {
        title: "Market Overview",
        type: "text",
        placeholder: "What's happening in the broader market today? Any key news or events?",
      },
      {
        title: "Key Levels to Watch",
        type: "text",
        placeholder: "What price levels are significant today?",
      },
      {
        title: "Watchlist",
        type: "text",
        placeholder: "Which stocks or assets are you watching today and why?",
      },
      {
        title: "Trading Plan",
        type: "text",
        placeholder: "What setups are you looking for? Entry and exit criteria?",
      },
      {
        title: "Risk Management",
        type: "text",
        placeholder: "Position sizing, max loss for the day, etc.",
      },
    ],
  },
  {
    id: "post-trade",
    name: "Post-Trade Reflection",
    description: "Analyze and reflect on a completed trade",
    icon: <FileText className="h-6 w-6" />,
    sections: [
      {
        title: "Trade Summary",
        type: "text",
        placeholder: "Briefly describe the trade (symbol, direction, entry/exit)",
      },
      {
        title: "Trade Rationale",
        type: "text",
        placeholder: "Why did you take this trade? What was your thesis?",
      },
      {
        title: "Execution Analysis",
        type: "text",
        placeholder: "How well did you execute the entry and exit? Any issues?",
      },
      {
        title: "Emotional State",
        type: "text",
        placeholder: "How did you feel during the trade? Any emotional challenges?",
      },
      {
        title: "Lessons Learned",
        type: "text",
        placeholder: "What did you learn from this trade? What would you do differently?",
      },
      {
        title: "Trade Rules Followed",
        type: "checklist",
        options: [
          "Proper position sizing",
          "Waited for confirmation",
          "Stuck to stop loss",
          "Followed trading plan",
          "Managed emotions effectively",
        ],
      },
    ],
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Review your trading performance for the week",
    icon: <LayoutTemplate className="h-6 w-6" />,
    sections: [
      {
        title: "Performance Summary",
        type: "text",
        placeholder: "How did you perform this week? Key metrics and statistics?",
      },
      {
        title: "What Worked Well",
        type: "text",
        placeholder: "Which strategies or approaches were successful?",
      },
      {
        title: "What Didn't Work",
        type: "text",
        placeholder: "Which trades or approaches underperformed? Why?",
      },
      {
        title: "Market Analysis",
        type: "text",
        placeholder: "How did the broader market behave? How did it affect your trading?",
      },
      {
        title: "Goals for Next Week",
        type: "text",
        placeholder: "What specific improvements will you focus on next week?",
      },
    ],
  },
  {
    id: "monthly-review",
    name: "Monthly Performance Assessment",
    description: "Comprehensive review of monthly trading performance",
    icon: <LayoutTemplate className="h-6 w-6" />,
    sections: [
      {
        title: "Performance Metrics",
        type: "text",
        placeholder: "Win rate, profit factor, average R:R, total P&L, etc.",
      },
      {
        title: "Strategy Performance",
        type: "text",
        placeholder: "How did each strategy perform? Any standouts or underperformers?",
      },
      {
        title: "Psychological Assessment",
        type: "text",
        placeholder: "How was your mental state throughout the month? Any patterns?",
      },
      {
        title: "Market Conditions",
        type: "text",
        placeholder: "How did market conditions affect your trading? Were you adaptable?",
      },
      {
        title: "Progress on Goals",
        type: "text",
        placeholder: "Did you meet the goals you set last month? Why or why not?",
      },
      {
        title: "Action Plan",
        type: "text",
        placeholder: "What specific changes will you implement next month?",
      },
    ],
  },
  {
    id: "blank",
    name: "Blank Template",
    description: "Start with a clean slate",
    icon: <FileText className="h-6 w-6" />,
    sections: [
      {
        title: "Notes",
        type: "text",
        placeholder: "Start writing...",
      },
    ],
  },
]

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void
  selectedTemplateId?: string
}

export function TemplateSelector({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedTemplate = selectedTemplateId ? journalTemplates.find((t) => t.id === selectedTemplateId) : undefined

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            <span>{selectedTemplate ? selectedTemplate.name : "Select Template"}</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose a Journal Template</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {journalTemplates.map((template) => (
            <GlassCard
              key={template.id}
              className={cn(
                "flex cursor-pointer items-start gap-4 p-4 transition-all hover:bg-accent/10",
                selectedTemplateId === template.id && "border-primary",
              )}
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/50">
                {template.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="mt-2 text-xs text-muted-foreground">{template.sections.length} sections</div>
              </div>
              {selectedTemplateId === template.id && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
