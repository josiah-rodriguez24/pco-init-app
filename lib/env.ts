import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PLANNING_CENTER_CLIENT_ID: z.string().min(1, "PLANNING_CENTER_CLIENT_ID is required"),
  PLANNING_CENTER_SECRET: z.string().min(1, "PLANNING_CENTER_SECRET is required"),
  APP_BASE_URL: z.string().url({ message: "APP_BASE_URL must be a valid URL" }),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Optional — not required for v1
  REDIS_URL: z.string().optional(),
  PLANNING_CENTER_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n❌ Invalid environment variables:\n${formatted}\n\nSee .env.example for required values.\n`
    );
  }

  return result.data;
}

export const env = validateEnv();
