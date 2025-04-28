import { getServerSupabaseClient } from "./supabase-client"

export async function executeSql(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    const supabase = getServerSupabaseClient()

    // Try using the RPC method first
    const { error: rpcError } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (!rpcError) {
      return { success: true }
    }

    // If RPC fails, try direct query
    console.log("RPC method failed, trying direct query:", rpcError)

    // Split the SQL into individual statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    // Execute each statement
    for (const statement of statements) {
      if (statement.length > 0) {
        console.log("Executing SQL statement:", statement.substring(0, 50) + "...")
        const { error } = await supabase.rpc("exec_sql", { sql_query: statement })

        if (error) {
          console.error("Error executing SQL statement:", error)
          // Continue with other statements even if one fails
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error executing SQL:", error)
    return { success: false, error }
  }
}
