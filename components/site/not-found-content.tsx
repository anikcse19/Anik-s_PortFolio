import { ButtonLink } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <section className="container-page grid-page py-24 md:py-32">
      <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-3">
        <p className="label">Error 404</p>
        <h1 className="mt-4 text-title-1 font-semibold">This page doesn’t exist.</h1>
        <p className="mt-6 max-w-prose text-lead text-ink-2">
          The link may be outdated, or the content may have been unpublished. Try the index pages instead.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/projects" variant="secondary">
            Browse projects
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
