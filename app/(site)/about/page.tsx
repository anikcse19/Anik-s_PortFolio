import { SectionHeader } from "@/components/site/section-header";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/json-ld";
import { RichText } from "@/components/ui/rich-content";
import { SiteImage } from "@/components/ui/site-image";
import { getSiteSettings } from "@/lib/data/public";
import { sanitizeRichText } from "@/lib/sanitize";
import { pageMeta, personJsonLd } from "@/lib/seo";
import { resumeHref } from "@/lib/resume";
import { ABOUT_SECTION_KEYS, ABOUT_SECTION_LABELS } from "@/lib/validation/settings";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMeta(await getSiteSettings(), "about", "About", "/about");
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const { about, profile } = settings;
  const [intro, ...rest] = ABOUT_SECTION_KEYS.filter((k) => sanitizeRichText(about.sections[k]) !== "");

  return (
    <div className="container-page pt-12 md:pt-16">
      <JsonLd data={personJsonLd(settings)} />
      <SectionHeader as="h1" label="About" heading={about.headline || `About ${profile.name.split(" ")[0]}`} />

      <div className="mt-12 grid gap-10 md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16">
        {profile.portrait?.url ? (
          <figure>
            <SiteImage src={profile.portrait.url} alt={profile.portrait.alt} aspect="4 / 5" sizes="(min-width: 1024px) 320px, 50vw" priority className="rounded-2xl border border-rule" />
            {profile.portrait.caption ? <figcaption className="mt-2 text-sm text-ink-3">{profile.portrait.caption}</figcaption> : null}
          </figure>
        ) : null}
        <div className={profile.portrait?.url ? "max-w-3xl" : "max-w-3xl md:col-span-2"}>
          {intro ? <RichText html={about.sections[intro]} className="text-lead [&_p]:text-ink" /> : <p className="text-lead text-ink-2">{profile.positioning}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Get in touch</ButtonLink>
            {resumeHref(settings) ? (
              <ButtonLink href={resumeHref(settings)} variant="secondary">
                Résumé
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>

      {rest.length ? (
        <div className="mt-24 space-y-14">
          {rest.map((key) => (
            <section key={key} aria-labelledby={`about-${key}`} className="grid gap-4 border-t border-rule pt-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16">
              <h2 id={`about-${key}`} className="text-title-3 font-semibold">
                {ABOUT_SECTION_LABELS[key]}
              </h2>
              <div className="max-w-3xl">
                <RichText html={about.sections[key]} />
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
