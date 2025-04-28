"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Check, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { GlassAuthCard } from "@/components/ui/glass-auth-card"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Separator } from "@/components/ui/separator"
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
const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const { signUp } = useAuth()

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
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
  const onSubmit = async (data: RegisterFormValues) => {
    setIsRegistering(true)

    try {
      const { error, needsEmailVerification } = await signUp(data.email, data.password)

      if (error) throw error

      if (needsEmailVerification) {
        setVerificationSent(true)
        reset()
      }

      // Redirect will be handled in the auth provider
    } catch (error) {
      console.error("Registration error:", error)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <GlassAuthCard className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {verificationSent ? (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We've sent you a verification link. Please check your email to verify your account.
              </p>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setVerificationSent(false)}>
                Back to Sign Up
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive an email?{" "}
                <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setVerificationSent(false)}>
                  Try again
                </Button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
              <p className="text-sm text-muted-foreground">Sign up for your trading journal account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    {...register("email")}
                    className={`pl-10 transition-all duration-300 ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                    }`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
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
                    placeholder="Confirm password"
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

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="accept-terms"
                    {...register("acceptTerms")}
                    className={errors.acceptTerms ? "border-red-500" : ""}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="accept-terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the{" "}
                      <Link href="/terms" className="text-primary hover:text-primary/90 transition-colors">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:text-primary/90 transition-colors">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.acceptTerms.message}
                  </motion.p>
                )}
              </div>

              <Button type="submit" className="w-full group" disabled={isSubmitting || isRegistering}>
                {isSubmitting || isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassAuthCard>
  )
}
