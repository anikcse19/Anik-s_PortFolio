/**
 * Provision or reset the admin account. There is no public registration.
 *
 *   npm run admin:create                 # uses ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD, or prompts
 *   npm run admin:create -- --reset      # reset the password of an existing admin
 *
 * Point MONGODB_URI at the production database to provision production.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { loadEnv } from "./_env";

loadEnv();

async function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  if (hidden) {
    const r = rl as unknown as { _writeToOutput: (s: string) => void };
    r._writeToOutput = (s: string) => {
      if (s.includes(question)) stdout.write(s);
      else stdout.write("*");
    };
  }
  const answer = await rl.question(question);
  rl.close();
  if (hidden) stdout.write("\n");
  return answer.trim();
}

async function main() {
  const { connectDB, disconnectDB } = await import("@/lib/db");
  const { provisionAdmin } = await import("./_admin");
  const allowReset = process.argv.includes("--reset");
  const interactive = stdin.isTTY;

  let email = process.env.ADMIN_EMAIL ?? "";
  let name = process.env.ADMIN_NAME ?? "";
  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!email && interactive) email = await ask("Admin email: ");
  if (!name && interactive) name = await ask("Display name (optional): ");
  if (!password && interactive) {
    password = await ask("Password (min 12 chars): ", true);
    const confirm = await ask("Confirm password: ", true);
    if (password !== confirm) throw new Error("Passwords do not match.");
  }
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD, or run in an interactive terminal.");

  await connectDB();
  const result = await provisionAdmin({ email, name, password, allowReset });
  await disconnectDB();
  if (result === "exists") {
    console.log(`An admin with ${email} already exists. Re-run with --reset to change its password.`);
  } else {
    console.log(result === "created" ? `Admin ${email} created.` : `Password reset for ${email}; all sessions were signed out.`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
