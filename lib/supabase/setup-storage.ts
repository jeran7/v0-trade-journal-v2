import { createClient } from "@/lib/supabase/supabase-client"

export async function setupStorage() {
  const supabase = createClient()

  // Create journal-media bucket if it doesn't exist
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error("Error listing buckets:", bucketsError)
    return { success: false, error: bucketsError }
  }

  const journalMediaBucketExists = buckets.some((bucket) => bucket.name === "journal-media")

  if (!journalMediaBucketExists) {
    const { error: createError } = await supabase.storage.createBucket("journal-media", {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    })

    if (createError) {
      console.error("Error creating journal-media bucket:", createError)
      return { success: false, error: createError }
    }

    // Set up RLS policies for the journal-media bucket
    const { error: policyError } = await supabase.storage.from("journal-media").createSignedUrl("test.txt", 60)

    if (policyError && policyError.message !== "The resource was not found") {
      console.error("Error setting up journal-media bucket policies:", policyError)
      return { success: false, error: policyError }
    }
  }

  return { success: true }
}
