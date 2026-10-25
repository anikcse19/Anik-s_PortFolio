"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Only the digest is logged; it maps to the server log entry without exposing details.
    if (error.digest) console.error("Page error", error.digest);
  }, [error]);

  return (
    <section className="container-page py-24">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 text-title-2 font-semibold">This page could not be loaded.</h1>
      <p className="mt-4 max-w-prose text-ink-2">It’s probably temporary. Please try again in a moment.</p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </section>
  );
}
