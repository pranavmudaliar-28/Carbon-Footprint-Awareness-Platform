import { LESSONS } from '@/lib/constants/lessons';
import { CATEGORY_META } from '@/lib/constants/categories';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Learn · Verda' };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Learn
        </h1>
        <p className="text-sm text-muted-foreground">
          60-second reads on what actually moves your footprint. No jargon, no
          guilt.
        </p>
      </header>

      <div className="space-y-4">
        {LESSONS.map((lesson) => (
          <Card key={lesson.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                {lesson.relatedCategory && (
                  <Badge variant="secondary">
                    {CATEGORY_META[lesson.relatedCategory].label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{lesson.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
