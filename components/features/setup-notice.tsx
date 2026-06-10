import { AlertTriangle } from 'lucide-react';

/**
 * Shown when Supabase credentials are missing, so a fresh clone boots to a
 * helpful screen instead of a crash. Render only when `!isSupabaseConfigured()`.
 */
export function SetupNotice() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-card border border-amber-400/50 bg-amber-400/10 p-4 text-left"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
        aria-hidden="true"
      />
      <div className="space-y-1 text-sm">
        <p className="font-medium text-slate-900">Connect Supabase to continue</p>
        <p className="text-muted-foreground">
          Copy{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            .env.example
          </code>{' '}
          to{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>, add
          your project URL, anon key and database connection strings, then
          restart the dev server. See the README “Getting started” section for
          step-by-step instructions.
        </p>
      </div>
    </div>
  );
}
