import { ActionsList } from '@/components/features/actions-list';

export const metadata = { title: 'Actions · Verda' };

export default function ActionsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Actions
        </h1>
        <p className="text-sm text-muted-foreground">
          Accept an action and we’ll fold its expected saving into your projected
          footprint. Small steps add up.
        </p>
      </header>

      <ActionsList />
    </div>
  );
}
