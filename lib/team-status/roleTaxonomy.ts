/**
 * Role taxonomy for worship team analytics.
 *
 * Maps raw PCO position labels → canonical role tags → Sankey branches.
 * A person can belong to multiple roles simultaneously (e.g. a worship
 * leader who plays acoustic guitar is both "vocals" + "worship-leader"
 * AND "band" + "guitar").
 */

// ---------------------------------------------------------------------------
// Canonical role tags and branch classification
// ---------------------------------------------------------------------------

export type Branch = "band" | "vocals";

export interface RoleDefinition {
  tag: string;
  label: string;
  branch: Branch;
  isSankeyNode: boolean;
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  // Vocals branch
  { tag: "worship-leader", label: "Worship Leader", branch: "vocals", isSankeyNode: true },
  { tag: "co-leader",      label: "Co-Leader",       branch: "vocals", isSankeyNode: true },
  { tag: "vocalist",       label: "Vocalist",        branch: "vocals", isSankeyNode: true },

  // Band branch
  { tag: "guitar",  label: "Guitar",  branch: "band", isSankeyNode: true },
  { tag: "bass",    label: "Bass",    branch: "band", isSankeyNode: true },
  { tag: "drums",   label: "Drums",   branch: "band", isSankeyNode: true },
  { tag: "keys",    label: "Keys",    branch: "band", isSankeyNode: true },
  { tag: "tracks",  label: "Tracks",  branch: "band", isSankeyNode: true },
  { tag: "strings", label: "Strings", branch: "band", isSankeyNode: true },
  { tag: "brass",   label: "Brass",   branch: "band", isSankeyNode: true },
];

const ROLE_BY_TAG = new Map(ROLE_DEFINITIONS.map((r) => [r.tag, r]));

export function getRoleDefinition(tag: string): RoleDefinition | undefined {
  return ROLE_BY_TAG.get(tag);
}

export function getRoleLabel(tag: string): string {
  return ROLE_BY_TAG.get(tag)?.label ?? tag;
}

// ---------------------------------------------------------------------------
// Position → role tag mapping (aliases)
// ---------------------------------------------------------------------------

const POSITION_TO_ROLES: Record<string, string[]> = {
  // Worship leader positions — dual-tagged as vocalist + worship-leader
  "worship leader": ["worship-leader", "vocalist"],
  "worship leader ": ["worship-leader", "vocalist"],
  "worship ": ["worship-leader", "vocalist"],
  "wl (guest)": ["worship-leader", "vocalist"],
  "guest wl": ["worship-leader", "vocalist"],
  "worship team": ["vocalist"],

  // Co-leader positions
  "co-lead": ["co-leader", "vocalist"],
  "co-lead 1": ["co-leader", "vocalist"],
  "co-lead 2": ["co-leader", "vocalist"],

  // Co-leader who also plays guitar
  "electric guitar, co- lead": ["co-leader", "guitarist-co-lead", "guitar"],

  // Worship leader who also plays guitar
  "worship leader, acoustic": ["worship-leader", "vocalist", "guitar"],

  // Vocalist-only positions
  "vocals": ["vocalist"],
  "lead vocals": ["vocalist"],
  "background vocals": ["vocalist"],
  "backup vocals": ["vocalist"],
  "bgv": ["vocalist"],
  "bgv melody": ["vocalist"],
  "bgv tenor": ["vocalist"],
  "alto": ["vocalist"],
  "melody": ["vocalist"],
  "tenor": ["vocalist"],
  "soprano": ["vocalist"],
  "soloist": ["vocalist"],
  "soloist ": ["vocalist"],
  "flv": ["vocalist"],
  "rl - flv": ["vocalist"],
  "choir": ["vocalist"],
  "choir member": ["vocalist"],
  "caroler (special)": ["vocalist"],
  "special": ["vocalist"],
  "production team": ["vocalist"],

  // Guitar
  "guitar": ["guitar"],
  "electric guitar": ["guitar"],
  "electric guitar 2": ["guitar"],
  "2nd electric guitar": ["guitar"],
  "acoustic guitar": ["guitar"],
  "acoustic": ["guitar"],
  "lead guitar": ["guitar"],
  "rhythm guitar": ["guitar"],
  "rhythm electric": ["guitar"],
  "rhythm electric ": ["guitar"],
  "banjo": ["guitar"],

  // Bass
  "bass": ["bass"],
  "bass guitar": ["bass"],
  "double bass": ["bass"],
  "double bass ": ["bass"],

  // Drums
  "drums": ["drums"],
  "percussion": ["drums"],
  "drum kit": ["drums"],
  "cajon": ["drums"],
  "special - drum": ["drums"],

  // Keys
  "keys": ["keys"],
  "keys 2": ["keys"],
  "2nd keys": ["keys"],
  "2nd keys ": ["keys"],
  "keyboard": ["keys"],
  "piano": ["keys"],
  "synth": ["keys"],
  "synthesizer": ["keys"],
  "organ": ["keys"],
  "md": ["keys"],

  // Tracks
  "tracks": ["tracks"],
  "click/tracks": ["tracks"],
  "click": ["tracks"],

  // Strings
  "strings": ["strings"],
  "violin": ["strings"],
  "violin ": ["strings"],
  "viola": ["strings"],
  "cello": ["strings"],
  "flute": ["strings"],

  // Brass
  "brass": ["brass"],
  "trumpet": ["brass"],
  "trombone": ["brass"],
  "saxophone": ["brass"],

  // Generic band labels
  "band member": ["guitar"],
  "band member ": ["guitar"],
  "special band member": ["guitar"],
};

/**
 * Resolve a raw PCO position label into a set of canonical role tags.
 * Returns an empty set for unrecognized positions.
 */
export function resolveRoleTags(position: string | null | undefined): Set<string> {
  if (!position) return new Set();
  const key = position.trim().toLowerCase();
  const tags = POSITION_TO_ROLES[key];
  return tags ? new Set(tags) : new Set();
}

/**
 * Resolve multiple positions into a unified set of role tags.
 * Useful for aggregating a person's entire history of positions.
 */
export function resolveAllRoleTags(positions: string[]): Set<string> {
  const combined = new Set<string>();
  for (const pos of positions) {
    for (const tag of resolveRoleTags(pos)) {
      combined.add(tag);
    }
  }
  return combined;
}

/**
 * Determine branches a person belongs to from their role tags.
 */
export function getBranches(roleTags: Set<string>): Set<Branch> {
  const branches = new Set<Branch>();
  for (const tag of roleTags) {
    const def = ROLE_BY_TAG.get(tag);
    if (def) branches.add(def.branch);
  }
  return branches;
}

/**
 * Returns true if the position is recognized as a worship-team position.
 */
export function isWorshipPosition(position: string | null | undefined): boolean {
  if (!position) return false;
  const key = position.trim().toLowerCase();
  return key in POSITION_TO_ROLES;
}

/** Worship team detection patterns for PCO team names. */
const WORSHIP_TEAM_PATTERNS = ["worship", "band", "vocals"];

export function isWorshipTeamName(teamName: string | null | undefined): boolean {
  if (!teamName) return false;
  const lower = teamName.toLowerCase();
  return WORSHIP_TEAM_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Get only Sankey-relevant role tags (tags that correspond to visible
 * Sankey nodes rather than internal metadata tags).
 */
export function getSankeyRoleTags(roleTags: Set<string>): string[] {
  return [...roleTags].filter((tag) => {
    const def = ROLE_BY_TAG.get(tag);
    return def?.isSankeyNode === true;
  });
}
