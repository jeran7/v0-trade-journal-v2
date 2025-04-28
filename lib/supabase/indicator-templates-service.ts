import { getSupabaseClient } from "./supabase-client"

export interface IndicatorTemplate {
  id?: string
  user_id: string
  name: string
  indicator_type: string
  settings: any
  is_public: boolean
  created_at?: string
  updated_at?: string
}

// Save an indicator template
export async function saveIndicatorTemplate(template: IndicatorTemplate): Promise<IndicatorTemplate | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("indicator_templates")
    .upsert(
      {
        ...template,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single()

  if (error) {
    console.error("Error saving indicator template:", error)
    return null
  }

  return data as IndicatorTemplate
}

// Get indicator templates
export async function getIndicatorTemplates(userId?: string): Promise<IndicatorTemplate[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from("indicator_templates").select("*")

  // If userId is provided, get user's private templates and all public templates
  if (userId) {
    query = query.or(`user_id.eq.${userId},is_public.eq.true`)
  } else {
    // Otherwise, only get public templates
    query = query.eq("is_public", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching indicator templates:", error)
    return []
  }

  return data as IndicatorTemplate[]
}

// Delete an indicator template
export async function deleteIndicatorTemplate(id: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("indicator_templates").delete().eq("id", id).eq("user_id", userId) // Ensure user can only delete their own templates

  if (error) {
    console.error("Error deleting indicator template:", error)
    return false
  }

  return true
}

// Get templates by indicator type
export async function getTemplatesByType(indicatorType: string, userId?: string): Promise<IndicatorTemplate[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from("indicator_templates").select("*").eq("indicator_type", indicatorType)

  // If userId is provided, get user's private templates and all public templates
  if (userId) {
    query = query.or(`user_id.eq.${userId},is_public.eq.true`)
  } else {
    // Otherwise, only get public templates
    query = query.eq("is_public", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching indicator templates by type:", error)
    return []
  }

  return data as IndicatorTemplate[]
}
