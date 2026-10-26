import { z } from "zod";

/**
 * Server environment, validated lazily so `next build` can run without a
 * database (pages then render empty states). Never import this from client code.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().trim().optional(),
  MONGODB_DB: z.string().trim().optional(),
  SITE_URL: z.string().trim().url().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().trim().optional(),
  VERCEL_URL: z.string().trim().optional(),
  AUTH_SECRET: z.string().optional(),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().trim().optional(),
  CONTACT_FROM_EMAIL: z.string().trim().optional(),
  SITE_GATE_PASSWORD: z.string().optional(),
  GITHUB_TOKEN: z.string().trim().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached && process.env.NODE_ENV !== "test") return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    // Only field names are reported, never values.
    throw new Error(`Invalid environment variables: ${fields}`);
  }
  cached = parsed.data;
  return cached;
}

/** Canonical public origin, e.g. https://anik.dev (no trailing slash). */
export function getSiteUrl(): string {
  const env = getEnv();
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Secret used to HMAC client IPs and rate-limit keys. Required in production;
 * a fixed development value keeps local setup friction-free.
 */
export function getAuthSecret(): string {
  const secret = getEnv().AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters in production.");
  }
  return "development-only-secret-do-not-use-in-production";
}

/** Password for moving between the portfolio and the studio. Null when not configured (crossing is then impossible). */
export function getGatePassword(): string | null {
  const value = getEnv().SITE_GATE_PASSWORD;
  return value && value.length >= 4 ? value : null;
}

/** Token for pushing profile details and the profile README to GitHub. Null when not configured (copy and paste only). */
export function getGithubToken(): string | null {
  return getEnv().GITHUB_TOKEN || null;
}

export function isMailConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.CONTACT_TO_EMAIL);
}
