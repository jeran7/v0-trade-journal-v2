import { createClient } from "@supabase/supabase-js"
import type { Provider } from "@supabase/supabase-js"

// Initialize the Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

// Get the Supabase client for authentication
export const getSupabaseAuthClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "supabase.auth.token",
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }

  return supabaseClient
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// Sign in with OAuth provider
export const signInWithOAuth = async (provider: Provider) => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

// Sign in with magic link
export const signInWithMagicLink = async (email: string) => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

// Reset password
export const resetPassword = async (email: string) => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
}

// Update password
export const updatePassword = async (password: string) => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.updateUser({
    password,
  })
}

// Sign out
export const signOut = async () => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.signOut()
}

// Get current session
export const getCurrentSession = async () => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.getSession()
}

// Get current user
export const getCurrentUser = async () => {
  const supabase = getSupabaseAuthClient()
  return await supabase.auth.getUser()
}
