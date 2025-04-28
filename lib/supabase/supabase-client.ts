import { createClient } from "@supabase/supabase-js"

// Create a singleton instance of the Supabase client to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "supabase.auth.token",
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return supabaseInstance
}

// Server-side client with admin privileges
export const getServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Alias for backward compatibility
export const createServerSupabaseClient = getServerSupabaseClient

// Export createClient for direct usage
export { createClient }
