import { NextResponse } from "next/server";
import { syncTeamPositions } from "@/lib/sync/syncTeamPositions";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/team-positions
 *
 * Syncs team positions and person-to-position assignments for all service types.
 * Service types and people should be synced first.
 */
export async function POST() {
  try {
    const result = await syncTeamPositions();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/team-positions error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
