import { ButtonLink } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <section className="container-page py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-title-1 font-semibold">This page doesn’t exist.</h1>
        <p className="mt-6 text-lead text-ink-2">
          The link may be outdated, or the content may have been unpublished. Try the index pages instead.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/projects" variant="secondary">
            Browse projects
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
