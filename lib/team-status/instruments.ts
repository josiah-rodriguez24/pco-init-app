/**
 * Normalize a PCO position label into a canonical instrument name.
 *
 * Isolated here so it can be tuned without touching the aggregation or
 * rendering code. Falls back to the raw label when no normalization matches.
 */

const INSTRUMENT_MAP: Record<string, string> = {
  // Vocals — includes vocal parts and worship leaders
  vocals: "Vocals",
  "lead vocals": "Vocals",
  "background vocals": "Vocals",
  "backup vocals": "Vocals",
  bgv: "Vocals",
  "bgv melody": "Vocals",
  "bgv tenor": "Vocals",
  "worship leader": "Vocals",
  "worship leader ": "Vocals",
  "worship ": "Vocals",
  "wl (guest)": "Vocals",
  "guest wl": "Vocals",
  alto: "Vocals",
  melody: "Vocals",
  tenor: "Vocals",
  soprano: "Vocals",
  soloist: "Vocals",
  "soloist ": "Vocals",
  flv: "Vocals",
  "rl - flv": "Vocals",
  choir: "Vocals",
  "choir member": "Vocals",
  "caroler (special)": "Vocals",

  // Guitar
  guitar: "Guitar",
  "electric guitar": "Guitar",
  "electric guitar 2": "Guitar",
  "2nd electric guitar": "Guitar",
  "electric guitar, co- lead": "Guitar",
  "acoustic guitar": "Guitar",
  acoustic: "Guitar",
  "worship leader, acoustic": "Guitar",
  "lead guitar": "Guitar",
  "rhythm guitar": "Guitar",
  "rhythm electric": "Guitar",
  "rhythm electric ": "Guitar",
  banjo: "Guitar",

  // Bass
  bass: "Bass",
  "bass guitar": "Bass",
  "double bass": "Bass",
  "double bass ": "Bass",

  // Drums
  drums: "Drums",
  percussion: "Drums",
  "drum kit": "Drums",
  cajon: "Drums",
  "special - drum": "Drums",

  // Keys
  keys: "Keys",
  "keys 2": "Keys",
  "2nd keys": "Keys",
  "2nd keys ": "Keys",
  keyboard: "Keys",
  piano: "Keys",
  synth: "Keys",
  synthesizer: "Keys",
  organ: "Keys",
  md: "Keys",

  // Tracks
  tracks: "Tracks",
  "click/tracks": "Tracks",
  click: "Tracks",

  // Strings
  strings: "Strings",
  violin: "Strings",
  "violin ": "Strings",
  viola: "Strings",
  cello: "Strings",
  flute: "Strings",

  // Brass
  brass: "Brass",
  trumpet: "Brass",
  trombone: "Brass",
  saxophone: "Brass",

  // Generic worship/band labels that some churches use as positions
  "worship team": "Vocals",
  "band member": "Guitar",
  "band member ": "Guitar",
  "special band member": "Guitar",
  special: "Vocals",
  "production team": "Vocals",
  "co-lead": "Vocals",
  "co-lead 1": "Vocals",
  "co-lead 2": "Vocals",
};

/**
 * Set of lowercase position labels that indicate someone is on the
 * worship team, regardless of what PCO "team" they're assigned to.
 */
export const WORSHIP_POSITIONS = new Set(Object.keys(INSTRUMENT_MAP));

export function normalizeInstrument(position: string | null | undefined): string {
  if (!position) return "Unknown";
  const key = position.trim().toLowerCase();
  return INSTRUMENT_MAP[key] ?? titleCase(position.trim());
}

/**
 * Returns true if the position string maps to a known worship instrument.
 */
export function isWorshipPosition(position: string | null | undefined): boolean {
  if (!position) return false;
  return WORSHIP_POSITIONS.has(position.trim().toLowerCase());
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
