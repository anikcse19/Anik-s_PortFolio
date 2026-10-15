import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { connectDB } from "@/lib/db";
import { ArticleModel, CaseStudyModel, ProjectModel, SettingModel } from "@/lib/models";
import { isPrivateHostname, parseHttpUrl } from "@/lib/urls";
import { parseStoredSettings } from "@/lib/validation/settings";

/**
 * On-demand broken-link check for the dashboard. Only absolute http(s) URLs to
 * public hosts are requested; hosts that resolve to private networks are skipped
 * (SSRF guard). Requests use HEAD (falling back to a ranged GET), a short
 * timeout and no redirects-following beyond the first hop.
 */

export type LinkCheckResult = { url: string; where: string; ok: boolean; status: string };

const MAX_URLS = 40;
const CONCURRENCY = 5;
const TIMEOUT_MS = 6000;

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 4) return isPrivateHostname(address);
  const lower = address.toLowerCase();
  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80") || lower.startsWith("::ffff:127.") || lower.startsWith("::ffff:10.") || lower.startsWith("::ffff:192.168.");
}

async function resolvesToPublic(hostname: string): Promise<boolean> {
  try {
    const records = await lookup(hostname, { all: true });
    return records.length > 0 && records.every((r) => !isPrivateAddress(r.address));
  } catch {
    return false;
  }
}

async function checkOne(url: string): Promise<{ ok: boolean; status: string }> {
  const parsed = parseHttpUrl(url);
  if (!parsed) return { ok: false, status: "Invalid or private URL" };
  if (!(await resolvesToPublic(parsed.hostname))) return { ok: false, status: "Host does not resolve" };
  const attempt = async (method: "HEAD" | "GET") =>
    fetch(parsed, {
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "PortfolioLinkCheck/1.0", ...(method === "GET" ? { range: "bytes=0-0" } : {}) },
      cache: "no-store",
    });
  try {
    let res = await attempt("HEAD");
    if (res.status === 405 || res.status === 403 || res.status === 501) res = await attempt("GET");
    if (res.status >= 200 && res.status < 300) return { ok: true, status: String(res.status) };
    if (res.status >= 300 && res.status < 400) return { ok: true, status: `${res.status} redirect` };
    return { ok: false, status: String(res.status) };
  } catch (error) {
    return { ok: false, status: error instanceof Error && error.name === "TimeoutError" ? "Timed out" : "Unreachable" };
  }
}

export async function collectLinks(): Promise<{ url: string; where: string }[]> {
  await connectDB();
  const out: { url: string; where: string }[] = [];
  const add = (url: string | undefined | null, where: string) => {
    if (url && /^https?:\/\//i.test(url)) out.push({ url, where });
  };

  const projects = await ProjectModel.find({ status: "published" }).select("title liveUrl repoUrl coverImage gallery").lean();
  for (const p of projects as Array<Record<string, unknown>>) {
    const title = String(p.title);
    add(p.liveUrl as string, `${title} — live URL`);
    add(p.repoUrl as string, `${title} — repository`);
    add((p.coverImage as { url?: string } | null)?.url, `${title} — cover image`);
    for (const g of (p.gallery as { url: string }[]) ?? []) add(g.url, `${title} — gallery`);
  }
  const studies = await CaseStudyModel.find({ status: "published" }).select("title coverImage").lean();
  for (const c of studies as Array<Record<string, unknown>>) add((c.coverImage as { url?: string } | null)?.url, `${String(c.title)} — cover image`);
  const articles = await ArticleModel.find({ status: "published" }).select("title coverImage").lean();
  for (const a of articles as Array<Record<string, unknown>>) add((a.coverImage as { url?: string } | null)?.url, `${String(a.title)} — cover image`);

  const settings = await SettingModel.find({ key: { $in: ["profile", "contact", "seo"] } }).lean();
  const byKey = new Map(settings.map((s) => [s.key, s.value]));
  const profile = parseStoredSettings("profile", byKey.get("profile"));
  const contact = parseStoredSettings("contact", byKey.get("contact"));
  const seo = parseStoredSettings("seo", byKey.get("seo"));
  add(profile.resumeUrl, "Profile — résumé");
  add(profile.portrait?.url, "Profile — portrait");
  add(seo.ogImage, "SEO — social image");
  for (const s of contact.socials) add(s.url, `Social — ${s.label}`);

  const seen = new Set<string>();
  return out.filter((l) => (seen.has(l.url) ? false : (seen.add(l.url), true))).slice(0, MAX_URLS);
}

export async function checkLinks(): Promise<LinkCheckResult[]> {
  const links = await collectLinks();
  const results: LinkCheckResult[] = [];
  for (let i = 0; i < links.length; i += CONCURRENCY) {
    const batch = links.slice(i, i + CONCURRENCY);
    const checked = await Promise.all(batch.map(async (l) => ({ ...l, ...(await checkOne(l.url)) })));
    results.push(...checked);
  }
  return results;
}
