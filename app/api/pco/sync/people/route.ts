import { NextResponse } from "next/server";
import { syncPeople } from "@/lib/sync/syncPeople";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/people
 *
 * Syncs all people from the Services API and enriches with email addresses.
 * Also links PlanPerson rows to Person records.
 */
export async function POST() {
  try {
    const result = await syncPeople();
    return NextResponse.json(result, {
      status: result.status === "completed" ? 200 : 500,
    });
  } catch (error) {
    console.error("[API] sync/people error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
