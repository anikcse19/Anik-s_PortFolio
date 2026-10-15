import { SectionHeader } from "@/components/site/section-header";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/json-ld";
import { RichText } from "@/components/ui/rich-content";
import { SiteImage } from "@/components/ui/site-image";
import { getSiteSettings } from "@/lib/data/public";
import { sanitizeRichText } from "@/lib/sanitize";
import { pageMeta, personJsonLd } from "@/lib/seo";
import { padIndex } from "@/lib/utils";
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

      <div className="grid-page mt-12 gap-y-10">
        {profile.portrait?.url ? (
          <figure className="col-span-4 md:col-span-3 lg:col-span-3">
            <SiteImage src={profile.portrait.url} alt={profile.portrait.alt} aspect="4 / 5" sizes="(min-width: 1024px) 300px, 50vw" priority className="border border-rule grayscale-[15%]" />
            {profile.portrait.caption ? <figcaption className="mt-2 text-sm text-ink-3">{profile.portrait.caption}</figcaption> : null}
          </figure>
        ) : null}
        <div className={profile.portrait?.url ? "col-span-4 md:col-span-5 lg:col-span-8 lg:col-start-5" : "col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-4"}>
          {intro ? <RichText html={about.sections[intro]} className="text-lead [&_p]:text-ink" /> : <p className="text-lead text-ink-2">{profile.positioning}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Get in touch</ButtonLink>
            {profile.resumeUrl ? (
              <ButtonLink href={profile.resumeUrl} variant="secondary">
                Résumé
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>

      {rest.length ? (
        <div className="mt-24 space-y-16">
          {rest.map((key, i) => (
            <section key={key} aria-labelledby={`about-${key}`} className="grid-page gap-y-4 border-t border-rule pt-5">
              <h2 id={`about-${key}`} className="col-span-4 md:col-span-2 lg:col-span-3 label !text-ink-2">
                <span className="text-accent">{padIndex(i)}</span> — {ABOUT_SECTION_LABELS[key]}
              </h2>
              <div className="col-span-4 md:col-span-6 lg:col-span-8">
                <RichText html={about.sections[key]} />
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
