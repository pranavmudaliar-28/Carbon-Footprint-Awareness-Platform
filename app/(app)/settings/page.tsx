import Link from 'next/link';

import { requireUser } from '@/lib/api/auth';
import { prisma } from '@/lib/db/prisma';
import { monthKey } from '@/lib/services/aggregate';
import { DeleteAccount } from '@/components/features/delete-account';
import { GoalForm } from '@/components/features/goal-form';
import { ProfileForm } from '@/components/features/profile-form';
import { ThemeToggle } from '@/components/features/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = { title: 'Settings · Verda' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { dbUser } = await requireUser();
  const goal = await prisma.goal.findUnique({
    where: { userId_month: { userId: dbUser.id, month: monthKey(new Date()) } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Settings
      </h1>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="text-muted-foreground">Signed in as</p>
          <p className="font-medium">{dbUser.email}</p>
          {dbUser.profile?.baselineKg != null && (
            <p className="pt-2 text-muted-foreground">
              Baseline footprint:{' '}
              <span className="font-medium text-foreground">
                {dbUser.profile.baselineKg} kg CO₂e/month
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly goal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly goal</CardTitle>
          <CardDescription>
            Set a target and we’ll draw it on your dashboard trend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm currentTargetKg={goal?.targetKg ?? null} />
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>
            Personalize your name, household and region.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            name={dbUser.name ?? ''}
            householdSize={dbUser.profile?.householdSize ?? 1}
            country={dbUser.country}
          />
        </CardContent>
      </Card>

      {/* Appearance + baseline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance & baseline</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link href="/onboarding">Re-run baseline</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-ember-500/30">
        <CardHeader>
          <CardTitle className="text-lg">Privacy</CardTitle>
          <CardDescription>
            You own your data. Delete it anytime — we cascade-remove everything
            tied to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccount />
        </CardContent>
      </Card>
    </div>
  );
}
