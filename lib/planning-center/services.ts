import { pcoGet, type PcoResponse } from "./client";
import { fetchAllPages, type PaginatedResult } from "./pagination";
import type {
  JsonApiResource,
  PcoServiceTypeAttributes,
  PcoPlanAttributes,
  PcoTeamAttributes,
  PcoPlanPersonAttributes,
  PcoItemAttributes,
  PcoPersonAttributes,
  PcoEmailAttributes,
  PcoBlockoutAttributes,
  PcoTeamPositionAttributes,
  PcoPersonTeamPositionAssignmentAttributes,
  PcoPlanTimeAttributes,
} from "./types";

// ---------------------------------------------------------------------------
// Planning Center Services API — high-level data fetchers.
//
// Each function targets a specific endpoint verified against the OpenAPI spec
// at API Documentation/services_2018-11-01.json (version 2018-11-01).
//
// Base URL: https://api.planningcenteronline.com/services/v2
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Service Types
// ---------------------------------------------------------------------------

/**
 * Fetch all service types for the organization (auto-paginates).
 *
 * Endpoint: GET /service_types
 *
 * TODO [endpoint]: This only returns root-level service types. Service types
 * inside folders require GET /folders/{id}/service_types. If the org uses
 * folders, add folder traversal here.
 */
export async function fetchServiceTypes(): Promise<
  PaginatedResult<PcoServiceTypeAttributes>
> {
  return fetchAllPages<PcoServiceTypeAttributes>("/service_types");
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

/**
 * Fetch plans for a given service type.
 *
 * Endpoint: GET /service_types/{service_type_id}/plans
 *
 * The `filter` parameter accepts PCO plan filter values (from spec):
 *   "future"    — plans from today forward (default)
 *   "past"      — plans before today
 *   "no_dates"  — plans with no date set
 *   "before"    — requires additional where[sort_date][lt] param
 *   "after"     — requires additional where[sort_date][gt] param
 *
 * TODO [endpoint]: Date-range filters (before/after) require additional
 * query params not yet plumbed here.
 */
export async function fetchPlans(
  serviceTypeId: string,
  options?: { filter?: string }
): Promise<PaginatedResult<PcoPlanAttributes>> {
  const filter = options?.filter ?? "future";
  return fetchAllPages<PcoPlanAttributes>(
    `/service_types/${serviceTypeId}/plans?filter=${filter}`
  );
}

/**
 * Fetch a single plan by ID.
 *
 * Endpoint: GET /service_types/{service_type_id}/plans/{plan_id}
 */
export async function fetchPlanById(
  serviceTypeId: string,
  planId: string
): Promise<PcoResponse<JsonApiResource<PcoPlanAttributes>>> {
  return pcoGet<JsonApiResource<PcoPlanAttributes>>(
    `/service_types/${serviceTypeId}/plans/${planId}`
  );
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

/**
 * Fetch all teams for a service type.
 *
 * Endpoint: GET /service_types/{service_type_id}/teams
 *
 * Teams in PCO are service-type-scoped, not plan-scoped.
 */
export async function fetchTeamsForServiceType(
  serviceTypeId: string
): Promise<PaginatedResult<PcoTeamAttributes>> {
  return fetchAllPages<PcoTeamAttributes>(
    `/service_types/${serviceTypeId}/teams`
  );
}

// ---------------------------------------------------------------------------
// Plan People (Team Members)
// ---------------------------------------------------------------------------

/**
 * Fetch people (team member assignments) for a specific plan.
 *
 * Endpoint: GET /service_types/{service_type_id}/plans/{plan_id}/team_members
 *
 * The response returns PlanPerson resources. We request `?include=team`
 * so the team name is available in the sideloaded included[] array
 * without additional API calls.
 *
 * TODO [endpoint]: Adding `include=person` would give us the Person resource
 * (with email, phone, etc.), but that expands the response significantly.
 * For v1 we rely on the PlanPerson name attribute.
 */
export async function fetchPeopleForPlan(
  serviceTypeId: string,
  planId: string
): Promise<PaginatedResult<PcoPlanPersonAttributes>> {
  return fetchAllPages<PcoPlanPersonAttributes>(
    `/service_types/${serviceTypeId}/plans/${planId}/team_members?include=team`
  );
}

// ---------------------------------------------------------------------------
// Plan Items
// ---------------------------------------------------------------------------

/**
 * Fetch items (songs, headers, media) in a specific plan, in order.
 *
 * Endpoint: GET /service_types/{service_type_id}/plans/{plan_id}/items
 *
 * We include `?include=song` so song details arrive in `included[]`
 * without requiring separate API calls per song.
 */
export async function fetchItemsForPlan(
  serviceTypeId: string,
  planId: string
): Promise<PaginatedResult<PcoItemAttributes>> {
  return fetchAllPages<PcoItemAttributes>(
    `/service_types/${serviceTypeId}/plans/${planId}/items?include=song`
  );
}

// ---------------------------------------------------------------------------
// People (Services-scoped)
// ---------------------------------------------------------------------------

/**
 * Fetch all people in the Services scope (auto-paginates).
 *
 * Endpoint: GET /people
 */
export async function fetchAllServicesPeople(): Promise<
  PaginatedResult<PcoPersonAttributes>
> {
  return fetchAllPages<PcoPersonAttributes>("/people");
}

/**
 * Fetch a single person by their PCO ID.
 *
 * Endpoint: GET /people/{person_id}
 */
export async function fetchServicesPersonById(
  personId: string
): Promise<PcoResponse<JsonApiResource<PcoPersonAttributes>>> {
  return pcoGet<JsonApiResource<PcoPersonAttributes>>(`/people/${personId}`);
}

/**
 * Fetch email addresses for a person.
 *
 * Endpoint: GET /people/{person_id}/emails
 */
export async function fetchEmailsForPerson(
  personId: string
): Promise<PaginatedResult<PcoEmailAttributes>> {
  return fetchAllPages<PcoEmailAttributes>(`/people/${personId}/emails`);
}

// ---------------------------------------------------------------------------
// Blockouts
// ---------------------------------------------------------------------------

/**
 * Fetch blockouts (unavailability) for a person.
 *
 * Endpoint: GET /people/{person_id}/blockouts
 */
export async function fetchBlockoutsForPerson(
  personId: string
): Promise<PaginatedResult<PcoBlockoutAttributes>> {
  return fetchAllPages<PcoBlockoutAttributes>(
    `/people/${personId}/blockouts`
  );
}

// ---------------------------------------------------------------------------
// Team Positions
// ---------------------------------------------------------------------------

/**
 * Fetch all team positions for a service type.
 *
 * Endpoint: GET /service_types/{service_type_id}/team_positions
 */
export async function fetchTeamPositionsForServiceType(
  serviceTypeId: string
): Promise<PaginatedResult<PcoTeamPositionAttributes>> {
  return fetchAllPages<PcoTeamPositionAttributes>(
    `/service_types/${serviceTypeId}/team_positions`
  );
}

/**
 * Fetch person assignments for a given team position.
 *
 * Endpoint: GET /service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments
 */
export async function fetchPersonTeamPositionAssignments(
  serviceTypeId: string,
  teamPositionId: string
): Promise<PaginatedResult<PcoPersonTeamPositionAssignmentAttributes>> {
  return fetchAllPages<PcoPersonTeamPositionAssignmentAttributes>(
    `/service_types/${serviceTypeId}/team_positions/${teamPositionId}/person_team_position_assignments`
  );
}

// ---------------------------------------------------------------------------
// Plan Times
// ---------------------------------------------------------------------------

/**
 * Fetch plan times (service time slots) for a specific plan.
 *
 * Endpoint: GET /service_types/{service_type_id}/plans/{plan_id}/plan_times
 */
export async function fetchPlanTimesForPlan(
  serviceTypeId: string,
  planId: string
): Promise<PaginatedResult<PcoPlanTimeAttributes>> {
  return fetchAllPages<PcoPlanTimeAttributes>(
    `/service_types/${serviceTypeId}/plans/${planId}/plan_times`
  );
}
