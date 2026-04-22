import type {
  JsonApiResource,
  PcoServiceTypeAttributes,
  PcoPlanAttributes,
  PcoTeamAttributes,
  PcoPlanPersonAttributes,
  PcoItemAttributes,
  PcoSongAttributes,
  PcoPersonAttributes,
  PcoBlockoutAttributes,
  PcoTeamPositionAttributes,
  PcoPersonTeamPositionAssignmentAttributes,
  PcoPlanTimeAttributes,
  PcoNeededPositionAttributes,
} from "./types";
import {
  buildIncludedMap,
  resolveRelationship,
  getRelationshipId,
} from "./jsonapi";

// ---------------------------------------------------------------------------
// Mappers: PCO JSON:API resources → flat objects ready for Prisma upserts.
//
// All field names are verified against the OpenAPI spec (2018-11-01).
// Each mapper is a pure function with defensive field access.
// Fields available in the spec but not mapped are noted with TODO [field].
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mapped types (our internal shapes, decoupled from JSON:API)
// ---------------------------------------------------------------------------

export interface MappedServiceType {
  externalId: string;
  name: string;
  description: string | null;
  frequency: string | null;
}

export interface MappedPlan {
  externalId: string;
  title: string | null;
  dates: string | null;
  sortDate: Date | null;
  seriesTitle: string | null;
  status: string | null;
  totalLength: number | null;
  itemsCount: number | null;
  planPeopleCount: number | null;
  planningCenterUrl: string | null;
}

export interface MappedTeam {
  externalId: string;
  name: string;
  sequence: number | null;
  scheduleToName: string | null;
  defaultStatus: string | null;
  isArchived: boolean;
}

export interface MappedPlanPerson {
  externalId: string;
  personName: string;
  personExternalId: string | null;
  personEmail: string | null;
  teamName: string | null;
  teamExternalId: string | null;
  status: string | null;
  position: string | null;
  declineReason: string | null;
  photoThumbnail: string | null;
  scheduledByName: string | null;
}

export interface MappedItem {
  externalId: string;
  title: string;
  description: string | null;
  itemType: string | null;
  sequence: number | null;
  length: number | null;
  servicePosition: string | null;
  keyName: string | null;
  songExternalId: string | null;
}

export interface MappedSong {
  externalId: string;
  title: string;
  author: string | null;
  ccliNumber: string | null;
  copyright: string | null;
  themes: string | null;
}

export interface MappedPerson {
  externalId: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  email: string | null;
  photoThumbnail: string | null;
  status: string | null;
}

export interface MappedBlockout {
  externalId: string;
  description: string | null;
  reason: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  repeatFrequency: string | null;
  repeatPeriod: string | null;
  repeatInterval: string | null;
  repeatUntil: Date | null;
  timeZone: string | null;
}

export interface MappedTeamPosition {
  externalId: string;
  name: string;
  sequence: number | null;
  teamExternalId: string | null;
  tags: Record<string, unknown>[] | null;
  tagGroups: Record<string, unknown>[] | null;
  negativeTagGroups: Record<string, unknown>[] | null;
}

export interface MappedPersonTeamPositionAssignment {
  externalId: string;
  personExternalId: string | null;
  schedulePreference: string | null;
  preferredWeeks: string[];
}

export interface MappedPlanTime {
  externalId: string;
  name: string | null;
  timeType: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
}

// ---------------------------------------------------------------------------
// Mapper functions
// ---------------------------------------------------------------------------

/**
 * Map a ServiceType resource.
 *
 * Note: PCO ServiceType has no `description` attribute in the schema.
 * We store null for now. If your PCO org uses a custom field or you add a
 * notes-based description later, this is the place to wire it.
 */
export function mapServiceType(
  resource: JsonApiResource<PcoServiceTypeAttributes>
): MappedServiceType {
  const a = resource.attributes;
  return {
    externalId: resource.id,
    name: a.name ?? "Unnamed Service Type",
    // TODO [field]: PCO ServiceType schema has no `description` attribute.
    // We keep this field for our own use (manual entry or future enrichment).
    description: null,
    frequency: a.frequency ?? null,
  };
}

export function mapPlan(
  resource: JsonApiResource<PcoPlanAttributes>
): MappedPlan {
  const a = resource.attributes;
  const sortDateStr = a.sort_date;
  return {
    externalId: resource.id,
    title: a.title ?? null,
    dates: a.dates ?? a.short_dates ?? null,
    sortDate: sortDateStr ? new Date(sortDateStr) : null,
    seriesTitle: a.series_title ?? null,
    // TODO [field]: Plan schema has no top-level `status` attribute.
    // The status of scheduled people is on PlanPerson. This field captures
    // a synthetic status if one is derived later. Set to null for now.
    status: null,
    totalLength: typeof a.total_length === "number" ? a.total_length : null,
    itemsCount: typeof a.items_count === "number" ? a.items_count : null,
    planPeopleCount:
      typeof a.plan_people_count === "number" ? a.plan_people_count : null,
    planningCenterUrl: a.planning_center_url ?? null,
  };
}

export function mapTeam(
  resource: JsonApiResource<PcoTeamAttributes>
): MappedTeam {
  const a = resource.attributes;
  return {
    externalId: resource.id,
    name: a.name ?? "Unnamed Team",
    sequence: typeof a.sequence === "number" ? a.sequence : null,
    scheduleToName: a.schedule_to ?? null,
    defaultStatus: a.default_status ?? null,
    isArchived: a.archived_at != null,
  };
}

/**
 * Map a PlanPerson (team member assignment on a plan).
 *
 * When the request includes `?include=team`, we can resolve the team name
 * from the sideloaded included[] array. Pass the full included array so
 * the mapper can look it up.
 */
export function mapPlanPerson(
  resource: JsonApiResource<PcoPlanPersonAttributes>,
  included?: JsonApiResource[]
): MappedPlanPerson {
  const a = resource.attributes;
  const includedMap = buildIncludedMap(included);

  // Resolve team name from included Team resource
  const teamResource = resolveRelationship(resource, "team", includedMap);
  const teamName =
    (teamResource?.attributes as Record<string, unknown>)?.name as
      | string
      | undefined ?? null;
  const teamExternalId = getRelationshipId(resource, "team");

  const personExternalId = getRelationshipId(resource, "person");

  return {
    externalId: resource.id,
    personName: a.name ?? "Unknown",
    personExternalId,
    personEmail: null,
    teamName,
    teamExternalId,
    status: a.status ?? null,
    position: a.team_position_name ?? null,
    declineReason: a.decline_reason ?? null,
    photoThumbnail: a.photo_thumbnail ?? null,
    scheduledByName: a.scheduled_by_name ?? null,
  };
}

/**
 * Map an Item (song, header, media, etc.) in a plan.
 *
 * The song relationship is a to-one link. We extract just the external ID
 * here — the Song record itself should be synced separately if needed.
 */
export function mapItem(
  resource: JsonApiResource<PcoItemAttributes>
): MappedItem {
  const a = resource.attributes;
  const songExternalId = getRelationshipId(resource, "song");

  return {
    externalId: resource.id,
    title: a.title ?? "Untitled Item",
    description: a.description ?? null,
    itemType: a.item_type ?? null,
    sequence: typeof a.sequence === "number" ? a.sequence : null,
    length: typeof a.length === "number" ? a.length : null,
    servicePosition: a.service_position ?? null,
    keyName: a.key_name ?? null,
    songExternalId,
  };
}

export function mapSong(
  resource: JsonApiResource<PcoSongAttributes>
): MappedSong {
  const a = resource.attributes;
  return {
    externalId: resource.id,
    title: a.title ?? "Untitled Song",
    author: a.author ?? null,
    ccliNumber:
      a.ccli_number != null ? String(a.ccli_number) : null,
    copyright: a.copyright ?? null,
    themes: a.themes ?? null,
  };
}

export function mapPerson(
  resource: JsonApiResource<PcoPersonAttributes>
): MappedPerson {
  const a = resource.attributes;
  return {
    externalId: resource.id,
    firstName: a.first_name ?? null,
    lastName: a.last_name ?? null,
    name: a.full_name ?? ([a.first_name, a.last_name].filter(Boolean).join(" ") || "Unknown"),
    email: null,
    photoThumbnail: a.photo_thumbnail_url ?? null,
    status: a.status ?? null,
  };
}

export function mapBlockout(
  resource: JsonApiResource<PcoBlockoutAttributes>
): MappedBlockout {
  const a = resource.attributes;
  return {
    externalId: resource.id,
    description: a.description ?? null,
    reason: a.reason ?? null,
    startsAt: a.starts_at ? new Date(a.starts_at) : null,
    endsAt: a.ends_at ? new Date(a.ends_at) : null,
    repeatFrequency: a.repeat_frequency ?? null,
    repeatPeriod: a.repeat_period ?? null,
    repeatInterval: a.repeat_interval ?? null,
    repeatUntil: a.repeat_until ? new Date(a.repeat_until) : null,
    timeZone: a.time_zone ?? null,
  };
}

export function mapTeamPosition(
  resource: JsonApiResource<PcoTeamPositionAttributes>
): MappedTeamPosition {
  const a = resource.attributes;
  const teamExternalId = getRelationshipId(resource, "team");
  return {
    externalId: resource.id,
    name: a.name ?? "Unnamed Position",
    sequence: typeof a.sequence === "number" ? a.sequence : null,
    teamExternalId,
    tags: Array.isArray(a.tags) && a.tags.length > 0 ? a.tags : null,
    tagGroups: Array.isArray(a.tag_groups) && a.tag_groups.length > 0 ? a.tag_groups : null,
    negativeTagGroups: Array.isArray(a.negative_tag_groups) && a.negative_tag_groups.length > 0 ? a.negative_tag_groups : null,
  };
}

export function mapPersonTeamPositionAssignment(
  resource: JsonApiResource<PcoPersonTeamPositionAssignmentAttributes>
): MappedPersonTeamPositionAssignment {
  const a = resource.attributes;
  const personExternalId = getRelationshipId(resource, "person");
  return {
    externalId: resource.id,
    personExternalId,
    schedulePreference: a.schedule_preference ?? null,
    preferredWeeks: Array.isArray(a.preferred_weeks)
      ? a.preferred_weeks.map(String)
      : [],
  };
}

export function mapPlanTime(
  resource: JsonApiResource<PcoPlanTimeAttributes>
): MappedPlanTime {
  const a = resource.attributes;
  return {
    externalId: resource.id,
    name: a.name ?? null,
    timeType: a.time_type ?? null,
    startsAt: a.starts_at ? new Date(a.starts_at) : null,
    endsAt: a.ends_at ? new Date(a.ends_at) : null,
  };
}

// ---------------------------------------------------------------------------
// NeededPosition
// ---------------------------------------------------------------------------

export interface MappedNeededPosition {
  externalId: string;
  teamPositionName: string | null;
  quantity: number;
  scheduledTo: string | null;
}

export function mapNeededPosition(
  resource: JsonApiResource<PcoNeededPositionAttributes>
): MappedNeededPosition {
  const a = resource.attributes;
  return {
    externalId: resource.id,
    teamPositionName: a.team_position_name ?? null,
    quantity: typeof a.quantity === "number" ? a.quantity : 0,
    scheduledTo: a.scheduled_to ?? null,
  };
}
