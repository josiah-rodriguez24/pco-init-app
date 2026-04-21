// ---------------------------------------------------------------------------
// Rate-limit header extraction and sleep utilities.
//
// Planning Center returns these headers on every response:
//   X-PCO-API-Request-Rate-Count  — requests made in the current window
//   X-PCO-API-Request-Rate-Limit  — max requests allowed per window
//   X-PCO-API-Request-Rate-Period — window duration in seconds
//   Retry-After                   — seconds to wait (on 429)
// ---------------------------------------------------------------------------

export interface RateLimitInfo {
  count: number | null;
  limit: number | null;
  period: number | null;
  retryAfter: number | null;
}

/**
 * Extract rate-limit metadata from response headers.
 */
export function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
  return {
    count: parseIntHeader(headers, "X-PCO-API-Request-Rate-Count"),
    limit: parseIntHeader(headers, "X-PCO-API-Request-Rate-Limit"),
    period: parseIntHeader(headers, "X-PCO-API-Request-Rate-Period"),
    retryAfter: parseIntHeader(headers, "Retry-After"),
  };
}

function parseIntHeader(headers: Headers, name: string): number | null {
  const raw = headers.get(name);
  if (raw === null) return null;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Sleep for the given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log rate-limit status for debugging. Only logs when approaching the limit.
 */
export function logRateLimitStatus(info: RateLimitInfo, endpoint: string): void {
  if (info.count !== null && info.limit !== null) {
    const ratio = info.count / info.limit;
    if (ratio > 0.8) {
      console.warn(
        `[PCO Rate Limit] ${endpoint}: ${info.count}/${info.limit} requests used (${Math.round(ratio * 100)}%)`
      );
    }
  }
}
