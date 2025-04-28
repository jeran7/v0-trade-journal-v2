import type React from "react"
import { Sidebar } from "@/components/navigation/sidebar"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden transition-colors duration-300">
        <main className="flex-1 overflow-auto transition-colors duration-300">{children}</main>
      </div>
    </div>
  )
}
