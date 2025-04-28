"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = "/auth/login" }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth check error:", error)
          setIsAuthenticated(false)

          // Add the current path as a redirect parameter
          const currentPath = window.location.pathname
          const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`

          toast({
            title: "Authentication Required",
            description: "Please log in to continue",
            variant: "destructive",
          })

          router.push(redirectPath)
          return
        }

        if (data.session) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)

          // Add the current path as a redirect parameter
          const currentPath = window.location.pathname
          const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`

          toast({
            title: "Authentication Required",
            description: "Please log in to continue",
            variant: "destructive",
          })

          router.push(redirectPath)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)

        // Add the current path as a redirect parameter
        const currentPath = window.location.pathname
        const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`

        router.push(redirectPath)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setIsAuthenticated(false)

        // Add the current path as a redirect parameter
        const currentPath = window.location.pathname
        const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`

        toast({
          title: "Authentication Required",
          description: "Please log in to continue",
          variant: "destructive",
        })

        router.push(redirectPath)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, toast, redirectTo, supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
