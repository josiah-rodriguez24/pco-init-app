import type { TeamMemberRow } from "./getWorshipTeamStatus";

/**
 * Maps each Sankey node id to the canonical role tags it represents.
 * An empty array means "show all members" (root node).
 */
export const FILTER_NODE_TO_TAGS: Record<string, string[]> = {
  "Worship Team": [],
  Band: ["guitar", "bass", "drums", "keys", "tracks", "strings", "brass"],
  Vocals: ["worship-leader", "co-leader", "vocalist"],
  Guitar: ["guitar"],
  Bass: ["bass"],
  Drums: ["drums"],
  Keys: ["keys"],
  Tracks: ["tracks"],
  Strings: ["strings"],
  Brass: ["brass"],
  "Worship Leader": ["worship-leader"],
  "Co-Leader": ["co-leader"],
  Vocalist: ["vocalist"],
};

/**
 * Filter a member list by the active Sankey selection.
 * Returns the full list when no filter is active or the root node is selected.
 */
export function filterMembersByNode(
  members: TeamMemberRow[],
  activeFilter: string | null
): TeamMemberRow[] {
  if (!activeFilter || activeFilter === "Worship Team") return members;

  const requiredTags = FILTER_NODE_TO_TAGS[activeFilter];
  if (requiredTags === undefined) return [];
  if (requiredTags.length === 0) return members;

  return members.filter((m) =>
    requiredTags.some((tag) => m.roleTags.includes(tag))
  );
}
