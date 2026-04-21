import { buildAuthHeaders } from "./auth";
import {
  parseRateLimitHeaders,
  logRateLimitStatus,
  sleep,
  type RateLimitInfo,
} from "./rate-limit";
import { PcoApiError } from "@/lib/errors";
import type { JsonApiResource } from "./types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PCO_BASE_URL = "https://api.planningcenteronline.com/services/v2";

const MAX_GET_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 2_000;

// ---------------------------------------------------------------------------
// Response type returned to callers
// ---------------------------------------------------------------------------

export interface PcoResponse<T> {
  data: T;
  included?: JsonApiResource[];
  links?: Record<string, string>;
  meta?: Record<string, unknown>;
  rateLimit: RateLimitInfo;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Make an authenticated request to the Planning Center Services API.
 *
 * - Attaches PAT auth headers automatically.
 * - Parses and returns rate-limit metadata from every response.
 * - Retries GET requests on 429 (up to MAX_GET_RETRIES), respecting Retry-After.
 * - Non-GET requests are NEVER retried (to avoid accidental mutations).
 * - Throws `PcoApiError` on non-2xx responses after exhausting retries.
 *
 * TODO: Add Redis cache-aside here when caching layer is introduced.
 */
export async function pcoFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<PcoResponse<T>> {
  const url = path.startsWith("http") ? path : `${PCO_BASE_URL}${path}`;
  const method = (options.method ?? "GET").toUpperCase();
  const isGet = method === "GET";

  let lastError: PcoApiError | null = null;
  const maxAttempts = isGet ? MAX_GET_RETRIES : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(url, {
      ...options,
      method,
      // Auth headers are spread LAST so they always override any caller-provided
      // Authorization header. This prevents accidental credential leakage.
      // TODO: When adding Redis cache-aside, check the cache before this fetch call
      //       (GET only) and populate it from the response when it's a cache miss.
      headers: {
        ...options.headers,
        ...buildAuthHeaders(),
      },
    });

    const rateLimit = parseRateLimitHeaders(response.headers);
    logRateLimitStatus(rateLimit, path);

    if (response.ok) {
      const body = await response.json();
      return {
        data: body.data as T,
        included: body.included,
        links: body.links,
        meta: body.meta,
        rateLimit,
      };
    }

    // Handle 429 Too Many Requests — retry only GETs
    if (response.status === 429 && isGet && attempt < maxAttempts) {
      const delaySeconds = rateLimit.retryAfter ?? DEFAULT_RETRY_DELAY_MS / 1000;
      console.warn(
        `[PCO Client] 429 on ${path} — retrying in ${delaySeconds}s (attempt ${attempt}/${maxAttempts})`
      );
      await sleep(delaySeconds * 1000);
      continue;
    }

    // Build error from response
    let responseBody: unknown = null;
    try {
      responseBody = await response.json();
    } catch {
      // non-JSON error body — ignore
    }

    lastError = new PcoApiError({
      message: `PCO API ${method} ${path} returned ${response.status}`,
      pcoStatus: response.status,
      retryAfter: rateLimit.retryAfter,
      responseBody,
    });

    // Don't retry non-429 errors or non-GET requests
    if (response.status !== 429 || !isGet) {
      throw lastError;
    }
  }

  // Exhausted all retries
  throw lastError ?? new PcoApiError({
    message: `PCO API ${method} ${path} failed after ${maxAttempts} attempts`,
    pcoStatus: 429,
  });
}

/**
 * Convenience: GET request to a PCO endpoint.
 */
export function pcoGet<T = unknown>(
  path: string,
  params?: Record<string, string>
): Promise<PcoResponse<T>> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return pcoFetch<T>(`${path}${query}`);
}
