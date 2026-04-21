import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  storeAndProcessWebhook,
} from "@/lib/sync/webhookProcessor";

/**
 * POST /api/webhooks/planning-center
 *
 * Receives webhook events from Planning Center.
 * Verifies signature (if configured), stores raw payload, and responds 202.
 *
 * The goal is to acknowledge receipt quickly. Heavy processing should be
 * queued (see webhookProcessor.ts TODO).
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // TODO [header]: Verify the exact header name PCO uses for HMAC signatures.
    // "X-PCO-Webhooks-Authenticity" is based on community docs — confirm against
    // https://developer.planning.center/docs/#/overview/webhooks before enabling
    // PLANNING_CENTER_WEBHOOK_SECRET in production.
    const signature = request.headers.get("X-PCO-Webhooks-Authenticity") ?? null;
    const webhookSecret = process.env.PLANNING_CENTER_WEBHOOK_SECRET;

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn("[Webhook] Signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // TODO [payload shape]: PCO webhook bodies wrap events inside a "data" array.
    // The event type may be at `data[0].attributes.name` or similar.
    // Confirm the exact payload structure from the PCO webhook docs and update
    // this extraction accordingly.
    const eventType =
      (payload as Record<string, unknown>)?.name as string | undefined;

    const { eventId } = await storeAndProcessWebhook(
      eventType ?? "unknown",
      payload
    );

    return NextResponse.json({ received: true, eventId }, { status: 202 });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
