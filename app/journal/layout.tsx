import type React from "react"
import type { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/protected-route"

export const metadata: Metadata = {
  title: "Journal | Trading Journal",
  description: "Record your trading thoughts and insights",
}

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
