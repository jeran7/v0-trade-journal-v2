"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Shield, Loader2, Check, Info, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassAuthCard } from "@/components/ui/glass-auth-card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseAuthClient } from "@/lib/supabase/auth-client"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

// Password strength requirements
const passwordRequirements = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "number", label: "One number", regex: /[0-9]/ },
  { id: "special", label: "One special character", regex: /[^A-Za-z0-9]/ },
]

// Form validation schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>

export function SecuritySettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = getSupabaseAuthClient()

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Watch password for strength indicator
  const watchNewPassword = watch("newPassword", "")

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0

    let strength = 0
    passwordRequirements.forEach(({ regex }) => {
      if (regex.test(password)) strength += 20
    })

    return strength
  }

  const passwordStrength = calculatePasswordStrength(watchNewPassword)

  // Get strength color
  const getStrengthColor = (strength: number) => {
    if (strength <= 20) return "bg-red-500"
    if (strength <= 40) return "bg-orange-500"
    if (strength <= 60) return "bg-yellow-500"
    if (strength <= 80) return "bg-lime-500"
    return "bg-green-500"
  }

  // Load user settings
  useState(() => {
    const loadUserSettings = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("email_notifications")
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") throw error

        if (data) {
          setEmailNotifications(data.email_notifications ?? true)
        }

        // Check if 2FA is enabled (this is a placeholder - actual implementation would depend on Supabase setup)
        // In a real app, you would check the user's auth factors
        setTwoFactorEnabled(false)
      } catch (error) {
        console.error("Error loading security settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserSettings()
  })

  // Handle password change
  const onSubmit = async (data: PasswordChangeFormValues) => {
    if (!user) return

    setIsChangingPassword(true)

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
      })

      if (signInError) {
        toast({
          title: "Incorrect password",
          description: "Your current password is incorrect",
          variant: "destructive",
        })
        throw signInError
      }

      // Change password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) throw error

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      })

      reset()
    } catch (error) {
      console.error("Error changing password:", error)

      if ((error as any)?.message !== "Incorrect password") {
        toast({
          title: "Password change failed",
          description: "There was a problem changing your password",
          variant: "destructive",
        })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Handle email notification toggle
  const handleEmailNotificationsToggle = async (checked: boolean) => {
    if (!user) return

    setEmailNotifications(checked)

    try {
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
            email_notifications: checked,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        updateError = error
      } else {
        // Create new profile
        const { error } = await supabase.from("user_profiles").insert({
          user_id: user.id,
          email_notifications: checked,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        updateError = error
      }

      if (updateError) throw updateError

      toast({
        title: "Preferences updated",
        description: `Email notifications ${checked ? "enabled" : "disabled"}`,
      })
    } catch (error) {
      console.error("Error updating notification preferences:", error)
      setEmailNotifications(!checked) // Revert UI state

      toast({
        title: "Update failed",
        description: "There was a problem updating your preferences",
        variant: "destructive",
      })
    }
  }

  return (
    <GlassAuthCard className="w-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your account security and preferences</p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Password</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  {...register("currentPassword")}
                  className={`pl-10 pr-10 transition-all duration-300 ${
                    errors.currentPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showCurrentPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.currentPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.currentPassword.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  className={`pl-10 pr-10 transition-all duration-300 ${
                    errors.newPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.newPassword.message}
                </motion.p>
              )}

              {/* Password strength indicator */}
              {watchNewPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength</span>
                    <span className={passwordStrength === 100 ? "text-green-500" : "text-muted-foreground"}>
                      {passwordStrength === 0 && "Very weak"}
                      {passwordStrength === 20 && "Weak"}
                      {passwordStrength === 40 && "Fair"}
                      {passwordStrength === 60 && "Good"}
                      {passwordStrength === 80 && "Strong"}
                      {passwordStrength === 100 && "Very strong"}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className="h-1"
                    indicatorClassName={getStrengthColor(passwordStrength)}
                  />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {passwordRequirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-1">
                        {req.regex.test(watchNewPassword) ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Info className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={req.regex.test(watchNewPassword) ? "text-green-500" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  className={`pl-10 pr-10 transition-all duration-300 ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account Security</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-factor authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch
                id="two-factor"
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  // This would typically open a 2FA setup flow
                  toast({
                    title: "Feature coming soon",
                    description: "Two-factor authentication will be available soon",
                  })
                }}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email notifications</Label>
                <p className="text-sm text-muted-foreground">Receive security alerts and notifications</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={handleEmailNotificationsToggle}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sessions</h3>

          <div className="rounded-md border p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">Current session</p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()} · {navigator.userAgent.split(" ").slice(-1)[0]}
                </p>
              </div>
              <div className="flex h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => {
              toast({
                title: "Feature coming soon",
                description: "Session management will be available soon",
              })
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Manage All Sessions
          </Button>
        </div>
      </div>
    </GlassAuthCard>
  )
}
