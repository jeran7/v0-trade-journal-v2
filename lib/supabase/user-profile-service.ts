import { getServerSupabaseClient, getSupabaseClient } from "./supabase-client"

export type UserProfile = {
  id: string // Primary key, references auth.users(id)
  display_name?: string | null
  full_name?: string | null
  avatar_url: string | null
  trading_experience: "beginner" | "intermediate" | "advanced" | "professional" | null
  subscription_tier?: string
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export type UserProfileInput = Omit<UserProfile, "id" | "created_at" | "updated_at" | "subscription_tier">

// Client-side functions
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return null

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.user.id).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data as UserProfile
}

export const updateUserProfile = async (profile: Partial<UserProfileInput>): Promise<UserProfile | null> => {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return null

  const { data, error } = await supabase.from("user_profiles").update(profile).eq("id", user.user.id).select().single()

  if (error) {
    console.error("Error updating user profile:", error)
    return null
  }

  return data as UserProfile
}

// Server-side functions
export const createUserProfileOnSignUp = async (userId: string, email: string): Promise<void> => {
  const supabase = getServerSupabaseClient()

  // Check if profile already exists
  const { data: existingProfile } = await supabase.from("user_profiles").select("id").eq("id", userId).single()

  if (existingProfile) return

  // Create new profile
  const displayName = email.split("@")[0] // Default display name from email

  const { error } = await supabase.from("user_profiles").insert({
    id: userId, // Primary key, references auth.users(id)
    display_name: displayName,
    avatar_url: null,
    trading_experience: null,
    subscription_tier: "free",
    preferences: {},
  })

  if (error) {
    console.error("Error creating user profile:", error)
  }
}

export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile by ID:", error)
    return null
  }

  return data as UserProfile
}
