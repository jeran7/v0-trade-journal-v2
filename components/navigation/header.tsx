"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Frame, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeSettings } from "@/components/ui/theme-settings"
import { UserMenu } from "@/components/navigation/user-menu"
import { useAuth } from "@/lib/supabase/auth-provider"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  // Check if current route is an auth route
  const isAuthRoute = pathname.startsWith("/auth")

  // Don't show header on auth routes
  if (isAuthRoute) {
    return null
  }

  return (
    <header
      className={cn(
        "h-14 flex items-center px-4 md:px-6 sticky top-0 z-30 bg-background",
        className,
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Frame className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Trading Journal</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/trades"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/trades") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Trades
            </Link>
            <Link
              href="/journal"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/journal") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Journal
            </Link>
            <Link
              href="/analytics"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/analytics") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Analytics
            </Link>
            <Link
              href="/playbook"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/playbook") ? "text-foreground" : "text-foreground/60",
              )}
            >
              Playbook
            </Link>
          </nav>
        </div>
        <Button variant="outline" size="icon" className="mr-2 md:hidden" aria-label="Toggle Menu">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="hidden md:block">{/* Search component would go here */}</div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSettings />
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
