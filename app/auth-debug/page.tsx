"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getSupabaseAuthClient } from "@/lib/supabase/auth-client"

export default function AuthDebugPage() {
  const { user, session, isAuthenticated, isLoading, signOut } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const supabase = getSupabaseAuthClient()
        const { data } = await supabase.auth.getSession()
        setSessionData(data)
      } catch (error) {
        console.error("Error fetching session data:", error)
      }
    }

    fetchSessionData()
  }, [])

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>View your current authentication state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Authentication Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Is Authenticated:</div>
              <div>{isAuthenticated ? "Yes ✅" : "No ❌"}</div>
              <div className="font-medium">Is Loading:</div>
              <div>{isLoading ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">User Information</h3>
            {user ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">User ID:</div>
                <div>{user.id}</div>
                <div className="font-medium">Email:</div>
                <div>{user.email}</div>
                <div className="font-medium">Created At:</div>
                <div>{new Date(user.created_at).toLocaleString()}</div>
                <div className="font-medium">Last Sign In:</div>
                <div>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No user is currently authenticated</div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Session Information</h3>
            {session ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Session ID:</div>
                <div>{session.access_token ? "Valid (token hidden)" : "No access token"}</div>
                <div className="font-medium">Expires At:</div>
                <div>{session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : "No expiration"}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No active session</div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Raw Session Data</h3>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-40">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={() => handleNavigate("/dashboard")}>Go to Dashboard</Button>
          <Button onClick={() => handleNavigate("/trades")}>Go to Trades</Button>
          <Button onClick={() => handleNavigate("/auth/login")}>Go to Login</Button>
          {isAuthenticated && (
            <Button variant="destructive" onClick={() => signOut()}>
              Sign Out
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
