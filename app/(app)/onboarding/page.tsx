import { OnboardingForm } from '@/components/features/onboarding-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = { title: 'Get started · Verda' };

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Let’s find your starting point</CardTitle>
          <CardDescription>
            Three quick questions give us a baseline footprint to measure your
            progress against. You can refine it anytime by logging activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
