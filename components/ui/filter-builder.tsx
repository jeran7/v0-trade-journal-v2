"use client"

import { useState, useEffect } from "react"
import { X, Plus, Filter, Save, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

interface FilterField {
  id: string
  name: string
  type: "text" | "number" | "date" | "select" | "boolean"
  options?: { value: string; label: string }[]
}

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string | number | boolean
}

interface FilterGroup {
  id: string
  logic: "and" | "or"
  conditions: FilterCondition[]
}

interface SavedFilter {
  id: string
  name: string
  description?: string
  groups: FilterGroup[]
}

interface FilterBuilderProps {
  fields: FilterField[]
  onFilterChange: (groups: FilterGroup[]) => void
  savedFilters?: SavedFilter[]
  onSaveFilter?: (filter: Omit<SavedFilter, "id">) => void
  className?: string
}

export function FilterBuilder({
  fields,
  onFilterChange,
  savedFilters = [],
  onSaveFilter,
  className,
}: FilterBuilderProps) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([{ id: "group-1", logic: "and", conditions: [] }])
  const [isExpanded, setIsExpanded] = useState(true)
  const [filterName, setFilterName] = useState("")
  const [filterDescription, setFilterDescription] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Generate a unique ID
  const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`

  // Get operator options based on field type
  const getOperatorOptions = (fieldType: string) => {
    switch (fieldType) {
      case "text":
        return [
          { value: "contains", label: "Contains" },
          { value: "equals", label: "Equals" },
          { value: "startsWith", label: "Starts with" },
          { value: "endsWith", label: "Ends with" },
        ]
      case "number":
        return [
          { value: "equals", label: "Equals" },
          { value: "greaterThan", label: "Greater than" },
          { value: "lessThan", label: "Less than" },
          { value: "between", label: "Between" },
        ]
      case "date":
        return [
          { value: "equals", label: "Equals" },
          { value: "before", label: "Before" },
          { value: "after", label: "After" },
          { value: "between", label: "Between" },
        ]
      case "select":
        return [
          { value: "equals", label: "Equals" },
          { value: "notEquals", label: "Not equals" },
        ]
      case "boolean":
        return [{ value: "equals", label: "Equals" }]
      default:
        return [{ value: "equals", label: "Equals" }]
    }
  }

  // Add a new filter group
  const addFilterGroup = () => {
    const newGroup = { id: generateId("group"), logic: "and" as const, conditions: [] }
    setFilterGroups([...filterGroups, newGroup])
  }

  // Remove a filter group
  const removeFilterGroup = (groupId: string) => {
    setFilterGroups(filterGroups.filter((group) => group.id !== groupId))
  }

  // Add a new condition to a group
  const addCondition = (groupId: string) => {
    const defaultField = fields[0]
    const defaultOperator = getOperatorOptions(defaultField.type)[0].value
    const defaultValue = defaultField.type === "select" && defaultField.options ? defaultField.options[0].value : ""

    const newCondition = {
      id: generateId("condition"),
      field: defaultField.id,
      operator: defaultOperator,
      value: defaultValue,
    }

    setFilterGroups(
      filterGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: [...group.conditions, newCondition],
          }
        }
        return group
      }),
    )
  }

  // Remove a condition from a group
  const removeCondition = (groupId: string, conditionId: string) => {
    setFilterGroups(
      filterGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.filter((condition) => condition.id !== conditionId),
          }
        }
        return group
      }),
    )
  }

  // Update a condition
  const updateCondition = (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
    setFilterGroups(
      filterGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.map((condition) => {
              if (condition.id === conditionId) {
                return { ...condition, ...updates }
              }
              return condition
            }),
          }
        }
        return group
      }),
    )
  }

  // Update group logic
  const updateGroupLogic = (groupId: string, logic: "and" | "or") => {
    setFilterGroups(
      filterGroups.map((group) => {
        if (group.id === groupId) {
          return { ...group, logic }
        }
        return group
      }),
    )
  }

  // Apply a saved filter
  const applySavedFilter = (filter: SavedFilter) => {
    setFilterGroups(filter.groups)
    setActiveFilters((prev) => [...prev, filter.id])
  }

  // Remove an active filter
  const removeActiveFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter((id) => id !== filterId))
  }

  // Save current filter
  const saveCurrentFilter = () => {
    if (!filterName.trim() || !onSaveFilter) return

    onSaveFilter({
      name: filterName,
      description: filterDescription,
      groups: filterGroups,
    })

    setFilterName("")
    setFilterDescription("")
  }

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange(filterGroups)
  }, [filterGroups, onFilterChange])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filterId) => {
            const filter = savedFilters.find((f) => f.id === filterId)
            if (!filter) return null
            return (
              <Badge key={filterId} variant="secondary" className="gap-1 px-2 py-1">
                <Filter className="mr-1 h-3 w-3" />
                {filter.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-4 w-4 rounded-full p-0"
                  onClick={() => removeActiveFilter(filterId)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Filter Builder</h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="space-y-4 p-4 pt-0">
            {/* Filter groups */}
            {filterGroups.map((group, groupIndex) => (
              <div key={group.id} className="rounded-lg border border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select
                      value={group.logic}
                      onValueChange={(value) => updateGroupLogic(group.id, value as "and" | "or")}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Logic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="and">AND</SelectItem>
                        <SelectItem value="or">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      Group {groupIndex + 1} ({group.conditions.length} conditions)
                    </span>
                  </div>
                  {filterGroups.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFilterGroup(group.id)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove group</span>
                    </Button>
                  )}
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                  {group.conditions.map((condition) => {
                    const fieldConfig = fields.find((f) => f.id === condition.field)
                    if (!fieldConfig) return null

                    return (
                      <div key={condition.id} className="flex items-center gap-2">
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(group.id, condition.id, { field: value })}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(group.id, condition.id, { operator: value })}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorOptions(fieldConfig.type).map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {fieldConfig.type === "select" && fieldConfig.options ? (
                          <Select
                            value={condition.value.toString()}
                            onValueChange={(value) => updateCondition(group.id, condition.id, { value })}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldConfig.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : fieldConfig.type === "boolean" ? (
                          <Select
                            value={condition.value.toString()}
                            onValueChange={(value) =>
                              updateCondition(group.id, condition.id, { value: value === "true" })
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={
                              fieldConfig.type === "number" ? "number" : fieldConfig.type === "date" ? "date" : "text"
                            }
                            value={condition.value.toString()}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, {
                                value: fieldConfig.type === "number" ? Number(e.target.value) : e.target.value,
                              })
                            }
                            className="flex-1"
                          />
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeCondition(group.id, condition.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove condition</span>
                        </Button>
                      </div>
                    )
                  })}

                  {group.conditions.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                      No conditions added. Click the button below to add a condition.
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => addCondition(group.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Condition
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={addFilterGroup}>
                <Plus className="mr-2 h-4 w-4" />
                Add Filter Group
              </Button>

              {savedFilters.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Saved Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Saved Filters</h4>
                      <div className="max-h-60 space-y-2 overflow-y-auto">
                        {savedFilters.map((filter) => (
                          <div
                            key={filter.id}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-2 hover:bg-accent"
                            onClick={() => applySavedFilter(filter)}
                          >
                            <div>
                              <div className="font-medium">{filter.name}</div>
                              {filter.description && (
                                <div className="text-xs text-muted-foreground">{filter.description}</div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm">
                              Apply
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {onSaveFilter && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Save className="mr-2 h-4 w-4" />
                      Save Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Save Current Filter</h4>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="filter-name">Filter Name</Label>
                          <Input
                            id="filter-name"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Enter filter name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="filter-description">Description (optional)</Label>
                          <Input
                            id="filter-description"
                            value={filterDescription}
                            onChange={(e) => setFilterDescription(e.target.value)}
                            placeholder="Enter description"
                          />
                        </div>
                      </div>
                      <Button className="w-full" onClick={saveCurrentFilter} disabled={!filterName.trim()}>
                        Save Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
