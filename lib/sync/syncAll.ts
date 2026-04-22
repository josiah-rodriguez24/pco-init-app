import { syncServiceTypes, type SyncResult } from "./syncServiceTypes";
import { syncTeams } from "./syncTeams";
import { syncPlans, type SyncPlansResult } from "./syncPlans";
import { syncTeamPositions } from "./syncTeamPositions";
import { syncPlanTimes } from "./syncPlanTimes";
import { syncPlanPeople } from "./syncPlanPeople";
import { syncItems } from "./syncItems";
import { syncPeople } from "./syncPeople";
import { syncBlockouts } from "./syncBlockouts";
import { syncNeededPositions } from "./syncNeededPositions";

// ---------------------------------------------------------------------------
// Full sync orchestrator.
//
// Runs each sync stage in dependency order:
//   1. Service Types (no prereqs)
//   2. Teams (requires service types)
//   3. Plans — future + past (requires service types)
//   4. Team Positions (requires service types + people for assignments)
//   5. Plan Times (requires plans)
//   6. Plan People (requires plans)
//   7. Items + Songs (requires plans)
//   8. People (requires plan people for FK linking)
//   9. Blockouts (requires people)
//
// Each stage is independent — a failure in one does not block the others.
// ---------------------------------------------------------------------------

export interface SyncAllResult {
  serviceTypes: SyncResult;
  teams: SyncResult;
  plans: SyncPlansResult;
  teamPositions: SyncResult;
  planTimes: SyncResult;
  planPeople: SyncResult;
  items: SyncResult;
  people: SyncResult;
  blockouts: SyncResult;
  neededPositions: SyncResult;
}

/**
 * Run a full sync across all entity types in dependency order.
 *
 * Safe to call at any time (idempotent upserts). Suitable as an initial
 * seed, a scheduled cron job, or a manual "sync everything" action.
 */
export async function syncAll(): Promise<SyncAllResult> {
  console.log("[SyncAll] Starting full sync...");

  // Stage 1: service types (must run first)
  const serviceTypesResult = await syncServiceTypes();

  // Stage 2: teams (depends on service types)
  const teamsResult = await syncTeams();

  // Stage 3: plans — future + past (depends on service types)
  const plansResult = await syncPlans({ filter: "all" });

  // Stage 4: team positions + person assignments (depends on service types)
  // Note: person assignments in this stage will only link people that
  // have already been synced. If running for the first time, a second
  // full sync will catch any missed assignment links.
  const teamPositionsResult = await syncTeamPositions();

  // Stage 5: plan times (depends on plans)
  const planTimesResult = await syncPlanTimes();

  // Stage 6: plan people (depends on plans)
  const planPeopleResult = await syncPlanPeople();

  // Stage 7: items + songs (depends on plans)
  const itemsResult = await syncItems();

  // Stage 8: people (depends on plan people for FK linking)
  const peopleResult = await syncPeople();

  // Stage 9: blockouts (depends on people)
  const blockoutsResult = await syncBlockouts();

  // Stage 10: needed positions / demand (depends on plans)
  const neededPositionsResult = await syncNeededPositions();

  console.log("[SyncAll] Full sync finished.", {
    serviceTypes: serviceTypesResult.status,
    teams: teamsResult.status,
    plans: plansResult.status,
    teamPositions: teamPositionsResult.status,
    planTimes: planTimesResult.status,
    planPeople: planPeopleResult.status,
    items: itemsResult.status,
    people: peopleResult.status,
    blockouts: blockoutsResult.status,
    neededPositions: neededPositionsResult.status,
  });

  return {
    serviceTypes: serviceTypesResult,
    teams: teamsResult,
    plans: plansResult,
    teamPositions: teamPositionsResult,
    planTimes: planTimesResult,
    planPeople: planPeopleResult,
    items: itemsResult,
    people: peopleResult,
    blockouts: blockoutsResult,
    neededPositions: neededPositionsResult,
  };
}
