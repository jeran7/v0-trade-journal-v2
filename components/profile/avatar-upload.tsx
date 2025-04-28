"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { GlassAuthCard } from "@/components/ui/glass-auth-card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseAuthClient } from "@/lib/supabase/auth-client"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AvatarUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user, refreshSession } = useAuth()
  const supabase = getSupabaseAuthClient()

  // Fetch avatar URL
  const fetchAvatarUrl = async () => {
    if (!user) return

    try {
      // Using id based on the schema (id is the primary key referencing auth.users)
      const { data, error } = await supabase.from("user_profiles").select("avatar_url").eq("id", user.id).single()

      if (error) {
        if (error.code !== "PGRST116") {
          // Not found is okay for new users
          console.error("Error details:", error)
          toast({
            title: "Error fetching avatar",
            description: "There was a problem loading your profile picture",
            variant: "destructive",
          })
        }
        return
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.error("Error fetching avatar:", error)
    }
  }

  // Load avatar on component mount
  useEffect(() => {
    fetchAvatarUrl()
  }, [user]) // Added user as a dependency

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Handle file change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `avatars/${user.id}/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("user-content").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("user-content").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.id) // Using id based on the schema
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      let updateError

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("user_profiles")
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id) // Using id based on the schema

        updateError = error
      } else {
        // Create new profile
        const { error } = await supabase.from("user_profiles").insert({
          id: user.id, // Using id based on the schema
          avatar_url: publicUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        updateError = error
      }

      if (updateError) throw updateError

      // Update local state
      setAvatarUrl(publicUrl)

      // Refresh session to update user data
      await refreshSession()

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your avatar",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle avatar deletion
  const handleDeleteAvatar = async () => {
    if (!user || !avatarUrl) return

    setIsDeleting(true)

    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split("/")
      const filePath = urlParts.slice(urlParts.indexOf("user-content") + 1).join("/")

      // Delete file from storage
      const { error: deleteError } = await supabase.storage.from("user-content").remove([filePath])

      if (deleteError) throw deleteError

      // Update user profile
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id) // Using id based on the schema

      if (updateError) throw updateError

      // Update local state
      setAvatarUrl(null)

      // Refresh session to update user data
      await refreshSession()

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      })
    } catch (error) {
      console.error("Error deleting avatar:", error)
      toast({
        title: "Deletion failed",
        description: "There was a problem removing your avatar",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"

    const email = user.email || ""
    return email.charAt(0).toUpperCase()
  }

  return (
    <GlassAuthCard className="w-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Profile Picture</h2>
          <p className="text-sm text-muted-foreground">Upload a profile picture to personalize your account</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative"
          >
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={avatarUrl || undefined} alt="Profile" />
              <AvatarFallback className="text-4xl bg-primary/10">{getUserInitials()}</AvatarFallback>
            </Avatar>
            {(isUploading || isDeleting) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </motion.div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleFileSelect}
              disabled={isUploading || isDeleting}
              className="group"
            >
              <Camera className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              {avatarUrl ? "Change Picture" : "Upload Picture"}
            </Button>

            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteAvatar}
                disabled={isUploading || isDeleting}
                className="group text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Remove
              </Button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Recommended: Square image, at least 300x300 pixels. Maximum file size: 5MB.
          </p>
        </div>
      </div>
    </GlassAuthCard>
  )
}
