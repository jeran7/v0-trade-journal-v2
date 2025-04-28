"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { TradeBasicInfo } from "./trade-form-step1"
import { TradePriceInfo } from "./trade-form-step2"
import { TradeAdditionalInfo } from "./trade-form-step3"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type TradeFormData = {
  symbol: string
  direction: "long" | "short"
  quantity: number
  entry_price: number
  exit_price?: number
  entry_date: Date
  exit_date?: Date
  fees?: number
  status: "open" | "closed" | "cancelled"
  setup?: string
  tags?: string[]
  notes?: string
  screenshots: File[]
}

export default function TradeForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: "",
    direction: "long",
    quantity: 0,
    entry_price: 0,
    entry_date: new Date(),
    status: "open",
    tags: [],
    screenshots: [],
  })

  const updateFormData = (data: Partial<TradeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const calculateProfitLoss = () => {
    if (!formData.exit_price) return null

    const { direction, entry_price, exit_price, quantity, fees = 0 } = formData

    if (direction === "long") {
      return (exit_price - entry_price) * quantity - fees
    } else {
      return (entry_price - exit_price) * quantity - fees
    }
  }

  const calculateProfitLossPercent = () => {
    if (!formData.exit_price) return null

    const { direction, entry_price, exit_price } = formData

    if (direction === "long") {
      return ((exit_price - entry_price) / entry_price) * 100
    } else {
      return ((entry_price - exit_price) / entry_price) * 100
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Create trade record
      const tradeData = {
        ...formData,
        tags: formData.tags?.length ? formData.tags : null,
        import_source: "manual",
      }

      // Remove screenshots from the data to be sent to the API
      const { screenshots, ...tradePayload } = tradeData

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradePayload),
      })

      if (!response.ok) {
        throw new Error("Failed to create trade")
      }

      const { trade } = await response.json()

      // Upload screenshots if any
      if (screenshots.length > 0) {
        const supabase = createClientComponentClient()

        for (const file of screenshots) {
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("trade-screenshots")
            .upload(`${trade.id}/${file.name}`, file)

          if (uploadError) {
            console.error("Error uploading screenshot:", uploadError)
            continue
          }

          // Get public URL
          const { data: urlData } = supabase.storage.from("trade-screenshots").getPublicUrl(uploadData.path)

          // Save screenshot record
          await fetch("/api/trades/screenshots", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              trade_id: trade.id,
              screenshot_url: urlData.publicUrl,
              screenshot_type: "entry", // Default to entry
            }),
          })
        }
      }

      toast({
        title: "Trade created",
        description: "Your trade has been successfully created.",
      })

      router.push("/trades")
      router.refresh()
    } catch (error) {
      console.error("Error creating trade:", error)
      toast({
        title: "Error",
        description: "Failed to create trade. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>New Trade</CardTitle>
        <CardDescription>
          {step === 1 && "Enter basic trade information"}
          {step === 2 && "Enter price and date information"}
          {step === 3 && "Add notes and screenshots"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && <TradeBasicInfo formData={formData} updateFormData={updateFormData} />}
        {step === 2 && (
          <TradePriceInfo
            formData={formData}
            updateFormData={updateFormData}
            profitLoss={calculateProfitLoss()}
            profitLossPercent={calculateProfitLossPercent()}
          />
        )}
        {step === 3 && <TradeAdditionalInfo formData={formData} updateFormData={updateFormData} />}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              Previous
            </Button>
          )}
        </div>
        <div>
          {step < 3 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Trade"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
