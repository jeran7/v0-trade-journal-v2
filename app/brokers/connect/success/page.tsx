import Link from "next/link"
import { ArrowRight, Check, RefreshCw } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/navigation/header"
import { Sidebar } from "@/components/navigation/sidebar"

export default function ConnectionSuccessPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl">
            <GlassCard className="animate-in">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-profit/20">
                  <Check className="h-10 w-10 text-profit" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold font-sf-pro">Connection Successful!</h1>
                  <p className="mt-2 text-muted-foreground">
                    Your broker account has been successfully connected to your trading journal.
                  </p>
                </div>

                <div className="w-full max-w-md rounded-lg bg-accent/50 p-4">
                  <h2 className="font-medium">Synchronization in Progress</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      We're importing your historical trades. This may take a few minutes.
                    </span>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full animate-pulse rounded-full bg-profit" style={{ width: "60%" }} />
                  </div>
                </div>

                <div className="grid w-full gap-4">
                  <Button asChild>
                    <Link href="/trades">
                      View Your Trades
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/brokers">Back to Broker Connections</Link>
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  )
}
