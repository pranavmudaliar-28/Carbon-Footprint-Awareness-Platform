/**
 * Streamed instantly on every (app) navigation so clicks feel responsive while
 * the server component fetches. Mirrors the dashboard's rough shape.
 */
export default function AppLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded-button bg-muted" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-card border border-border bg-muted/40"
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-card border border-border bg-muted/40"
          />
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
