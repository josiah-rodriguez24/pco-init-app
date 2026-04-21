import { NextResponse } from "next/server";
import { syncPlanPeople } from "@/lib/sync/syncPlanPeople";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/plan-people
 *
 * Syncs team member assignments for all plans. Plans must be synced first.
 */
export async function POST() {
  try {
    const result = await syncPlanPeople();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/plan-people error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
