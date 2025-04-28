"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Github, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { GlassAuthCard } from "@/components/ui/glass-auth-card"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"password" | "magic" | "oauth">("password")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { signIn, signInWithProvider, signInWithMagic, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Check for redirect reason
  useEffect(() => {
    const reason = searchParams.get("reason")
    if (reason === "session_expired") {
      setErrorMessage("Your session has expired. Please log in again.")
    }

    const status = searchParams.get("status")
    if (status === "verification_success") {
      setSuccessMessage("Email verified successfully! You can now log in.")
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true)
    setErrorMessage(null)

    try {
      if (loginMethod === "password") {
        console.log("Attempting login with email/password")
        const { error } = await signIn(data.email, data.password, data.rememberMe)
        if (error) {
          console.error("Login error:", error)
          setErrorMessage(error.message || "Invalid email or password. Please try again.")
          throw error
        }

        // Manual redirect to dashboard after successful login
        console.log("Login successful, redirecting to dashboard")
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      } else if (loginMethod === "magic") {
        const { error } = await signInWithMagic(data.email)
        if (error) {
          setErrorMessage(error.message || "Failed to send magic link. Please try again.")
          throw error
        }
        setSuccessMessage("Magic link sent! Check your email to continue.")
        reset()
        return
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Handle OAuth login
  const handleOAuthLogin = async (provider: "github" | "google" | "microsoft") => {
    setIsLoggingIn(true)
    setErrorMessage(null)

    try {
      await signInWithProvider(provider)
    } catch (error: any) {
      console.error("OAuth login error:", error)
      setErrorMessage(error.message || "Failed to sign in with provider. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Toggle between password and magic link login
  const toggleLoginMethod = (method: "password" | "magic" | "oauth") => {
    setLoginMethod(method)
    setErrorMessage(null)
    reset()
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
            Welcome Back
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Sign in to your trading journal account
          </motion.p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert
            variant="success"
            className="bg-green-50 text-green-800 border-green-200 animate-in fade-in-50 slide-in-from-top-5"
          >
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center space-x-2">
          <Button
            variant={loginMethod === "password" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleLoginMethod("password")}
            className="transition-all duration-300 px-3 sm:px-4"
          >
            Password
          </Button>
          <Button
            variant={loginMethod === "magic" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleLoginMethod("magic")}
            className="transition-all duration-300 px-3 sm:px-4"
          >
            Magic Link
          </Button>
          <Button
            variant={loginMethod === "oauth" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleLoginMethod("oauth")}
            className="transition-all duration-300 px-3 sm:px-4"
          >
            OAuth
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {loginMethod === "password" && (
            <motion.form
              key="password-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    {...register("email")}
                    className={`pl-10 transition-all duration-300 h-12 text-base ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                    }`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                    autoComplete="current-password"
                    {...register("password")}
                    className={`pl-10 pr-10 transition-all duration-300 h-12 text-base ${
                      errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                    }`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
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
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" {...register("rememberMe")} className="h-5 w-5" />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full group h-12 text-base" disabled={isSubmitting || isLoggingIn}>
                {isSubmitting || isLoggingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.form>
          )}

          {loginMethod === "magic" && (
            <motion.form
              key="magic-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    {...register("email")}
                    className={`pl-10 transition-all duration-300 h-12 text-base ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/20"
                    }`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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

              <p className="text-sm text-muted-foreground">
                We'll send a magic link to your email that will allow you to sign in without a password.
              </p>

              <Button type="submit" className="w-full group h-12 text-base" disabled={isSubmitting || isLoggingIn}>
                {isSubmitting || isLoggingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send Magic Link
                    <Mail className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.form>
          )}

          {loginMethod === "oauth" && (
            <motion.div
              key="oauth-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-sm text-center text-muted-foreground">Sign in with one of the following providers:</p>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-12 text-base"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={isLoggingIn}
                >
                  <Github className="mr-2 h-5 w-5" />
                  Continue with GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-12 text-base"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={isLoggingIn}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-12 text-base"
                  onClick={() => handleOAuthLogin("microsoft")}
                  disabled={isLoggingIn}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  Continue with Microsoft
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-medium text-primary hover:text-primary/90 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </GlassAuthCard>
  )
}
