import { ButtonLink } from "@/components/ui/button";
import { STUDIO_ROUTES } from "@/lib/studio";

export default function StudioNotFound() {
  return (
    <section className="container-page py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-title-1 font-semibold">This page doesn’t exist.</h1>
        <p className="mt-6 text-lead text-ink-2">The link may be outdated. Here are the best places to continue.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href={STUDIO_ROUTES.home}>Back to the studio</ButtonLink>
          <ButtonLink href={STUDIO_ROUTES.start} variant="secondary">
            Start a project
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
