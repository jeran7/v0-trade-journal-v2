import Link from "next/link"
import { ArrowRight, Check, ExternalLink, Plus, RefreshCw } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"

// Mock data for connected brokers
const connectedBrokers = [
  {
    id: "1",
    name: "Interactive Brokers",
    logo: "/placeholder.svg?height=40&width=40",
    status: "Connected",
    lastSync: "2023-12-15 10:30 AM",
    accountId: "U12345678",
    tradeCount: 156,
  },
  {
    id: "2",
    name: "TD Ameritrade",
    logo: "/placeholder.svg?height=40&width=40",
    status: "Connected",
    lastSync: "2023-12-14 09:15 AM",
    accountId: "TD98765432",
    tradeCount: 89,
  },
]

// Available brokers to connect
const availableBrokers = [
  {
    id: "3",
    name: "Robinhood",
    logo: "/placeholder.svg?height=40&width=40",
    description: "Commission-free investing, plus the tools you need to put your money in motion.",
  },
  {
    id: "4",
    name: "TradeStation",
    logo: "/placeholder.svg?height=40&width=40",
    description: "Award-winning trading platform with advanced tools for serious traders.",
  },
  {
    id: "5",
    name: "MetaTrader",
    logo: "/placeholder.svg?height=40&width=40",
    description: "Popular trading platform for forex and CFD markets with advanced charting.",
  },
  {
    id: "6",
    name: "E*TRADE",
    logo: "/placeholder.svg?height=40&width=40",
    description: "Powerful platform with research and educational resources for all levels.",
  },
]

export default function BrokersPage() {
  return (
    <AppShell>
      <ContentWrapper>
        <div className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight font-sf-pro">Broker Connections</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Broker
            </Button>
          </div>

          <div className="grid gap-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold font-sf-pro">Connected Brokers</h2>
              <div className="grid gap-4">
                {connectedBrokers.map((broker) => (
                  <GlassCard key={broker.id} className="animate-in" style={{ animationDelay: "100ms" }}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                          <img src={broker.logo || "/placeholder.svg"} alt={broker.name} className="h-8 w-8" />
                        </div>
                        <div>
                          <div className="font-medium">{broker.name}</div>
                          <div className="text-xs text-muted-foreground">Account: {broker.accountId}</div>
                        </div>
                      </div>

                      <Badge variant="outline" className="w-fit sm:ml-4">
                        <Check className="mr-1 h-3 w-3 text-profit" />
                        {broker.status}
                      </Badge>

                      <div className="ml-auto flex flex-col items-end">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last sync:</span> {broker.lastSync}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Trades:</span> {broker.tradeCount}
                        </div>
                      </div>

                      <div className="flex gap-2 sm:ml-4">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Sync
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/brokers/${broker.id}/settings`}>Settings</Link>
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="mb-4 text-xl font-semibold font-sf-pro">Available Brokers</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {availableBrokers.map((broker) => (
                  <GlassCard
                    key={broker.id}
                    className="flex flex-col gap-4 transition-all duration-300 hover:bg-accent/10 animate-in"
                    style={{ animationDelay: "200ms" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                        <img src={broker.logo || "/placeholder.svg"} alt={broker.name} className="h-8 w-8" />
                      </div>
                      <div className="font-medium">{broker.name}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{broker.description}</p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/brokers/connect/${broker.id}`}>
                        Connect
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </GlassCard>
                ))}
              </div>
            </div>

            <GlassCard className="animate-in" style={{ animationDelay: "300ms" }}>
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold font-sf-pro">Manual Import Options</h2>
                <p className="text-sm text-muted-foreground">
                  Don't see your broker listed? You can still import your trades using one of these methods:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" asChild>
                    <Link href="/import/csv">
                      Import from CSV
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/import/manual">
                      Manual Entry
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="animate-in" style={{ animationDelay: "400ms" }}>
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold font-sf-pro">API Documentation</h2>
                <p className="text-sm text-muted-foreground">
                  For developers: Access our API documentation to build custom integrations with your trading platforms.
                </p>
                <Button variant="outline" className="w-fit" asChild>
                  <Link href="/api/docs">
                    View API Docs
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
