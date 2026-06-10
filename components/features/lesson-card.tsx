import { GraduationCap } from 'lucide-react';

import { lessonForCategory } from '@/lib/services/education';
import type { CategoryKey } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Contextual micro-lesson (spec §16.4) tied to the user's biggest category.
 * Renders nothing if no lesson matches.
 */
export function LessonCard({ categoryKey }: { categoryKey: CategoryKey }) {
  const lesson = lessonForCategory(categoryKey);
  if (!lesson) return null;

  return (
    <Card className="bg-leaf-50">
      <CardHeader className="pb-2">
        <p className="flex items-center gap-2 text-sm font-medium text-forest-700">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Did you know?
        </p>
        <CardTitle className="text-lg">{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground">{lesson.body}</p>
      </CardContent>
    </Card>
  );
}
