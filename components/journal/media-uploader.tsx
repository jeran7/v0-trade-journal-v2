"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, FileText, ImageIcon, Film, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { type JournalMedia, uploadJournalMedia, deleteJournalMedia } from "@/lib/supabase/journal-media-service"

interface MediaUploaderProps {
  journalEntryId: string
  initialMedia?: JournalMedia[]
  onChange?: (media: JournalMedia[]) => void
  className?: string
  readOnly?: boolean
}

interface UploadPreview {
  file: File
  preview: string
  progress: number
  mediaType: "image" | "video" | "audio" | "document"
  uploading: boolean
  error?: string
}

export function MediaUploader({
  journalEntryId,
  initialMedia = [],
  onChange,
  className,
  readOnly = false,
}: MediaUploaderProps) {
  const [media, setMedia] = useState<JournalMedia[]>(initialMedia)
  const [previews, setPreviews] = useState<UploadPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getMediaTypeFromFile = (file: File): "image" | "video" | "audio" | "document" => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("video/")) return "video"
    if (file.type.startsWith("audio/")) return "audio"
    return "document"
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const newPreviews: UploadPreview[] = []

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 10MB size limit.`)
        continue
      }

      const mediaType = getMediaTypeFromFile(file)
      let preview = ""

      if (mediaType === "image") {
        preview = URL.createObjectURL(file)
      } else if (mediaType === "video") {
        preview = URL.createObjectURL(file)
      } else if (mediaType === "audio") {
        preview = "/sound-waves-visualization.png"
      } else {
        preview = "/digital-document-management.png"
      }

      newPreviews.push({
        file,
        preview,
        progress: 0,
        mediaType,
        uploading: false,
      })
    }

    setPreviews((prev) => [...prev, ...newPreviews])
    uploadFiles(newPreviews)
  }

  const uploadFiles = async (filesToUpload: UploadPreview[]) => {
    for (let i = 0; i < filesToUpload.length; i++) {
      const previewItem = filesToUpload[i]

      // Update preview item to show uploading state
      setPreviews((prev) => prev.map((item) => (item.file === previewItem.file ? { ...item, uploading: true } : item)))

      try {
        // Upload the file
        const uploadedMedia = await uploadJournalMedia(previewItem.file, journalEntryId, previewItem.mediaType)

        if (uploadedMedia) {
          // Remove from previews and add to media
          setPreviews((prev) => prev.filter((item) => item.file !== previewItem.file))
          setMedia((prev) => [...prev, uploadedMedia])
          onChange?.([...media, uploadedMedia])
        } else {
          throw new Error("Upload failed")
        }
      } catch (error) {
        console.error("Error uploading file:", error)

        // Update preview to show error
        setPreviews((prev) =>
          prev.map((item) =>
            item.file === previewItem.file ? { ...item, uploading: false, error: "Upload failed" } : item,
          ),
        )
      }
    }
  }

  const handleRemovePreview = (preview: UploadPreview) => {
    if (preview.preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview.preview)
    }
    setPreviews((prev) => prev.filter((item) => item.file !== preview.file))
  }

  const handleRemoveMedia = async (mediaItem: JournalMedia) => {
    const success = await deleteJournalMedia(mediaItem.id)
    if (success) {
      const updatedMedia = media.filter((item) => item.id !== mediaItem.id)
      setMedia(updatedMedia)
      onChange?.(updatedMedia)
    }
  }

  const renderMediaPreview = (item: JournalMedia) => {
    switch (item.media_type) {
      case "image":
        return (
          <img
            src={item.media_url || "/placeholder.svg"}
            alt={item.file_name || "Image"}
            className="h-full w-full object-cover"
          />
        )
      case "video":
        return <video src={item.media_url} controls className="h-full w-full object-cover" />
      case "audio":
        return (
          <div className="flex h-full w-full flex-col items-center justify-center bg-accent/10 p-4">
            <Music className="h-10 w-10 mb-2" />
            <audio src={item.media_url} controls className="w-full" />
          </div>
        )
      case "document":
        return (
          <div className="flex h-full w-full flex-col items-center justify-center bg-accent/10 p-4">
            <FileText className="h-10 w-10 mb-2" />
            <p className="text-xs text-muted-foreground">{item.file_name}</p>
            <a
              href={item.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-primary underline"
            >
              View Document
            </a>
          </div>
        )
      default:
        return null
    }
  }

  const renderPreviewIcon = (mediaType: string) => {
    switch (mediaType) {
      case "image":
        return <ImageIcon className="h-10 w-10" />
      case "video":
        return <Film className="h-10 w-10" />
      case "audio":
        return <Music className="h-10 w-10" />
      case "document":
        return <FileText className="h-10 w-10" />
      default:
        return <FileText className="h-10 w-10" />
    }
  }

  if (readOnly) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3", className)}>
        {media.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-md border">
            <div className="aspect-video w-full overflow-hidden">{renderMediaPreview(item)}</div>
            <div className="p-2">
              <p className="truncate text-sm font-medium">{item.file_name || `${item.media_type} file`}</p>
              <p className="text-xs text-muted-foreground">
                {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(2)}MB` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 transition-colors",
          dragActive ? "border-primary bg-muted/30" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Upload Media</h3>
          <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground">Supports images, videos, audio, and documents (max 10MB)</p>
        </div>
      </div>

      {(previews.length > 0 || media.length > 0) && (
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-medium">Media Files</h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Preview items */}
            {previews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative overflow-hidden rounded-md border">
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemovePreview(preview)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="aspect-video w-full overflow-hidden bg-accent/10">
                  {preview.mediaType === "image" && (
                    <img
                      src={preview.preview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {preview.mediaType === "video" && (
                    <video src={preview.preview} className="h-full w-full object-cover" />
                  )}
                  {(preview.mediaType === "audio" || preview.mediaType === "document") && (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      {renderPreviewIcon(preview.mediaType)}
                      <p className="mt-2 truncate text-sm">{preview.file.name}</p>
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <p className="truncate text-sm">{preview.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(preview.file.size / 1024 / 1024).toFixed(2)}MB</p>
                  {preview.uploading && (
                    <Progress
                      value={preview.progress}
                      className="mt-2 h-1"
                      indicatorClassName={preview.error ? "bg-destructive" : undefined}
                    />
                  )}
                  {preview.error && <p className="mt-1 text-xs text-destructive">{preview.error}</p>}
                </div>
              </div>
            ))}

            {/* Uploaded media items */}
            {media.map((item) => (
              <div key={item.id} className="relative overflow-hidden rounded-md border">
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveMedia(item)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="aspect-video w-full overflow-hidden">{renderMediaPreview(item)}</div>

                <div className="p-2">
                  <p className="truncate text-sm font-medium">{item.file_name || `${item.media_type} file`}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(2)}MB` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
