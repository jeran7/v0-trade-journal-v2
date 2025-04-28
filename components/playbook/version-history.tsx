"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Clock, History } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VersionChange {
  version: string
  date: string
  changes: string[]
}

interface VersionHistoryProps {
  versions: VersionChange[]
}

export function VersionHistory({ versions }: VersionHistoryProps) {
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0)
  const selectedVersion = versions[selectedVersionIndex]

  const handlePrevVersion = () => {
    if (selectedVersionIndex < versions.length - 1) {
      setSelectedVersionIndex(selectedVersionIndex + 1)
    }
  }

  const handleNextVersion = () => {
    if (selectedVersionIndex > 0) {
      setSelectedVersionIndex(selectedVersionIndex - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Version History</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevVersion}
            disabled={selectedVersionIndex >= versions.length - 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Older
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextVersion} disabled={selectedVersionIndex <= 0}>
            Newer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-6 pl-10">
          {versions.map((version, index) => (
            <div
              key={version.version}
              className={`relative ${index > 0 ? "opacity-50" : ""} transition-opacity duration-300 hover:opacity-100`}
            >
              <div className="absolute -left-10 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                <Clock className="h-4 w-4" />
              </div>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Version {version.version}</h4>
                    <Badge variant="outline" className="text-xs">
                      {index === 0 ? "Current" : "Previous"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{version.date}</div>
                </div>
                <div className="mt-4 space-y-2">
                  {version.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <div className="text-sm">{change}</div>
                    </div>
                  ))}
                </div>
                {index === 0 ? null : (
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      Compare with Current
                    </Button>
                  </div>
                )}
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
