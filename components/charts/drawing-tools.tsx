"use client"

import { useState } from "react"
import { ChevronDown, Pencil, LineChart, ArrowRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type DrawingToolType =
  | "line"
  | "horizontalLine"
  | "verticalLine"
  | "arrow"
  | "rectangle"
  | "ellipse"
  | "fibonacci"
  | "text"

interface DrawingToolsProps {
  onToolSelect: (tool: DrawingToolType | null) => void
  onClearDrawings: () => void
  className?: string
}

export function DrawingTools({ onToolSelect, onClearDrawings, className }: DrawingToolsProps) {
  const [activeTool, setActiveTool] = useState<DrawingToolType | null>(null)

  const handleToolSelect = (tool: DrawingToolType) => {
    // If the same tool is selected, deselect it
    if (activeTool === tool) {
      setActiveTool(null)
      onToolSelect(null)
    } else {
      setActiveTool(tool)
      onToolSelect(tool)
    }
  }

  const getToolName = (type: DrawingToolType): string => {
    switch (type) {
      case "line":
        return "Trend Line"
      case "horizontalLine":
        return "Horizontal Line"
      case "verticalLine":
        return "Vertical Line"
      case "arrow":
        return "Arrow"
      case "rectangle":
        return "Rectangle"
      case "ellipse":
        return "Ellipse"
      case "fibonacci":
        return "Fibonacci"
      case "text":
        return "Text"
      default:
        return type
    }
  }

  const getToolIcon = (type: DrawingToolType) => {
    switch (type) {
      case "line":
        return <LineChart className="h-4 w-4" />
      case "horizontalLine":
        return <LineChart className="h-4 w-4 rotate-90" />
      case "verticalLine":
        return <LineChart className="h-4 w-4" />
      case "arrow":
        return <ArrowRight className="h-4 w-4" />
      case "rectangle":
        return <div className="h-3 w-4 border border-current" />
      case "ellipse":
        return <div className="h-3 w-4 rounded-full border border-current" />
      case "fibonacci":
        return <div className="text-xs font-mono">Fib</div>
      case "text":
        return <div className="text-xs font-mono">Aa</div>
      default:
        return <Pencil className="h-4 w-4" />
    }
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-1 ${activeTool ? "bg-primary/20" : ""}`}>
            {activeTool ? (
              <>
                {getToolIcon(activeTool)}
                <span className="ml-1">{getToolName(activeTool)}</span>
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                <span className="ml-1">Draw</span>
              </>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 backdrop-blur-xl bg-black/50 border-slate-800">
          <DropdownMenuLabel>Drawing Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {["line", "horizontalLine", "verticalLine", "arrow", "rectangle", "ellipse", "fibonacci", "text"].map(
              (tool) => (
                <DropdownMenuItem
                  key={tool}
                  className={`flex items-center gap-2 cursor-pointer ${activeTool === tool ? "bg-primary/20" : ""}`}
                  onClick={() => handleToolSelect(tool as DrawingToolType)}
                >
                  {getToolIcon(tool as DrawingToolType)}
                  <span>{getToolName(tool as DrawingToolType)}</span>
                </DropdownMenuItem>
              ),
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-destructive hover:text-destructive"
              onClick={onClearDrawings}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Drawings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
