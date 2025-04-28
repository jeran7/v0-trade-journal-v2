"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Lock, Shield } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"

// Mock broker data
const brokers = {
  "3": {
    id: "3",
    name: "Robinhood",
    logo: "/placeholder.svg?height=40&width=40",
    fields: [
      { id: "username", label: "Username", type: "text", required: true },
      { id: "password", label: "Password", type: "password", required: true },
      { id: "apiKey", label: "API Key", type: "text", required: false },
    ],
  },
  "4": {
    id: "4",
    name: "TradeStation",
    logo: "/placeholder.svg?height=40&width=40",
    fields: [
      { id: "username", label: "Username", type: "text", required: true },
      { id: "password", label: "Password", type: "password", required: true },
      { id: "accountId", label: "Account ID", type: "text", required: true },
    ],
  },
  "5": {
    id: "5",
    name: "MetaTrader",
    logo: "/placeholder.svg?height=40&width=40",
    fields: [
      { id: "server", label: "Server", type: "text", required: true },
      { id: "accountId", label: "Account ID", type: "text", required: true },
      { id: "password", label: "Password", type: "password", required: true },
    ],
  },
  "6": {
    id: "6",
    name: "E*TRADE",
    logo: "/placeholder.svg?height=40&width=40",
    fields: [
      { id: "username", label: "Username", type: "text", required: true },
      { id: "password", label: "Password", type: "password", required: true },
      { id: "apiKey", label: "API Key", type: "text", required: true },
      { id: "apiSecret", label: "API Secret", type: "password", required: true },
    ],
  },
}

export default function ConnectBrokerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<Record<string, string>>({})

  const broker = brokers[params.id as keyof typeof brokers]

  if (!broker) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Broker not found</h1>
          <p className="mt-2 text-muted-foreground">The broker you're looking for doesn't exist.</p>
          <Button className="mt-4" asChild>
            <Link href="/brokers">Back to Brokers</Link>
          </Button>
        </div>
      </div>
    )
  }

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }))
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)

    // Simulate API connection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to success page
    router.push("/brokers/connect/success")
  }

  return (
    <AppShell>
      <ContentWrapper>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center">
            <Button variant="outline" size="icon" asChild>
              <Link href="/brokers">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to brokers</span>
              </Link>
            </Button>
            <h1 className="ml-4 text-2xl font-bold font-sf-pro">Connect to {broker.name}</h1>
          </div>

          <GlassCard className="animate-in">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                  <img src={broker.logo || "/placeholder.svg"} alt={broker.name} className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold font-sf-pro">{broker.name}</h2>
                  <p className="text-sm text-muted-foreground">Connect your account to import trades automatically</p>
                </div>
              </div>

              <Alert className="bg-accent/50 border-accent">
                <Shield className="h-4 w-4" />
                <AlertTitle>Secure Connection</AlertTitle>
                <AlertDescription>
                  Your credentials are encrypted and never stored on our servers. We use read-only API access when
                  available.
                </AlertDescription>
              </Alert>

              <Separator />

              <form onSubmit={handleConnect} className="space-y-4">
                {broker.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-loss"> *</span>}
                    </Label>
                    <div className="relative">
                      {field.type === "password" ? (
                        <>
                          <Input
                            id={field.id}
                            type={showPassword[field.id] ? "text" : "password"}
                            required={field.required}
                            className="pr-10"
                            value={formData[field.id] || ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => togglePasswordVisibility(field.id)}
                          >
                            {showPassword[field.id] ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                              {showPassword[field.id] ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </>
                      ) : (
                        <Input
                          id={field.id}
                          type={field.type}
                          required={field.required}
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox id="terms" required />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms of service
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By connecting, you authorize read-only access to your trading data.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Connect Securely
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" asChild>
                    <Link href="/brokers">Cancel</Link>
                  </Button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      </ContentWrapper>
    </AppShell>
  )
}
