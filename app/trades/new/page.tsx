"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { AppShell } from "@/components/layout/app-shell"
import { ContentWrapper } from "@/components/layout/content-wrapper"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/lib/supabase/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function NewTradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [calculatedPnL, setCalculatedPnL] = useState<number | null>(null)
  const [calculatedPnLPercent, setCalculatedPnLPercent] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  // Ensure user is authenticated
  useEffect(() => {
    if (!user) {
      console.log("No user found in session, redirecting to login")
      router.push("/auth/login?redirect=/trades/new")
    } else {
      console.log("User authenticated:", user.id)
    }
  }, [user, router])

  const [formData, setFormData] = useState({
    symbol: "",
    direction: "long" as "long" | "short",
    quantity: 0,
    entry_price: 0,
    exit_price: null as number | null,
    entry_date: "",
    exit_date: null as string | null,
    fees: 0,
    setup: "",
    notes: "",
    tags: [] as string[],
    status: "open" as "open" | "closed" | "cancelled",
    import_source: "manual" as "manual" | "csv" | "robinhood" | "interactive_brokers" | "td_ameritrade",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Calculate P&L if we have enough data
    if (
      (name === "entry_price" || name === "exit_price" || name === "quantity" || name === "direction") &&
      formData.entry_price &&
      formData.exit_price &&
      formData.quantity
    ) {
      calculatePnL()
    }
  }

  const handleDirectionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, direction: value as "long" | "short" }))
    calculatePnL()
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(",").map((tag) => tag.trim())
    setFormData((prev) => ({ ...prev, tags: tagsArray }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...newFiles])

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index))
  }

  const calculatePnL = () => {
    const entryPrice = Number.parseFloat(formData.entry_price.toString())
    const exitPrice = formData.exit_price ? Number.parseFloat(formData.exit_price.toString()) : null
    const quantity = Number.parseFloat(formData.quantity.toString())
    const fees = Number.parseFloat(formData.fees.toString()) || 0

    if (exitPrice && !isNaN(entryPrice) && !isNaN(exitPrice) && !isNaN(quantity)) {
      let pnl = 0
      if (formData.direction === "long") {
        pnl = (exitPrice - entryPrice) * quantity - fees
      } else {
        pnl = (entryPrice - exitPrice) * quantity - fees
      }

      const pnlPercent =
        formData.direction === "long"
          ? ((exitPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - exitPrice) / entryPrice) * 100

      setCalculatedPnL(pnl)
      setCalculatedPnLPercent(pnlPercent)

      // Update status based on exit price
      setFormData((prev) => ({
        ...prev,
        status: exitPrice ? "closed" : "open",
      }))
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.symbol || !formData.quantity) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }
    } else if (step === 2) {
      if (!formData.entry_price || !formData.entry_date) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }
    }

    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user) {
        throw new Error("You must be logged in to create a trade")
      }

      // Prepare the data for submission
      const tradePayload = {
        ...formData,
        // Convert string values to numbers
        quantity: Number(formData.quantity),
        entry_price: Number(formData.entry_price),
        exit_price: formData.exit_price ? Number(formData.exit_price) : null,
        fees: Number(formData.fees) || 0,
        // Ensure tags is an array or null
        tags: formData.tags.length > 0 ? formData.tags : null,
        // Explicitly add user_id
        user_id: user.id,
      }

      console.log("Submitting trade payload:", tradePayload)

      // Skip direct insertion and use admin API directly
      console.log("Using admin API to create trade")
      const response = await fetch("/api/admin/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradePayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create trade")
      }

      const data = await response.json()
      if (!data.trade) {
        throw new Error("No trade data returned from API")
      }

      console.log("Trade created via admin API:", data.trade)

      // Upload screenshots if any
      await handleScreenshotUploads(data.trade.id)

      toast({
        title: "Trade created",
        description: "Your trade has been successfully created",
      })

      // Redirect to the trades page
      router.push("/trades")
    } catch (error) {
      console.error("Error creating trade:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trade. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to handle screenshot uploads
  const handleScreenshotUploads = async (tradeId: string) => {
    if (files.length === 0) return

    try {
      // Create the storage bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket) => bucket.name === "trade-screenshots")

      if (!bucketExists) {
        // Create bucket
        const { error: bucketError } = await supabase.storage.createBucket("trade-screenshots", {
          public: true,
        })

        if (bucketError) {
          console.error("Error creating bucket:", bucketError)
        }
      }

      for (const file of files) {
        try {
          // Create a unique filename
          const timestamp = new Date().getTime()
          const fileName = `${user?.id}/${tradeId}/${timestamp}-${file.name}`

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("trade-screenshots")
            .upload(fileName, file)

          if (uploadError) {
            console.error("Error uploading screenshot:", uploadError)
            continue
          }

          // Get public URL
          const { data: urlData } = supabase.storage.from("trade-screenshots").getPublicUrl(uploadData.path)

          // Use admin API to save screenshot record
          const screenshotResponse = await fetch("/api/admin/screenshots", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              trade_id: tradeId,
              user_id: user?.id,
              screenshot_url: urlData.publicUrl,
              screenshot_type: "other",
            }),
          })

          if (!screenshotResponse.ok) {
            console.error("Error saving screenshot record:", await screenshotResponse.json())
          }
        } catch (fileError) {
          console.error("Error processing file:", fileError)
        }
      }
    } catch (error) {
      console.error("Error handling screenshots:", error)
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <ContentWrapper>
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center">
              <Button variant="outline" size="icon" asChild>
                <Link href="/trades">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to trades</span>
                </Link>
              </Button>
              <h1 className="ml-4 text-2xl font-bold font-sf-pro">New Trade</h1>
            </div>

            <GlassCard className="animate-in">
              <div className="mb-6">
                <div className="flex justify-between">
                  <div className={`flex-1 pb-2 ${step === 1 ? "border-b-2 border-primary" : ""}`}>
                    Step 1: Basic Info
                  </div>
                  <div className={`flex-1 pb-2 ${step === 2 ? "border-b-2 border-primary" : ""}`}>
                    Step 2: Trade Details
                  </div>
                  <div className={`flex-1 pb-2 ${step === 3 ? "border-b-2 border-primary" : ""}`}>
                    Step 3: Notes & Media
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="symbol">Symbol *</Label>
                      <Input
                        id="symbol"
                        name="symbol"
                        placeholder="AAPL"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label>Direction *</Label>
                      <RadioGroup
                        value={formData.direction}
                        onValueChange={handleDirectionChange}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="long" id="long" />
                          <Label htmlFor="long">Long</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="short" id="short" />
                          <Label htmlFor="short">Short</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        step="0.0001"
                        placeholder="100"
                        value={formData.quantity || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="button" onClick={nextStep}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entry_price">Entry Price *</Label>
                        <Input
                          id="entry_price"
                          name="entry_price"
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          value={formData.entry_price || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="exit_price">Exit Price</Label>
                        <Input
                          id="exit_price"
                          name="exit_price"
                          type="number"
                          step="0.01"
                          placeholder="110.00"
                          value={formData.exit_price || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entry_date">Entry Date *</Label>
                        <Input
                          id="entry_date"
                          name="entry_date"
                          type="datetime-local"
                          value={formData.entry_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="exit_date">Exit Date</Label>
                        <Input
                          id="exit_date"
                          name="exit_date"
                          type="datetime-local"
                          value={formData.exit_date || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fees">Fees</Label>
                      <Input
                        id="fees"
                        name="fees"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.fees || ""}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="setup">Setup</Label>
                      <Input
                        id="setup"
                        name="setup"
                        placeholder="Breakout, Pullback, etc."
                        value={formData.setup}
                        onChange={handleInputChange}
                      />
                    </div>

                    {calculatedPnL !== null && (
                      <div className="p-4 border rounded-md bg-accent/10">
                        <div className="text-sm font-medium">Calculated P&L</div>
                        <div className={`text-lg font-bold ${calculatedPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {calculatedPnL >= 0 ? "+" : ""}${calculatedPnL.toFixed(2)}
                        </div>
                        <div className={`text-sm ${calculatedPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {calculatedPnL >= 0 ? "+" : ""}
                          {calculatedPnLPercent?.toFixed(2)}%
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button type="button" onClick={nextStep}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        name="tags"
                        placeholder="Breakout, High Volume, Gap Up"
                        value={formData.tags.join(", ")}
                        onChange={handleTagsChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Add your trade notes here..."
                        rows={5}
                        value={formData.notes}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label>Screenshots</Label>
                      <div className="mt-2 border-2 border-dashed rounded-md p-6 text-center">
                        <input
                          type="file"
                          id="screenshots"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="screenshots" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">Click to upload or drag and drop</span>
                            <span className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</span>
                          </div>
                        </label>
                      </div>

                      {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="rounded-md w-full h-24 object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-background/80 rounded-full p-1"
                                onClick={() => removeFile(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Save Trade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </GlassCard>
          </div>
        </ContentWrapper>
      </AppShell>
    </ProtectedRoute>
  )
}
