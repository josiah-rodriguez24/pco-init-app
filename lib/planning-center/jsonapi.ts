import type { JsonApiResource, JsonApiResourceIdentifier } from "./types";

// ---------------------------------------------------------------------------
// JSON:API included[] lookup helpers.
//
// PCO collection responses can include sideloaded resources via `?include=`.
// This module builds a lookup map for efficient access and provides type-safe
// extractors for relationship resolution.
// ---------------------------------------------------------------------------

/**
 * Build a quick lookup map from an `included[]` array, keyed by "type:id".
 */
export function buildIncludedMap(
  included: JsonApiResource[] | undefined
): Map<string, JsonApiResource> {
  const map = new Map<string, JsonApiResource>();
  if (!included) return map;
  for (const resource of included) {
    map.set(`${resource.type}:${resource.id}`, resource);
  }
  return map;
}

/**
 * Resolve a to-one relationship from the included map.
 * Returns the full resource or null if not found / not present.
 */
export function resolveRelationship<TAttributes = Record<string, unknown>>(
  resource: JsonApiResource<unknown>,
  relationshipName: string,
  includedMap: Map<string, JsonApiResource>
): JsonApiResource<TAttributes> | null {
  const rel = resource.relationships?.[relationshipName]?.data;
  if (!rel || Array.isArray(rel)) return null;
  const found = includedMap.get(`${rel.type}:${rel.id}`);
  return (found as JsonApiResource<TAttributes>) ?? null;
}

/**
 * Resolve a to-many relationship from the included map.
 * Returns an array (possibly empty) of full resources.
 */
export function resolveRelationshipMany<
  TAttributes = Record<string, unknown>,
>(
  resource: JsonApiResource<unknown>,
  relationshipName: string,
  includedMap: Map<string, JsonApiResource>
): JsonApiResource<TAttributes>[] {
  const rel = resource.relationships?.[relationshipName]?.data;
  if (!rel || !Array.isArray(rel)) return [];
  return rel
    .map((ref: JsonApiResourceIdentifier) =>
      includedMap.get(`${ref.type}:${ref.id}`)
    )
    .filter(Boolean) as JsonApiResource<TAttributes>[];
}

/**
 * Extract a single relationship ID (to-one).
 * Useful when we only need the foreign key, not the full sideloaded resource.
 */
export function getRelationshipId(
  resource: JsonApiResource<unknown>,
  relationshipName: string
): string | null {
  const rel = resource.relationships?.[relationshipName]?.data;
  if (!rel || Array.isArray(rel)) return null;
  return rel.id;
}
