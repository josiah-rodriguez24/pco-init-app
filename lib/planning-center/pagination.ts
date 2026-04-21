import { pcoFetch, type PcoResponse } from "./client";
import type { JsonApiResource } from "./types";

// ---------------------------------------------------------------------------
// Pagination helper for Planning Center's offset-based pagination.
//
// PCO returns `links.next` on collection responses when more pages exist.
// This helper follows that link until exhausted or a safety cap is reached.
//
// PCO pagination params (from spec):
//   offset  — integer, min 0, default 0
//   per_page — integer, min 1, max 100, default 25
// ---------------------------------------------------------------------------

const DEFAULT_MAX_PAGES = 50;
const DEFAULT_PER_PAGE = 100; // PCO max per page

export interface PaginationOptions {
  perPage?: number;
  maxPages?: number;
}

/** Aggregated result of a paginated fetch — data + sideloaded included. */
export interface PaginatedResult<TAttributes> {
  data: JsonApiResource<TAttributes>[];
  included: JsonApiResource[];
}

/**
 * Fetch all pages of a paginated PCO collection endpoint.
 *
 * Returns all primary resources AND all sideloaded `included` resources
 * collected across every page. Stops when:
 * 1. There is no `links.next` in the response, or
 * 2. The safety cap (`maxPages`) is reached.
 */
export async function fetchAllPages<TAttributes = Record<string, unknown>>(
  path: string,
  options: PaginationOptions = {}
): Promise<PaginatedResult<TAttributes>> {
  const perPage = options.perPage ?? DEFAULT_PER_PAGE;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const allData: JsonApiResource<TAttributes>[] = [];
  const allIncluded: JsonApiResource[] = [];

  let nextUrl: string | null = `${path}${path.includes("?") ? "&" : "?"}per_page=${perPage}`;
  let page = 0;

  while (nextUrl && page < maxPages) {
    const response: PcoResponse<JsonApiResource<TAttributes>[]> =
      await pcoFetch<JsonApiResource<TAttributes>[]>(nextUrl);

    if (Array.isArray(response.data)) {
      allData.push(...response.data);
    }
    if (Array.isArray(response.included)) {
      allIncluded.push(...response.included);
    }

    nextUrl = response.links?.next ?? null;
    page++;

    if (page >= maxPages && nextUrl) {
      console.warn(
        `[PCO Pagination] Reached max pages (${maxPages}) for ${path}. ` +
          `Collected ${allData.length} items so far.`
      );
    }
  }

  return { data: allData, included: allIncluded };
}
