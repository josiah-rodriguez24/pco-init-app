import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Webhook processing for Planning Center.
//
// v1 strategy: store raw payloads synchronously.
// TODO: When adding a queue (e.g. BullMQ + Redis), change storeAndProcessWebhook
//       to enqueue the payload instead of processing inline.
// ---------------------------------------------------------------------------

/**
 * Verify the webhook signature if a secret is configured.
 * Returns true if verification passes or if no secret is set (dev mode).
 *
 * TODO [header]: PCO sends the signature in `X-PCO-Webhooks-Authenticity`.
 * Confirm the exact header name and HMAC algorithm with PCO's webhook docs
 * before enabling PLANNING_CENTER_WEBHOOK_SECRET in production.
 * Reference: https://developer.planning.center/docs/#/overview/webhooks
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!secret) {
    // No secret configured — accept all webhooks (development / unguarded mode).
    return true;
  }
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // timingSafeEqual requires both buffers to be the same byte length.
  // If lengths differ, we know immediately it's invalid — return false without
  // leaking timing information about the mismatch position.
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * Store a raw webhook event and trigger processing.
 *
 * For v1 we store the payload and log it. Future versions will dispatch to
 * sync functions based on the event type.
 */
export async function storeAndProcessWebhook(
  eventType: string,
  payload: unknown
): Promise<{ eventId: string }> {
  // Prisma v7's Json field requires Prisma.InputJsonValue, not a plain `object`.
  // Using Prisma.InputJsonValue makes the cast type-safe.
  const event = await prisma.webhookEvent.create({
    data: {
      eventType,
      payload: payload as Prisma.InputJsonValue,
    },
  });

  console.log(`[Webhook] Stored event ${event.id} (type: ${eventType})`);

  // TODO: Dispatch to appropriate sync function based on eventType
  //   e.g. "plan.created"           → re-sync that plan
  //        "service_type.updated"   → re-sync service types
  //        "team_member.updated"    → re-sync plan people

  return { eventId: event.id };
}
