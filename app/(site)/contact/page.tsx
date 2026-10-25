import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { SectionHeader } from "@/components/site/section-header";
import { getSiteSettings } from "@/lib/data/public";
import { resumeHref } from "@/lib/resume";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMeta(await getSiteSettings(), "contact", "Contact", "/contact");
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { contact, profile } = settings;
  return (
    <div className="container-page pt-12 md:pt-16">
      <SectionHeader
        as="h1"
        label="Contact"
        heading="Get in touch"
        intro={contact.formIntro || settings.seo.pages.contact.description || "For roles, collaborations or project enquiries, send a message or email me directly."}
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-10">
        <aside>
          <dl className="card space-y-6 p-6">
            {contact.email ? (
              <div>
                <dt className="meta">Email</dt>
                <dd className="mt-1.5">
                  <a href={`mailto:${contact.email}`} className="link break-all text-lead text-ink">
                    {contact.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {profile.availability ? (
              <div>
                <dt className="meta">Availability</dt>
                <dd className="mt-1.5 text-ink">{profile.availability}</dd>
              </div>
            ) : null}
            {profile.location ? (
              <div>
                <dt className="meta">Based in</dt>
                <dd className="mt-1.5 text-ink">{profile.location}</dd>
              </div>
            ) : null}
            {contact.socials.length ? (
              <div>
                <dt className="meta">Elsewhere</dt>
                <dd className="mt-1.5">
                  <ul className="space-y-1.5">
                    {contact.socials.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-ink">
                          {s.label}
                          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {resumeHref(settings) ? (
              <div>
                <dt className="meta">Résumé</dt>
                <dd className="mt-1.5">
                  <a href={resumeHref(settings)} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-ink">
                    View résumé <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
        <div className="card p-6 md:p-8">
          {contact.formEnabled ? (
            <ContactForm responseNote={contact.responseNote} />
          ) : (
            <p className="text-ink-2">
              The contact form is closed at the moment.{contact.email ? " Please use the email address listed here." : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
