import { NextResponse } from "next/server";
import { syncPlans } from "@/lib/sync/syncPlans";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/plans
 *
 * Triggers a full sync of plans from Planning Center for all known service types.
 * Service types must be synced first.
 *
 * TODO: Add authentication check here once app auth is implemented.
 * TODO: Accept body params to filter by service type or date range.
 */
export async function POST() {
  try {
    const result = await syncPlans();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/plans error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
