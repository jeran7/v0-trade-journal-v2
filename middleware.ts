import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  return res
}

// Specify which routes should trigger this middleware
export const config = {
  matcher: [
    "/api/journal/:path*",
    "/api/trades/:path*",
    "/api/admin/:path*",
    "/journal/:path*",
    "/trades/:path*",
    "/playbook/:path*",
    "/analytics/:path*",
    "/dashboard",
    "/profile",
  ],
}
