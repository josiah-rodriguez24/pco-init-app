import { NextResponse } from "next/server";
import { syncAll } from "@/lib/sync/syncAll";
import { toErrorResponse } from "@/lib/errors";

/**
 * POST /api/pco/sync/all
 *
 * Triggers a full 10-stage sync: service types → teams → plans (future + past)
 * → team positions → plan times → plan people → items → people → blockouts
 * → needed positions.
 *
 * Suitable for initial seed or manual "sync everything" action.
 */
export async function POST() {
  try {
    const result = await syncAll();

    const allCompleted = Object.values(result).every(
      (r) => r.status === "completed"
    );

    return NextResponse.json(result, {
      status: allCompleted ? 200 : 207,
    });
  } catch (error) {
    console.error("[API] sync/all error:", error);
    return NextResponse.json(toErrorResponse(error), { status: 500 });
  }
}
