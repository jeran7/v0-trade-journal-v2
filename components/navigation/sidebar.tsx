"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BookOpen, Frame, Home, LineChart, List, Settings, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserMenu } from "@/components/navigation/user-menu"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  // Don't show sidebar on auth routes
  if (pathname.startsWith("/auth")) {
    return null
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen w-[80px] flex-col border-r bg-background transition-all lg:w-[240px] overflow-hidden",
        className,
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <Frame className="h-6 w-6" />
          <span className="hidden text-lg font-bold lg:inline-block truncate">Trading Journal</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="grid gap-1">
          <li>
            <Link
              href="/"
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname === "/" && "bg-accent text-accent-foreground",
              )}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:inline-block truncate">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/trades"
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/trades") && "bg-accent text-accent-foreground",
              )}
            >
              <List className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:inline-block truncate">Trades</span>
            </Link>
          </li>
          <li>
            <Link
              href="/journal"
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/journal") && "bg-accent text-accent-foreground",
              )}
            >
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:inline-block truncate">Journal</span>
            </Link>
          </li>
          <li>
            <Link
              href="/analytics"
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/analytics") && "bg-accent text-accent-foreground",
              )}
            >
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:inline-block truncate">Analytics</span>
            </Link>
          </li>
          <li>
            <Link
              href="/playbook"
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/playbook") && "bg-accent text-accent-foreground",
              )}
            >
              <LineChart className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:inline-block truncate">Playbook</span>
            </Link>
          </li>
          <li>
            <Link
              href="/brokers"
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/brokers") && "bg-accent text-accent-foreground",
              )}
            >
              <Wallet className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:inline-block truncate">Brokers</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="border-t p-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex justify-end overflow-hidden">
                <UserMenu />
              </div>
            ) : (
              <Button asChild size="sm" className="hidden lg:flex">
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
          </div>
          <Link
            href="/profile"
            className={cn(
              "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/profile") && "bg-accent text-accent-foreground",
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span className="hidden lg:inline-block truncate">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
