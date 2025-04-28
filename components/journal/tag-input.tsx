"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TagInputProps {
  initialTags?: string[]
  onChange?: (tags: string[]) => void
  className?: string
  disabled?: boolean
  placeholder?: string
  maxTags?: number
}

export function TagInput({
  initialTags = [],
  onChange,
  className,
  disabled = false,
  placeholder = "Add a tag...",
  maxTags = 10,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialTags && Array.isArray(initialTags)) {
      setTags(initialTags)
    } else {
      setTags([]) // Ensure tags is always an array
    }
  }, [initialTags])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    }

    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().replace(/\s+/g, "-")

    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < maxTags) {
      const newTags = [...tags, normalizedTag]
      setTags(newTags)
      onChange?.(newTags)
      setInputValue("")
    }
  }

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove)
    setTags(newTags)
    onChange?.(newTags)
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={() => {
        if (!disabled && inputRef.current) {
          inputRef.current.focus()
        }
      }}
    >
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1">
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(index)
              }}
              className="rounded-full hover:bg-accent/50 p-0.5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          )}
        </Badge>
      ))}

      {tags.length < maxTags && !disabled && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          disabled={disabled}
        />
      )}
    </div>
  )
}
