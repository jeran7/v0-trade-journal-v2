"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassAuthCard } from "@/components/ui/glass-auth-card"
import { useAuth } from "@/lib/supabase/auth-provider"

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { resetPasswordRequest } = useAuth()

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true)

    try {
      const { error } = await resetPasswordRequest(data.email)

      if (error) throw error

      setResetSent(true)
      reset()
    } catch (error) {
      console.error("Password reset error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GlassAuthCard className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {resetSent ? (
          <motion.div
            key="reset-sent"
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
                We've sent you a password reset link. Please check your email to reset your password.
              </p>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setResetSent(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reset
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive an email?{" "}
                <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setResetSent(false)}>
                  Try again
                </Button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reset-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password
              </p>
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

              <Button type="submit" className="w-full group" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="font-medium text-primary hover:text-primary/90 transition-colors">
                <ArrowLeft className="inline-block mr-1 h-3 w-3" />
                Back to login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassAuthCard>
  )
}
