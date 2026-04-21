import { NextResponse } from "next/server";
import { syncTeams } from "@/lib/sync/syncTeams";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/teams
 *
 * Triggers a sync of teams from Planning Center for all known service types.
 * Service types must be synced first.
 *
 * TODO: Add authentication check once app auth is implemented.
 */
export async function POST() {
  try {
    const result = await syncTeams();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/teams error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
