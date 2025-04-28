import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with the cookies
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key to bypass RLS
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if the request is multipart/form-data or JSON
    const contentType = request.headers.get("content-type") || ""

    let tradeId: string
    let screenshotUrl: string
    let screenshotType: string

    if (contentType.includes("multipart/form-data")) {
      // Handle form data
      const formData = await request.formData()
      tradeId = formData.get("trade_id") as string
      screenshotUrl = formData.get("screenshot_url") as string
      screenshotType = (formData.get("screenshot_type") as string) || "other"

      // If a file was uploaded, handle it
      const file = formData.get("file") as File

      if (file) {
        // Create a unique filename
        const timestamp = new Date().getTime()
        const fileName = `${userId}/${tradeId}/${timestamp}-${file.name}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("trade-screenshots")
          .upload(fileName, file)

        if (uploadError) {
          console.error("Error uploading screenshot:", uploadError)
          return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from("trade-screenshots").getPublicUrl(uploadData.path)

        screenshotUrl = urlData.publicUrl
      }
    } else {
      // Handle JSON
      const body = await request.json()
      tradeId = body.trade_id
      screenshotUrl = body.screenshot_url
      screenshotType = body.screenshot_type || "other"
    }

    // Verify that the trade belongs to the user
    const { data: trade, error: tradeError } = await supabase
      .from("trades")
      .select("user_id")
      .eq("id", tradeId)
      .single()

    if (tradeError) {
      console.error("Error fetching trade:", tradeError)
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    if (trade.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Insert the screenshot record
    const { data: screenshot, error } = await supabase
      .from("trade_screenshots")
      .insert({
        trade_id: tradeId,
        screenshot_url: screenshotUrl,
        screenshot_type: screenshotType,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating screenshot record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ screenshot })
  } catch (error) {
    console.error("Error in POST /api/trades/screenshots:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with the cookies
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })

    // Get the user from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get query parameters
    const url = new URL(request.url)
    const tradeId = url.searchParams.get("trade_id")

    if (!tradeId) {
      return NextResponse.json({ error: "Trade ID is required" }, { status: 400 })
    }

    // Verify that the trade belongs to the user
    const { data: trade, error: tradeError } = await supabase
      .from("trades")
      .select("user_id")
      .eq("id", tradeId)
      .single()

    if (tradeError) {
      console.error("Error fetching trade:", tradeError)
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    if (trade.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Query screenshots
    const { data: screenshots, error } = await supabase.from("trade_screenshots").select("*").eq("trade_id", tradeId)

    if (error) {
      console.error("Error fetching screenshots:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ screenshots })
  } catch (error) {
    console.error("Error in GET /api/trades/screenshots:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
