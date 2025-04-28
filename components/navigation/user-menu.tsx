"use client"

import { useAuth } from "@/lib/supabase/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return null
  }

  const initials = user.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
        <Avatar className="h-8 w-8 transition-transform duration-200 hover:scale-105">
          <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || ""} />
          <AvatarFallback className="text-xs bg-primary/10">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 overflow-hidden scale-in-animation" sideOffset={8}>
        <DropdownMenuLabel className="px-4 py-3 border-b">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.user_metadata?.name || user.email?.split("@")[0]}
            </p>
          </div>
        </DropdownMenuLabel>
        <div className="py-2">
          <DropdownMenuItem
            asChild
            className="px-4 py-2 cursor-pointer transition-colors hover:bg-secondary focus:bg-secondary"
          >
            <Link href="/profile" className="flex w-full items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <DropdownMenuItem
            className="px-4 py-2 cursor-pointer flex items-center text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
