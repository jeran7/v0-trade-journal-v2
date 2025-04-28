"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className={`transition-all duration-300 ${theme === "light" ? "bg-secondary scale-110" : "hover:scale-105"}`}
        aria-label="Light mode"
      >
        <Sun className="h-5 w-5 transition-transform duration-300 ease-in-out" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className={`transition-all duration-300 ${theme === "dark" ? "bg-secondary scale-110" : "hover:scale-105"}`}
        aria-label="Dark mode"
      >
        <Moon className="h-5 w-5 transition-transform duration-300 ease-in-out" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("system")}
        className={`transition-all duration-300 ${theme === "system" ? "bg-secondary scale-110" : "hover:scale-105"}`}
        aria-label="System theme"
      >
        <Monitor className="h-5 w-5 transition-transform duration-300 ease-in-out" />
      </Button>
    </div>
  )
}
