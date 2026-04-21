import { NextResponse } from "next/server";
import { syncPlanTimes } from "@/lib/sync/syncPlanTimes";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/plan-times
 *
 * Syncs plan time slots (service times) for all synced plans. Plans must be synced first.
 */
export async function POST() {
  try {
    const result = await syncPlanTimes();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/plan-times error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
