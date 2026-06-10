import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StatCard } from '@/components/features/stat-card';

describe('StatCard', () => {
  it('renders the value and label', () => {
    render(<StatCard label="This month" value={26} animate={false} />);
    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByText('26.0')).toBeInTheDocument();
  });

  it('shows a downward (improvement) delta for a negative change', () => {
    render(
      <StatCard
        label="This month"
        value={26}
        deltaKg={-5}
        deltaPct={-16}
        animate={false}
      />
    );
    expect(screen.getByText(/Down 5 kg \(16%\) vs last month/i)).toBeInTheDocument();
  });

  it('shows an upward delta for a positive change', () => {
    render(
      <StatCard label="This month" value={26} deltaKg={4} deltaPct={18} animate={false} />
    );
    expect(screen.getByText(/Up 4 kg \(18%\) vs last month/i)).toBeInTheDocument();
  });

  it('shows "no change" when delta is zero or null', () => {
    render(<StatCard label="This month" value={26} deltaKg={0} animate={false} />);
    expect(screen.getByText(/No change vs last month/i)).toBeInTheDocument();
  });
});
