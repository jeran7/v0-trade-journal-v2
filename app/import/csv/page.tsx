"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, FileText, Upload, X } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/navigation/header"
import { Sidebar } from "@/components/navigation/sidebar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function ImportCSVPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setUploadComplete(true)
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 300)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center">
              <Button variant="outline" size="icon" asChild>
                <Link href="/brokers">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to brokers</span>
                </Link>
              </Button>
              <h1 className="ml-4 text-2xl font-bold font-sf-pro">Import Trades from CSV</h1>
            </div>

            <GlassCard className="animate-in">
              <div className="flex flex-col gap-6">
                <Alert className="bg-accent/50 border-accent">
                  <FileText className="h-4 w-4" />
                  <AlertTitle>CSV Format Requirements</AlertTitle>
                  <AlertDescription>
                    Your CSV file should include columns for: Symbol, Date, Type (Buy/Sell), Price, Quantity, and
                    optionally Notes.{" "}
                    <Link href="/import/csv/template" className="underline">
                      Download template
                    </Link>
                  </AlertDescription>
                </Alert>

                <Separator />

                {!uploadComplete ? (
                  <>
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${isDragging ? "border-primary bg-accent/20" : "border-border"}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <div className="flex w-full flex-col items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/50">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB • CSV File
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                            <X className="mr-2 h-4 w-4" />
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/50">
                            <Upload className="h-8 w-8" />
                          </div>
                          <p className="mt-4 font-medium">Drag and drop your CSV file here</p>
                          <p className="text-sm text-muted-foreground">or</p>
                          <label htmlFor="csv-upload" className="mt-4">
                            <Button variant="outline" className="cursor-pointer" as="span">
                              Browse Files
                            </Button>
                            <input
                              id="csv-upload"
                              type="file"
                              accept=".csv"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        </>
                      )}
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Uploading...</span>
                          <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button className="flex-1" onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload and Import
                          </>
                        )}
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href="/brokers">Cancel</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-profit/20">
                      <Check className="h-10 w-10 text-profit" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold font-sf-pro">Import Successful!</h2>
                      <p className="mt-2 text-muted-foreground">
                        Your trades have been successfully imported from the CSV file.
                      </p>
                    </div>

                    <div className="grid w-full gap-4">
                      <Button asChild>
                        <Link href="/trades">View Your Trades</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/brokers">Back to Broker Connections</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  )
}
