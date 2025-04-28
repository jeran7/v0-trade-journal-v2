"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Palette, Eye, Clock, Sparkles, Sun, Moon, Monitor } from "lucide-react"

interface ThemeSettingsProps {
  className?: string
}

export function ThemeSettings({ className }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [colorIntensity, setColorIntensity] = useState(100)
  const [contrastMode, setContrastMode] = useState<"standard" | "high" | "colorblind">("standard")
  const [motionReduced, setMotionReduced] = useState(false)
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(false)
  const [lightStartTime, setLightStartTime] = useState("06:00")
  const [darkStartTime, setDarkStartTime] = useState("18:00")

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Load saved preferences from localStorage
    const savedColorIntensity = localStorage.getItem("color-intensity")
    const savedContrastMode = localStorage.getItem("contrast-mode")
    const savedMotionReduced = localStorage.getItem("motion-reduced")
    const savedAutoSwitch = localStorage.getItem("auto-switch")
    const savedLightStartTime = localStorage.getItem("light-start-time")
    const savedDarkStartTime = localStorage.getItem("dark-start-time")

    if (savedColorIntensity) setColorIntensity(Number.parseInt(savedColorIntensity))
    if (savedContrastMode) setContrastMode(savedContrastMode as "standard" | "high" | "colorblind")
    if (savedMotionReduced) setMotionReduced(savedMotionReduced === "true")
    if (savedAutoSwitch) setAutoSwitchEnabled(savedAutoSwitch === "true")
    if (savedLightStartTime) setLightStartTime(savedLightStartTime)
    if (savedDarkStartTime) setDarkStartTime(savedDarkStartTime)

    // Apply saved settings
    applyColorIntensity(savedColorIntensity ? Number.parseInt(savedColorIntensity) : 100)
    applyContrastMode((savedContrastMode as "standard" | "high" | "colorblind") || "standard")
    applyMotionReduced(savedMotionReduced === "true")

    // Set up auto theme switching if enabled
    if (savedAutoSwitch === "true") {
      setupAutoThemeSwitching(savedLightStartTime || "06:00", savedDarkStartTime || "18:00")
    }
  }, [])

  // Apply color intensity
  const applyColorIntensity = (intensity: number) => {
    document.documentElement.style.setProperty("--color-intensity", `${intensity}%`)
    localStorage.setItem("color-intensity", intensity.toString())
  }

  // Apply contrast mode
  const applyContrastMode = (mode: "standard" | "high" | "colorblind") => {
    // Remove existing classes
    document.documentElement.classList.remove("contrast-high", "colorblind-mode")

    // Add appropriate class
    if (mode === "high") {
      document.documentElement.classList.add("contrast-high")
    } else if (mode === "colorblind") {
      document.documentElement.classList.add("colorblind-mode")
    }

    localStorage.setItem("contrast-mode", mode)
  }

  // Apply reduced motion
  const applyMotionReduced = (reduced: boolean) => {
    if (reduced) {
      document.documentElement.classList.add("motion-reduced")
    } else {
      document.documentElement.classList.remove("motion-reduced")
    }

    localStorage.setItem("motion-reduced", reduced.toString())
  }

  // Set up auto theme switching
  const setupAutoThemeSwitching = (lightTime: string, darkTime: string) => {
    const checkTime = () => {
      const now = new Date()
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTimeMinutes = currentHours * 60 + currentMinutes

      const [lightHours, lightMinutes] = lightTime.split(":").map(Number)
      const [darkHours, darkMinutes] = darkTime.split(":").map(Number)

      const lightTimeMinutes = lightHours * 60 + lightMinutes
      const darkTimeMinutes = darkHours * 60 + darkMinutes

      if (currentTimeMinutes >= lightTimeMinutes && currentTimeMinutes < darkTimeMinutes) {
        setTheme("light")
      } else {
        setTheme("dark")
      }
    }

    // Check immediately
    checkTime()

    // Set up interval to check every minute
    const interval = setInterval(checkTime, 60000)

    // Clean up interval on component unmount
    return () => clearInterval(interval)
  }

  // Handle color intensity change
  const handleColorIntensityChange = (value: number[]) => {
    const intensity = value[0]
    setColorIntensity(intensity)
    applyColorIntensity(intensity)
  }

  // Handle contrast mode change
  const handleContrastModeChange = (mode: "standard" | "high" | "colorblind") => {
    setContrastMode(mode)
    applyContrastMode(mode)
  }

  // Handle reduced motion change
  const handleMotionReducedChange = (reduced: boolean) => {
    setMotionReduced(reduced)
    applyMotionReduced(reduced)
  }

  // Handle auto switch change
  const handleAutoSwitchChange = (enabled: boolean) => {
    setAutoSwitchEnabled(enabled)
    localStorage.setItem("auto-switch", enabled.toString())

    if (enabled) {
      setupAutoThemeSwitching(lightStartTime, darkStartTime)
    }
  }

  // Handle light start time change
  const handleLightStartTimeChange = (time: string) => {
    setLightStartTime(time)
    localStorage.setItem("light-start-time", time)

    if (autoSwitchEnabled) {
      setupAutoThemeSwitching(time, darkStartTime)
    }
  }

  // Handle dark start time change
  const handleDarkStartTimeChange = (time: string) => {
    setDarkStartTime(time)
    localStorage.setItem("dark-start-time", time)

    if (autoSwitchEnabled) {
      setupAutoThemeSwitching(lightStartTime, time)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Theme settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
          <DialogDescription>Customize the appearance of the trading journal to your preferences.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="theme">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Eye className="h-4 w-4 mr-2" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Clock className="h-4 w-4 mr-2" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="presets">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Presets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="flex flex-col items-center justify-center gap-1 h-24"
                onClick={() => setTheme("light")}
              >
                <div className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
                  <Sun className="h-6 w-6 text-[#0f172a]" />
                </div>
                <span>Light</span>
              </Button>

              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="flex flex-col items-center justify-center gap-1 h-24"
                onClick={() => setTheme("dark")}
              >
                <div className="w-12 h-12 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center">
                  <Moon className="h-6 w-6 text-[#f8fafc]" />
                </div>
                <span>Dark</span>
              </Button>

              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="flex flex-col items-center justify-center gap-1 h-24"
                onClick={() => setTheme("system")}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f8fafc] to-[#0f172a] border border-[#94a3b8] flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-[#94a3b8]" />
                </div>
                <span>System</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Reduced motion</Label>
                <Switch id="reduced-motion" checked={motionReduced} onCheckedChange={handleMotionReducedChange} />
              </div>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions for accessibility.</p>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Color intensity</Label>
                <Slider
                  value={[colorIntensity]}
                  min={50}
                  max={150}
                  step={5}
                  onValueChange={handleColorIntensityChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtle</span>
                  <span>Default</span>
                  <span>Vibrant</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contrast mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={contrastMode === "standard" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleContrastModeChange("standard")}
                  >
                    Standard
                  </Button>
                  <Button
                    variant={contrastMode === "high" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleContrastModeChange("high")}
                  >
                    High contrast
                  </Button>
                  <Button
                    variant={contrastMode === "colorblind" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleContrastModeChange("colorblind")}
                  >
                    Colorblind
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-3">Semantic color preview</h3>
                <div className="space-y-2">
                  <GlassCard semanticColor="success" className="p-2">
                    <div className="text-sm font-medium text-success">Success / Positive</div>
                  </GlassCard>
                  <GlassCard semanticColor="warning" className="p-2">
                    <div className="text-sm font-medium text-warning">Warning / Caution</div>
                  </GlassCard>
                  <GlassCard semanticColor="insight" className="p-2">
                    <div className="text-sm font-medium text-insight">Insight / Growth</div>
                  </GlassCard>
                  <GlassCard semanticColor="danger" className="p-2">
                    <div className="text-sm font-medium text-danger">Danger / Critical</div>
                  </GlassCard>
                  <GlassCard semanticColor="advanced" className="p-2">
                    <div className="text-sm font-medium text-advanced">Advanced / Premium</div>
                  </GlassCard>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-switch">Automatic theme switching</Label>
                <Switch id="auto-switch" checked={autoSwitchEnabled} onCheckedChange={handleAutoSwitchChange} />
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically switch between light and dark themes based on time of day.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="light-time">Light theme starts at</Label>
                <input
                  id="light-time"
                  type="time"
                  value={lightStartTime}
                  onChange={(e) => handleLightStartTimeChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!autoSwitchEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dark-time">Dark theme starts at</Label>
                <input
                  id="dark-time"
                  type="time"
                  value={darkStartTime}
                  onChange={(e) => handleDarkStartTimeChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!autoSwitchEnabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  setTheme("dark")
                  setColorIntensity(100)
                  handleColorIntensityChange([100])
                  handleContrastModeChange("standard")
                  handleMotionReducedChange(false)
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center">
                  <Moon className="h-4 w-4 text-[#f8fafc]" />
                </div>
                <span className="text-sm">Trading Dark</span>
                <span className="text-xs text-muted-foreground">Default dark theme</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  setTheme("light")
                  setColorIntensity(100)
                  handleColorIntensityChange([100])
                  handleContrastModeChange("standard")
                  handleMotionReducedChange(false)
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center">
                  <Sun className="h-4 w-4 text-[#0f172a]" />
                </div>
                <span className="text-sm">Trading Light</span>
                <span className="text-xs text-muted-foreground">Default light theme</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  setTheme("dark")
                  setColorIntensity(130)
                  handleColorIntensityChange([130])
                  handleContrastModeChange("standard")
                  handleMotionReducedChange(false)
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#0f172a] border-2 border-[#4285F4] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#4285F4]" />
                </div>
                <span className="text-sm">Vibrant Dark</span>
                <span className="text-xs text-muted-foreground">Enhanced colors</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  setTheme("dark")
                  setColorIntensity(100)
                  handleColorIntensityChange([100])
                  handleContrastModeChange("high")
                  handleMotionReducedChange(true)
                }}
              >
                <div className="w-8 h-8 rounded-full bg-black border-2 border-white flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">Accessibility</span>
                <span className="text-xs text-muted-foreground">High contrast, reduced motion</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
