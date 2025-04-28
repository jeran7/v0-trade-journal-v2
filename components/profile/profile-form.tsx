"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2, Save, User, Briefcase, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlassAuthCard } from "@/components/ui/glass-auth-card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseAuthClient } from "@/lib/supabase/auth-client"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Form validation schema
const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
  trading_experience: z.enum(["beginner", "intermediate", "advanced", "professional"]).optional(),
  trading_style: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  default_position_size: z.number().min(0).optional(),
  risk_tolerance: z.number().min(1).max(10).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  const { user, refreshSession } = useAuth()
  const supabase = getSupabaseAuthClient()

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      trading_experience: "beginner",
      trading_style: "",
      bio: "",
      default_position_size: 1,
      risk_tolerance: 5,
    },
  })

  // Fetch user profile data
  const fetchProfileData = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (error) throw error

      if (data) {
        // Set form values
        setValue("full_name", data.full_name || "")
        setValue("trading_experience", data.trading_experience || "beginner")
        setValue("trading_style", data.trading_style || "")
        setValue("bio", data.bio || "")
        setValue("default_position_size", data.default_position_size || 1)
        setValue("risk_tolerance", data.risk_tolerance || 5)

        // Reset form state
        reset({
          full_name: data.full_name || "",
          trading_experience: data.trading_experience || "beginner",
          trading_style: data.trading_style || "",
          bio: data.bio || "",
          default_position_size: data.default_position_size || 1,
          risk_tolerance: data.risk_tolerance || 5,
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    }
  }

  // Load profile data on component mount
  useState(() => {
    fetchProfileData()
  })

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return

    setIsUpdating(true)

    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
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
            full_name: data.full_name,
            trading_experience: data.trading_experience,
            trading_style: data.trading_style,
            bio: data.bio,
            default_position_size: data.default_position_size,
            risk_tolerance: data.risk_tolerance,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        updateError = error
      } else {
        // Create new profile
        const { error } = await supabase.from("user_profiles").insert({
          user_id: user.id,
          full_name: data.full_name,
          trading_experience: data.trading_experience,
          trading_style: data.trading_style,
          bio: data.bio,
          default_position_size: data.default_position_size,
          risk_tolerance: data.risk_tolerance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        updateError = error
      }

      if (updateError) throw updateError

      // Refresh session to update user data
      await refreshSession()

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Reset form state
      reset(data)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <GlassAuthCard className="w-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Profile Information</h2>
          <p className="text-sm text-muted-foreground">Update your personal information and trading preferences</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <Input
                  id="full_name"
                  placeholder="Your name"
                  {...register("full_name")}
                  className={`pl-10 transition-all duration-300 ${
                    errors.full_name ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                  }`}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.full_name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.full_name.message}
                </motion.p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trading_experience">Trading Experience</Label>
                <div className="relative">
                  <Select
                    defaultValue={watch("trading_experience") || "beginner"}
                    onValueChange={(value) => setValue("trading_experience", value as any)}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trading_style">Trading Style</Label>
                <div className="relative">
                  <Input
                    id="trading_style"
                    placeholder="Day Trader, Swing Trader, etc."
                    {...register("trading_style")}
                    className="pl-10"
                  />
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your trading journey"
                {...register("bio")}
                className={`min-h-[100px] transition-all duration-300 ${
                  errors.bio ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                }`}
              />
              {errors.bio && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.bio.message}
                </motion.p>
              )}
              <p className="text-xs text-muted-foreground text-right">{watch("bio")?.length || 0}/500 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_position_size">Default Position Size</Label>
                <Input
                  id="default_position_size"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("default_position_size", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_tolerance">Risk Tolerance (1-10)</Label>
                <Input
                  id="risk_tolerance"
                  type="number"
                  min="1"
                  max="10"
                  {...register("risk_tolerance", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto group" disabled={isUpdating || !isDirty}>
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>
    </GlassAuthCard>
  )
}
