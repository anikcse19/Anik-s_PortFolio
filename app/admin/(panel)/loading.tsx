/**
 * Shown instantly while an admin page renders on the server. Without it, clicking
 * a link to a dynamic route gives no feedback until the whole page has loaded,
 * and Next.js cannot prefetch anything for the destination.
 */
export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse pt-8">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-56 rounded-sm bg-surface" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-sm bg-surface" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-24 border border-rule bg-surface/60" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 rounded-sm bg-surface" />
        ))}
      </div>
    </div>
  );
}
