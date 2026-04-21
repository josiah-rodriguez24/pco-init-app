import { env } from "@/lib/env";

/**
 * Build a Basic Authorization header for Planning Center PAT auth.
 *
 * Planning Center accepts HTTP Basic where the username is the Application ID
 * and the password is the Secret. This keeps secrets server-side only.
 *
 * TODO: When adding OAuth support, this module becomes the auth strategy
 * selector — swap `buildPatHeader()` for a token-based header lookup
 * without touching the rest of the client code.
 */
export function buildAuthHeaders(): Record<string, string> {
  const credentials = Buffer.from(
    `${env.PLANNING_CENTER_CLIENT_ID}:${env.PLANNING_CENTER_SECRET}`
  ).toString("base64");

  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
}
