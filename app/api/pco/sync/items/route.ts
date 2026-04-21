import { NextResponse } from "next/server";
import { syncItems } from "@/lib/sync/syncItems";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/items
 *
 * Syncs items (and associated songs) for all plans. Plans must be synced first.
 */
export async function POST() {
  try {
    const result = await syncItems();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/items error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
