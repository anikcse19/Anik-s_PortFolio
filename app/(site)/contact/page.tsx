import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { SectionHeader } from "@/components/site/section-header";
import { getSiteSettings } from "@/lib/data/public";
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
      <div className="grid-page mt-14 gap-y-12">
        <aside className="col-span-4 md:col-span-8 lg:col-span-4">
          <dl className="space-y-6 border-t border-rule pt-5">
            {contact.email ? (
              <div>
                <dt className="label">Email</dt>
                <dd className="mt-1.5">
                  <a href={`mailto:${contact.email}`} className="link break-all text-lead text-ink">
                    {contact.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {profile.availability ? (
              <div>
                <dt className="label">Availability</dt>
                <dd className="mt-1.5 text-ink">{profile.availability}</dd>
              </div>
            ) : null}
            {profile.location ? (
              <div>
                <dt className="label">Based in</dt>
                <dd className="mt-1.5 text-ink">{profile.location}</dd>
              </div>
            ) : null}
            {contact.socials.length ? (
              <div>
                <dt className="label">Elsewhere</dt>
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
            {profile.resumeUrl ? (
              <div>
                <dt className="label">Résumé</dt>
                <dd className="mt-1.5">
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-ink">
                    View résumé <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
        <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
          {contact.formEnabled ? (
            <ContactForm responseNote={contact.responseNote} />
          ) : (
            <p className="border-t border-rule pt-5 text-ink-2">
              The contact form is closed at the moment.{contact.email ? " Please use the email address listed here." : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
