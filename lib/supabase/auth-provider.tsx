"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User, Provider } from "@supabase/supabase-js"
import {
  getSupabaseAuthClient,
  signInWithEmail,
  signInWithOAuth,
  signInWithMagicLink,
  signUpWithEmail,
  resetPassword,
  updatePassword,
  signOut as supabaseSignOut,
  getCurrentSession,
  getCurrentUser,
} from "./auth-client"
import { AnimatePresence, motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

// Define the auth context type
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>
  signInWithProvider: (provider: Provider) => Promise<{ error: any }>
  signInWithMagic: (email: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any; needsEmailVerification?: boolean }>
  resetPasswordRequest: (email: string) => Promise<{ error: any }>
  changePassword: (newPassword: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => ({ error: null }),
  signInWithProvider: async () => ({ error: null }),
  signInWithMagic: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  resetPasswordRequest: async () => ({ error: null }),
  changePassword: async () => ({ error: null }),
  signOut: async () => {},
  refreshSession: async () => {},
})

// Protected routes that require authentication
const protectedRoutes = [
  "/trades",
  "/journal",
  "/analytics",
  "/playbook",
  "/brokers",
  "/profile",
  "/settings",
  "/dashboard",
]

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const supabase = getSupabaseAuthClient()

  // Check if current route is protected
  const isProtectedRoute = () => {
    if (!pathname) return false
    return protectedRoutes.some((route) => pathname.startsWith(route))
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...")
        // Get current session
        const {
          data: { session: currentSession },
        } = await getCurrentSession()

        console.log("Current session:", currentSession ? "exists" : "null")

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setIsAuthenticated(true)
          console.log("User authenticated:", currentSession.user.email)
        } else {
          console.log("No active session found")
          setSession(null)
          setUser(null)
          setIsAuthenticated(false)

          if (isProtectedRoute()) {
            console.log("Redirecting from protected route to login")
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        toast({
          title: "Authentication Error",
          description: "There was a problem with your authentication. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
        console.log("Auth initialization complete")
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log("User signed in or token refreshed")
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setIsAuthenticated(true)

        // Redirect to dashboard on sign in if on auth pages
        if (pathname === "/" || pathname?.startsWith("/auth")) {
          console.log("Redirecting to dashboard after sign in")
          router.push("/dashboard")
        }
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        console.log("User signed out or deleted")
        setSession(null)
        setUser(null)
        setIsAuthenticated(false)

        if (isProtectedRoute()) {
          console.log("Redirecting to login after sign out")
          router.push("/auth/login")
        }
      }
    })

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [router, toast, pathname])

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true)
    try {
      console.log("Signing in with email:", email)
      const { data, error } = await signInWithEmail(email, password)

      if (error) {
        console.error("Sign in error:", error)
        throw error
      }

      if (data.session) {
        console.log("Sign in successful, session established")
        setSession(data.session)
        setUser(data.user)
        setIsAuthenticated(true)

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("supabase.auth.token", data.session.access_token)
        }

        // Get redirect URL from query params or default to dashboard
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get("redirect") || "/dashboard"
        console.log("Redirecting to:", redirectTo)

        // Force a small delay to ensure state is updated before redirect
        setTimeout(() => {
          router.push(redirectTo)
        }, 100)

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
      }

      return { error: null }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign in with OAuth provider
  const signInWithProvider = async (provider: Provider) => {
    setIsLoading(true)
    try {
      console.log("Signing in with provider:", provider)
      const { data, error } = await signInWithOAuth(provider)

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      console.error("OAuth sign in error:", error)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign in with magic link
  const signInWithMagic = async (email: string) => {
    setIsLoading(true)
    try {
      console.log("Sending magic link to:", email)
      const { data, error } = await signInWithMagicLink(email)

      if (error) throw error

      toast({
        title: "Magic link sent",
        description: "Check your email for a magic link to sign in.",
      })

      return { error: null }
    } catch (error: any) {
      console.error("Magic link error:", error)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Signing up with email:", email)
      const { data, error } = await signUpWithEmail(email, password)

      if (error) throw error

      // Check if email confirmation is required
      const needsEmailVerification = !data.session

      if (data.session) {
        console.log("Sign up successful, session established")
        setSession(data.session)
        setUser(data.user)
        setIsAuthenticated(true)

        // Force a small delay to ensure state is updated before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)

        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        })
      } else {
        console.log("Email verification required")
        toast({
          title: "Verification required",
          description: "Please check your email to verify your account.",
        })
      }

      return { error: null, needsEmailVerification }
    } catch (error: any) {
      console.error("Sign up error:", error)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  // Request password reset
  const resetPasswordRequest = async (email: string) => {
    setIsLoading(true)
    try {
      console.log("Requesting password reset for:", email)
      const { error } = await resetPassword(email)

      if (error) throw error

      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      })

      return { error: null }
    } catch (error: any) {
      console.error("Password reset error:", error)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  // Change password
  const changePassword = async (newPassword: string) => {
    setIsLoading(true)
    try {
      console.log("Changing password")
      const { error } = await updatePassword(newPassword)

      if (error) throw error

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })

      return { error: null }
    } catch (error: any) {
      console.error("Password change error:", error)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setIsLoading(true)
    try {
      console.log("Signing out")
      await supabaseSignOut()
      setSession(null)
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem("supabase.auth.token")

      // Force a small delay to ensure state is updated before redirect
      setTimeout(() => {
        router.push("/auth/login")
      }, 100)

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast({
        title: "Sign out failed",
        description: error.message || "There was a problem signing out.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      console.log("Refreshing session")
      const {
        data: { user: currentUser },
      } = await getCurrentUser()
      if (currentUser) {
        console.log("Session refreshed for user:", currentUser.email)
        setUser(currentUser)
      }
    } catch (error) {
      console.error("Session refresh error:", error)
    }
  }

  // Create the auth context value
  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signInWithProvider,
    signInWithMagic,
    signUp,
    resetPasswordRequest,
    changePassword,
    signOut,
    refreshSession,
  }

  // Render the auth provider with loading state
  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading authentication...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
