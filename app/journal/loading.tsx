import { GlassCard } from "@/components/ui/glass-card"
import { Header } from "@/components/navigation/header"
import { Sidebar } from "@/components/navigation/sidebar"

export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid gap-6">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />

            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <GlassCard key={i} className="h-32 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
