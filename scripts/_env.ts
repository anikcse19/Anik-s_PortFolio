import { existsSync } from "node:fs";
import { resolve } from "node:path";

/** Loads .env.local then .env (existing process env always wins). */
export function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    try {
      process.loadEnvFile(path);
    } catch {
      // Ignore malformed files; required variables are validated by each script.
    }
  }
}
