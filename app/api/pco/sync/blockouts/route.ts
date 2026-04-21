import { NextResponse } from "next/server";
import { syncBlockouts } from "@/lib/sync/syncBlockouts";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/blockouts
 *
 * Syncs blockout (unavailability) data for all synced people. People must be synced first.
 */
export async function POST() {
  try {
    const result = await syncBlockouts();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/blockouts error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
