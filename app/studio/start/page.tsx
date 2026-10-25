import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { InquiryForm } from "@/components/studio/inquiry-form";
import { getSiteSettings } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/seo";
import { STUDIO_ROUTES, studioEmail } from "@/lib/studio";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Start a project",
  alternates: { canonical: absoluteUrl(STUDIO_ROUTES.start) },
};

const NEXT_STEPS = [
  { title: "I review your brief", body: "I read every inquiry personally and come back with questions or a first idea." },
  { title: "A short call", body: "We talk through goals, scope and constraints. Free and with no obligation." },
  { title: "Written proposal", body: "You get a scope, timeline and fixed quote to decide on in your own time." },
];

export default async function StartProjectPage() {
  const settings = await getSiteSettings();
  const { studio } = settings;
  const email = studioEmail(settings);
  return (
    <div className="container-page pt-12 md:pt-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <div>
          <p className="eyebrow">Start a project</p>
          <h1 className="mt-4 text-title-1 font-semibold">Tell me about your product.</h1>
          {studio.inquiry.intro ? <p className="mt-5 text-lead text-ink-2">{studio.inquiry.intro}</p> : null}

          <h2 className="mt-12 text-sm font-medium text-ink">What happens next</h2>
          <ol className="mt-4 space-y-5">
            {NEXT_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink">{step.title}</p>
                  <p className="mt-0.5 text-[0.9375rem] text-ink-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {email ? (
            <p className="mt-12 text-[0.9375rem] text-ink-2">
              Prefer email?{" "}
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-accent">
                <Mail aria-hidden className="h-4 w-4" />
                {email}
              </a>
            </p>
          ) : null}
        </div>

        <div className="card p-6 md:p-8">
          <InquiryForm
            services={studio.services.map((s) => s.title)}
            budgets={studio.inquiry.budgets}
            timelines={studio.inquiry.timelines}
            responseNote={studio.inquiry.responseNote}
          />
        </div>
      </div>
    </div>
  );
}
