import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  ArrowDownRight,
  Sparkles,
  ShieldCheck,
  Database,
  Cpu,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { SetupNotice } from '@/components/features/setup-notice';
import { ThemeToggle } from '@/components/features/theme-toggle';
import { AppPreview } from '@/components/marketing/app-preview';
import { Reveal } from '@/components/marketing/reveal';
import { DailyTimeline } from '@/components/marketing/daily-timeline';
import { HiddenSources } from '@/components/marketing/hidden-sources';
import { SavingsCalculator } from '@/components/marketing/savings-calculator';
import { CarbonScore } from '@/components/marketing/carbon-score';

const accentCta =
  'border-0 bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))] font-semibold text-[hsl(var(--l-on-accent))] hover:opacity-90';
const glassCta =
  'border border-[hsl(var(--l-fg)/0.15)] bg-[hsl(var(--l-fg)/0.05)] text-[hsl(var(--l-fg))] hover:bg-[hsl(var(--l-fg)/0.1)]';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.05)] px-4 py-1.5 text-sm font-medium text-[hsl(var(--l-accent-2))]">
      {children}
    </p>
  );
}

export default async function Home() {
  const configured = isSupabaseConfigured();
  if (configured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/dashboard');
  }

  return (
    <div className="landing flex min-h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--l-fg)/0.05)] bg-[hsl(var(--l-bg)/0.7)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="text-[hsl(var(--l-accent-2))]" />
          <nav className="flex items-center gap-2">
            <ThemeToggle className={glassCta} />
            <Button asChild variant="ghost" className={`hidden sm:inline-flex ${glassCta}`}>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className={accentCta}>
              <Link href="/signup">Start free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--l-accent)/0.18)] blur-3xl"
          style={{ animation: 'glow-pulse 8s ease-in-out infinite' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-[hsl(var(--l-accent-2)/0.16)] blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <Eyebrow>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Your day has a carbon number
            </Eyebrow>
            <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-[hsl(var(--l-fg))] sm:text-5xl lg:text-6xl">
              See the carbon hiding in your day —{' '}
              <span className="bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))] bg-clip-text text-transparent">
                and the one swap
              </span>{' '}
              that erases the most of it.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[hsl(var(--l-muted))]">
              From your morning commute to tonight’s dinner, Verda turns every
              choice into kilograms of CO₂ — then names the single change with
              the biggest payoff.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className={accentCta}>
                <Link href="/signup">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className={glassCta}>
                <Link href="#story">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-[hsl(var(--l-muted))]">
              Free · No card needed · Built on DEFRA &amp; Our World in Data
            </p>
            {!configured && (
              <div className="mt-8 max-w-xl">
                <SetupNotice />
              </div>
            )}
          </div>

          <div className="flex justify-center duration-700 animate-in fade-in lg:justify-end">
            <AppPreview />
          </div>
        </div>

        {/* proof chips */}
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[hsl(var(--l-muted))]">
            <span className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[hsl(var(--l-accent-2))]" /> Powered by
              Claude AI
            </span>
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[hsl(var(--l-accent-2))]" />{' '}
              Open-data emission factors
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--l-accent-2))]" />{' '}
              Privacy-first (row-level security)
            </span>
          </div>
        </div>
      </section>

      {/* Your carbon story today */}
      <section id="story" className="mx-auto w-full max-w-6xl px-6 py-16">
        <Reveal className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
              Your carbon story, hour by hour
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--l-muted))]">
              This is a Tuesday. Yours looks different — that’s exactly the
              point. Verda makes the invisible add up in front of you, so a
              vague worry becomes a number you can actually move.
            </p>
          </div>
          <DailyTimeline />
        </Reveal>
      </section>

      {/* Where it really comes from */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Reveal className="grid items-center gap-10 rounded-3xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.03)] p-8 backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:p-12">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
              Most people guess wrong about their biggest source
            </h2>
            <p className="mt-4 max-w-xl text-lg text-[hsl(var(--l-muted))]">
              The numbers don’t. Verda rolls everything into one honest picture
              — and shows you precisely which slice of your life weighs the
              most.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { label: 'Transport', pct: 46 },
                { label: 'Home energy', pct: 28 },
                { label: 'Food', pct: 18 },
                { label: 'Everything else', pct: 8 },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-sm text-[hsl(var(--l-fg))]">
                    <span>{b.label}</span>
                    <span className="tabular-nums text-[hsl(var(--l-muted))]">
                      {b.pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[hsl(var(--l-fg)/0.05)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))]"
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid justify-items-center gap-3">
            <CarbonScore score={71} suffix="% lighter" />
            <p className="text-center text-sm text-[hsl(var(--l-muted))]">
              Your footprint vs the
              <br />
              <span className="text-[hsl(var(--l-accent-2))]">
                India per-capita average
              </span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* The footprint you can't feel */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
              The footprint you can’t feel
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--l-muted))]">
              The heaviest emitters are rarely the ones you’d suspect. A few
              quietly outweigh weeks of careful choices.
            </p>
          </div>
          <div className="mt-10">
            <HiddenSources />
          </div>
        </Reveal>
      </section>

      {/* The one habit that moves the needle */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Reveal className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
              The one habit that moves the needle
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--l-muted))]">
              Claude reads your data and points to the change worth making
              first — then does the math on what it’s worth. Drag below to feel
              it.
            </p>

            {/* sample insight card */}
            <div className="mt-6 rounded-2xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.04)] p-5 backdrop-blur-xl">
              <p className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--l-accent-2))]">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Your AI coach
              </p>
              <p className="mt-2 font-heading text-lg font-semibold text-[hsl(var(--l-fg))]">
                Transport is 64% of your footprint — your biggest opportunity.
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--l-muted))]">
                Two bus commutes a week instead of driving saves about 28 kg
                CO₂e a month.
              </p>
            </div>
          </div>

          <SavingsCalculator />
        </Reveal>
      </section>

      {/* Watch the number fall */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Reveal className="grid items-center gap-10 rounded-3xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.03)] p-8 backdrop-blur-xl lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
              Watch the number fall
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--l-muted))]">
              Small swaps compound. Verda keeps score — week after week — so the
              motivation doesn’t fade after day three.
            </p>
            {/* streak dots */}
            <div className="mt-6 flex items-center gap-1.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-6 w-3 rounded-full ${
                    i < 11
                      ? 'bg-gradient-to-b from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))]'
                      : 'bg-[hsl(var(--l-fg)/0.1)]'
                  }`}
                />
              ))}
              <span className="ml-3 text-sm font-medium text-[hsl(var(--l-accent-2))]">
                11-day streak
              </span>
            </div>
          </div>

          {/* before vs after */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.03)] p-5">
              <p className="text-xs uppercase tracking-wide text-[hsl(var(--l-muted))]">
                Before
              </p>
              <p className="mt-1 font-heading text-3xl font-bold text-[hsl(var(--l-fg))]">
                412 kg
              </p>
              <p className="text-xs text-[hsl(var(--l-muted))]">last month</p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--l-accent)/0.4)] bg-[hsl(var(--l-accent)/0.08)] p-5">
              <p className="text-xs uppercase tracking-wide text-[hsl(var(--l-accent-2))]">
                On track for
              </p>
              <p className="mt-1 bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))] bg-clip-text font-heading text-3xl font-bold text-transparent">
                327 kg
              </p>
              <p className="flex items-center gap-1 text-xs text-[hsl(var(--l-accent-2))]">
                <ArrowDownRight className="h-3 w-3" /> 85 kg lighter
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16">
        <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[hsl(var(--l-fg)/0.1)] bg-gradient-to-br from-[hsl(var(--l-accent)/0.18)] to-[hsl(var(--l-accent-2)/0.12)] px-8 py-16 text-center backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[hsl(var(--l-accent)/0.25)] blur-3xl"
          />
          <h2 className="relative font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
            Start your carbon story today
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[hsl(var(--l-muted))]">
            One activity is all it takes to see your first number. Small steps
            add up faster than you’d think.
          </p>
          <Button asChild size="lg" className={`relative mt-8 ${accentCta}`}>
            <Link href="/signup">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[hsl(var(--l-fg)/0.05)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm">
            <Logo className="text-[hsl(var(--l-accent-2))]" />
            <p className="mt-3 text-sm text-[hsl(var(--l-muted))]">
              A personal carbon companion — built on open-data emission factors
              from DEFRA, India CEA &amp; Our World in Data.
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <Link href="/signup" className="text-[hsl(var(--l-muted))] hover:text-[hsl(var(--l-fg))]">
              Start free
            </Link>
            <Link href="/login" className="text-[hsl(var(--l-muted))] hover:text-[hsl(var(--l-fg))]">
              Log in
            </Link>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--l-fg)/0.05)] py-4 text-center text-xs text-[hsl(var(--l-muted))]">
          © 2026 Verda · Hosted on green energy.
        </div>
      </footer>
    </div>
  );
}
