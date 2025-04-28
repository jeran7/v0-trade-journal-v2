import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // Ensure we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables for Supabase admin client")
      return NextResponse.json(
        { error: "Server configuration error. Missing required environment variables." },
        { status: 500 },
      )
    }

    // Create the Supabase admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get user session from cookies to verify authentication
    const authCookie = request.cookies.get("supabase-auth-token")?.value

    if (!authCookie) {
      console.error("No auth cookie found")
      return NextResponse.json({ error: "Authentication required. Please log in." }, { status: 401 })
    }

    try {
      // Parse the auth cookie
      const [, token] = JSON.parse(authCookie)

      if (!token) {
        console.error("Invalid auth token format")
        return NextResponse.json({ error: "Invalid authentication token. Please log in again." }, { status: 401 })
      }

      // Verify the token is valid (we don't need the user ID for this admin operation,
      // but we want to ensure the user is authenticated)
      const { data: userData, error: userError } = await supabase.auth.getUser(token)

      if (userError || !userData.user) {
        console.error("Error getting user from token:", userError)
        return NextResponse.json({ error: "Invalid or expired session. Please log in again." }, { status: 401 })
      }

      // Execute SQL to set up journal tables
      try {
        // Drop existing tables and policies (if they exist)
        await supabase.rpc("execute_sql", {
          sql: `
            DROP TABLE IF EXISTS journal_media CASCADE;
            DROP TABLE IF EXISTS journal_entries CASCADE;
          `,
        })

        // Create tables
        await supabase.rpc("execute_sql", {
          sql: `
            CREATE TABLE journal_entries (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES auth.users(id) NOT NULL,
              trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
              title TEXT NOT NULL,
              content JSONB NOT NULL,
              mood TEXT CHECK (mood IN ('confident', 'anxious', 'frustrated', 'calm', 'excited', 'neutral')) NOT NULL,
              lessons_learned TEXT,
              confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 10),
              tags TEXT[],
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE TABLE journal_media (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE NOT NULL,
              media_url TEXT NOT NULL,
              media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'document')) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        })

        // Apply RLS policies
        await supabase.rpc("execute_sql", {
          sql: `
            ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own journal entries"
            ON journal_entries FOR SELECT
            USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert their own journal entries"
            ON journal_entries FOR INSERT
            WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY "Users can update their own journal entries"
            ON journal_entries FOR UPDATE
            USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can delete their own journal entries"
            ON journal_entries FOR DELETE
            USING (auth.uid() = user_id);
            
            ALTER TABLE journal_media ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own journal media"
            ON journal_media FOR SELECT
            USING (
              EXISTS (
                SELECT 1 FROM journal_entries
                WHERE journal_entries.id = journal_media.journal_entry_id
                AND journal_entries.user_id = auth.uid()
              )
            );
            
            CREATE POLICY "Users can insert their own journal media"
            ON journal_media FOR INSERT
            WITH CHECK (
              EXISTS (
                SELECT 1 FROM journal_entries
                WHERE journal_entries.id = journal_media.journal_entry_id
                AND journal_entries.user_id = auth.uid()
              )
            );
            
            CREATE POLICY "Users can update their own journal media"
            ON journal_media FOR UPDATE
            USING (
              EXISTS (
                SELECT 1 FROM journal_entries
                WHERE journal_entries.id = journal_media.journal_entry_id
                AND journal_entries.user_id = auth.uid()
              )
            );
            
            CREATE POLICY "Users can delete their own journal media"
            ON journal_media FOR DELETE
            USING (
              EXISTS (
                SELECT 1 FROM journal_entries
                WHERE journal_entries.id = journal_media.journal_entry_id
                AND journal_entries.user_id = auth.uid()
              )
            );
          `,
        })

        // Check if the update_updated_at_column function exists
        const { data: functionExists, error: functionCheckError } = await supabase.rpc("execute_sql", {
          sql: `
            SELECT EXISTS (
              SELECT 1 FROM pg_proc
              WHERE proname = 'update_updated_at_column'
            );
          `,
        })

        if (functionCheckError) {
          console.error("Error checking for update_updated_at_column function:", functionCheckError)
        }

        // Create the function if it doesn't exist
        if (!functionExists || !functionExists[0] || !functionExists[0].exists) {
          await supabase.rpc("execute_sql", {
            sql: `
              CREATE OR REPLACE FUNCTION update_updated_at_column()
              RETURNS TRIGGER AS $$
              BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
              END;
              $$ LANGUAGE plpgsql;
            `,
          })
        }

        // Create trigger
        await supabase.rpc("execute_sql", {
          sql: `
            CREATE TRIGGER update_journal_entries_updated_at
            BEFORE UPDATE ON journal_entries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
          `,
        })

        return NextResponse.json({ success: true, message: "Journal tables setup successfully" })
      } catch (sqlError: any) {
        console.error("Error executing SQL:", sqlError)
        return NextResponse.json({ error: "Failed to set up journal tables: " + sqlError.message }, { status: 500 })
      }
    } catch (parseError) {
      console.error("Error parsing auth cookie:", parseError)
      return NextResponse.json({ error: "Invalid authentication data. Please log in again." }, { status: 401 })
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/setup-journal:", error)
    return NextResponse.json({ error: "Internal server error: " + (error as Error).message }, { status: 500 })
  }
}

// Also support GET for backward compatibility
export { POST as GET }
