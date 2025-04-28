"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Lock, ArrowRight, Loader2, Check, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassAuthCard } from "@/components/ui/glass-auth-card"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Progress } from "@/components/ui/progress"

// Password strength requirements
const passwordRequirements = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "number", label: "One number", regex: /[0-9]/ },
  { id: "special", label: "One special character", regex: /[^A-Za-z0-9]/ },
]

// Form validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const { changePassword } = useAuth()
  const router = useRouter()

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Watch password for strength indicator
  const watchPassword = watch("password", "")

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0

    let strength = 0
    passwordRequirements.forEach(({ regex }) => {
      if (regex.test(password)) strength += 20
    })

    return strength
  }

  const passwordStrength = calculatePasswordStrength(watchPassword)

  // Get strength color
  const getStrengthColor = (strength: number) => {
    if (strength <= 20) return "bg-red-500"
    if (strength <= 40) return "bg-orange-500"
    if (strength <= 60) return "bg-yellow-500"
    if (strength <= 80) return "bg-lime-500"
    return "bg-green-500"
  }

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsResetting(true)

    try {
      const { error } = await changePassword(data.password)

      if (error) throw error

      router.push("/auth/login?reset=success")
    } catch (error) {
      console.error("Password reset error:", error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <GlassAuthCard className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <motion.h1
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Reset Your Password
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Enter a new password for your account
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                autoComplete="new-password"
                {...register("password")}
                className={`pl-10 pr-10 transition-all duration-300 ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                }`}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-red-500 mt-1"
              >
                {errors.password.message}
              </motion.p>
            )}

            {/* Password strength indicator */}
            {watchPassword && (
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
                      {req.regex.test(watchPassword) ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Info className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={req.regex.test(watchPassword) ? "text-green-500" : "text-muted-foreground"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
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

          <Button type="submit" className="w-full group" disabled={isSubmitting || isResetting}>
            {isSubmitting || isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Reset Password
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      </div>
    </GlassAuthCard>
  )
}
