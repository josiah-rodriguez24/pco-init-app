import { NextResponse } from "next/server";
import { syncServiceTypes } from "@/lib/sync/syncServiceTypes";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/service-types
 *
 * Triggers a full sync of service types from Planning Center.
 * This is a server-only endpoint — no browser should call PCO directly.
 *
 * TODO: Add authentication check here once app auth is implemented.
 * TODO: Add Vercel Cron header validation for scheduled syncs.
 */
export async function POST() {
  try {
    const result = await syncServiceTypes();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/service-types error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
