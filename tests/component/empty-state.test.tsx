import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EmptyState } from '@/components/features/empty-state';

describe('EmptyState', () => {
  it('renders title, description, and a CTA link', () => {
    render(
      <EmptyState
        title="Log your first activity"
        description="Add a commute or a meal to get started."
        ctaLabel="Log an activity"
        ctaHref="/log"
      />
    );
    expect(
      screen.getByRole('heading', { name: /log your first activity/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add a commute or a meal/i)
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /log an activity/i });
    expect(link).toHaveAttribute('href', '/log');
  });

  it('omits the CTA when not provided', () => {
    render(<EmptyState title="Nothing here" description="Empty." />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
