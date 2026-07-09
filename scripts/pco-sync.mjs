import { resolve } from "node:path";
import process from "node:process";
import dotenv from "dotenv";

const ENV_FILES = [
  ".env.local",
  ".env.development.local",
  ".env.development",
  ".env",
];

for (const file of ENV_FILES) {
  dotenv.config({ path: resolve(process.cwd(), file), override: false });
}

const VALID_ENDPOINTS = new Set([
  "all",
  "blockouts",
  "items",
  "people",
  "plan-people",
  "plan-times",
  "plans",
  "service-types",
  "team-positions",
  "teams",
]);

function printUsage() {
  console.error(`Usage:
  node scripts/pco-sync.mjs <endpoint> [--base-url http://localhost:3000]

Valid endpoints:
  all
  blockouts
  items
  people
  plan-people
  plan-times
  plans
  service-types
  team-positions
  teams

Examples:
  npm run sync:all
  npm run sync:team-positions
  node scripts/pco-sync.mjs team-positions --base-url http://localhost:3001`);
}

function parseArgs(args) {
  let endpoint = null;
  let baseUrl = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--base-url") {
      baseUrl = args[i + 1] ?? null;
      i++;
      continue;
    }

    if (arg.startsWith("--base-url=")) {
      baseUrl = arg.slice("--base-url=".length);
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (!endpoint) {
      endpoint = arg;
    }
  }

  return { endpoint, baseUrl };
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

async function isReachable(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });

    return response.ok || response.status === 503;
  } catch {
    return false;
  }
}

async function resolveBaseUrl(explicitBaseUrl) {
  const candidates = [
    explicitBaseUrl,
    process.env.APP_BASE_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ]
    .filter((value) => Boolean(value))
    .map(normalizeBaseUrl);

  const uniqueCandidates = [...new Set(candidates)];

  for (const candidate of uniqueCandidates) {
    if (await isReachable(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Could not reach the app on any known base URL: ${uniqueCandidates.join(", ")}`
  );
}

async function main() {
  const { endpoint, baseUrl } = parseArgs(process.argv.slice(2));

  if (!endpoint || !VALID_ENDPOINTS.has(endpoint)) {
    printUsage();
    process.exit(1);
  }

  const resolvedBaseUrl = await resolveBaseUrl(baseUrl);
  const url = `${resolvedBaseUrl}/api/pco/sync/${endpoint}`;

  console.log(`Posting to ${url}`);

  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(10 * 60 * 1000),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(text);
    process.exit(1);
  }

  console.log(text);
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Unknown sync invocation error"
  );
  process.exit(1);
});
