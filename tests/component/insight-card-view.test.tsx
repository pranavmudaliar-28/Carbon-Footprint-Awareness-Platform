import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import {
  InsightCardView,
  type EnrichedInsight,
} from '@/components/features/insight-card-view';

const base: EnrichedInsight = {
  headline: 'Transport is 64% of your footprint',
  action: 'Swap two car commutes for the bus',
  estimatedSavingKg: 28,
  category: 'transport',
  difficulty: 'low',
  source: 'fallback',
  recommendationId: 'rec-1',
  equivalentKm: 165,
};

describe('InsightCardView', () => {
  it('renders the headline, action, saving line and the CTA children', () => {
    const { container } = render(
      <InsightCardView insight={base}>
        <button type="button">Adopt this action</button>
      </InsightCardView>
    );

    expect(
      screen.getByRole('heading', { name: /transport is 64%/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/swap two car commutes for the bus/i)
    ).toBeInTheDocument();
    expect(container.textContent).toContain('28 kg CO₂e/month');
    expect(container.textContent).toContain('165 km not driven');
    expect(
      screen.getByRole('button', { name: /adopt this action/i })
    ).toBeInTheDocument();
  });

  it('labels the source — "Smart suggestion" for fallback, "Your AI coach" for ai', () => {
    const { rerender } = render(<InsightCardView insight={base} />);
    expect(screen.getByText(/smart suggestion/i)).toBeInTheDocument();

    rerender(<InsightCardView insight={{ ...base, source: 'ai' }} />);
    expect(screen.getByText(/your ai coach/i)).toBeInTheDocument();
  });
});
