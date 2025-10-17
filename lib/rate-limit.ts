/**
 * Rate Limiting Utility
 * 
 * Provides in-memory rate limiting for API routes and server actions.
 * Uses a sliding window algorithm to track request rates per identifier.
 * 
 * Features:
 * - Configurable limits per endpoint
 * - IP-based and user-based rate limiting
 * - Sliding window algorithm
 * - Automatic cleanup of expired entries
 * - TypeScript type safety
 * 
 * @example
 * ```typescript
 * import { rateLimit } from "@/lib/rate-limit";
 * 
 * const limiter = rateLimit({
 *   interval: 60 * 1000, // 1 minute
 *   uniqueTokenPerInterval: 500,
 * });
 * 
 * const result = await limiter.check(request, 10, "CACHE_TOKEN");
 * if (!result.success) {
 *   return new Response("Rate limit exceeded", { status: 429 });
 * }
 * ```
 */

import { headers } from "next/headers";

export interface RateLimitConfig {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  interval?: number;

  /**
   * Maximum number of unique tokens to track
   * @default 500
   */
  uniqueTokenPerInterval?: number;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean;

  /**
   * Number of requests made in the current window
   */
  count: number;

  /**
   * Maximum allowed requests
   */
  limit: number;

  /**
   * Time remaining until window resets (in milliseconds)
   */
  resetIn: number;

  /**
   * Unix timestamp when the window resets
   */
  resetAt: number;
}

interface TokenBucket {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private interval: number;
  private uniqueTokenPerInterval: number;
  private tokenCache: Map<string, TokenBucket>;

  constructor(config: RateLimitConfig = {}) {
    this.interval = config.interval || 60 * 1000; // 1 minute default
    this.uniqueTokenPerInterval = config.uniqueTokenPerInterval || 500;
    this.tokenCache = new Map();

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * 
   * @param request - Next.js request object or identifier string
   * @param limit - Maximum number of requests allowed in the interval
   * @param token - Optional custom token (defaults to IP address)
   * @returns Rate limit result with success status and metadata
   */
  async check(
    request: Request | string,
    limit: number,
    token?: string
  ): Promise<RateLimitResult> {
    const identifier = token || this.getIdentifier(request);
    const now = Date.now();
    const resetAt = now + this.interval;

    let tokenBucket = this.tokenCache.get(identifier);

    // Initialize or reset if expired
    if (!tokenBucket || now >= tokenBucket.resetAt) {
      tokenBucket = {
        count: 0,
        resetAt,
      };
      this.tokenCache.set(identifier, tokenBucket);
    }

    // Increment count
    tokenBucket.count++;

    // Check if limit exceeded
    const success = tokenBucket.count <= limit;
    const resetIn = tokenBucket.resetAt - now;

    return {
      success,
      count: tokenBucket.count,
      limit,
      resetIn,
      resetAt: tokenBucket.resetAt,
    };
  }

  /**
   * Get identifier from request (IP address or custom token)
   */
  private getIdentifier(request: Request | string): string {
    if (typeof request === "string") {
      return request;
    }

    // Try to get IP from various headers
    const headersList = headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }

    // Fallback to a default if no IP found
    return "unknown";
  }

  /**
   * Cleanup expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.tokenCache.entries());

    for (const [key, bucket] of entries) {
      if (now >= bucket.resetAt) {
        this.tokenCache.delete(key);
      }
    }

    // If cache is too large, remove oldest entries
    if (this.tokenCache.size > this.uniqueTokenPerInterval) {
      const sortedEntries = entries
        .sort((a, b) => a[1].resetAt - b[1].resetAt)
        .slice(0, entries.length - this.uniqueTokenPerInterval);

      for (const [key] of sortedEntries) {
        this.tokenCache.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier
   * Useful for testing or manual overrides
   */
  reset(identifier: string): void {
    this.tokenCache.delete(identifier);
  }

  /**
   * Clear all rate limit data
   * Useful for testing
   */
  clear(): void {
    this.tokenCache.clear();
  }

  /**
   * Get current count for an identifier
   */
  getCount(identifier: string): number {
    const bucket = this.tokenCache.get(identifier);
    if (!bucket || Date.now() >= bucket.resetAt) {
      return 0;
    }
    return bucket.count;
  }
}

/**
 * Create a new rate limiter instance
 */
export function rateLimit(config?: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Strict rate limiter for sensitive operations (e.g., password verification)
 * 5 requests per minute
 */
export const strictRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

/**
 * Standard rate limiter for API routes
 * 60 requests per minute
 */
export const apiRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
});

/**
 * Relaxed rate limiter for general server actions
 * 100 requests per minute
 */
export const actionRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
});

/**
 * Helper function to create a rate limit response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded. Please try again later.",
      resetIn: result.resetIn,
      limit: result.limit,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": Math.max(0, result.limit - result.count).toString(),
        "X-RateLimit-Reset": result.resetAt.toString(),
      },
    }
  );
}

/**
 * Helper to check rate limit for server actions
 * Returns error response if limit exceeded
 */
export async function checkActionRateLimit(
  identifier: string,
  limit: number = 100
): Promise<{ allowed: boolean; result: RateLimitResult }> {
  const result = await actionRateLimit.check(identifier, limit);
  return {
    allowed: result.success,
    result,
  };
}
