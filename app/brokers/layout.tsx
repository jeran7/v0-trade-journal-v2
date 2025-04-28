import type React from "react"
import { AppShell } from "@/components/layout/app-shell"

export default function BrokersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
