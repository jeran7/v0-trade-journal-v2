import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create a new ratelimiter that allows 10 requests per 5 minutes
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function rateLimiter(
  limit = 10,
  duration = "5m",
  identifier?: string,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    // Parse duration string (e.g., "5m", "1h")
    const durationValue = Number.parseInt(duration.slice(0, -1))
    const durationUnit = duration.slice(-1)

    let durationInSeconds: number

    switch (durationUnit) {
      case "s":
        durationInSeconds = durationValue
        break
      case "m":
        durationInSeconds = durationValue * 60
        break
      case "h":
        durationInSeconds = durationValue * 60 * 60
        break
      case "d":
        durationInSeconds = durationValue * 24 * 60 * 60
        break
      default:
        durationInSeconds = 300 // Default to 5 minutes
    }

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${durationInSeconds}s`),
      analytics: true,
    })

    // Use provided identifier or default to "global"
    const id = identifier || "global"

    // Rate limit based on identifier
    const { success, limit: rateLimit, remaining, reset } = await ratelimit.limit(id)

    return { success, limit: rateLimit, remaining, reset }
  } catch (error) {
    console.error("Rate limiter error:", error)
    // If rate limiting fails, allow the request to proceed
    return { success: true, limit: limit, remaining: limit, reset: Date.now() + 300000 }
  }
}
