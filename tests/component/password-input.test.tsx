import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PasswordInput } from '@/components/ui/password-input';

describe('PasswordInput', () => {
  it('starts hidden and toggles visibility with an accessible label', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" defaultValue="secret" />);

    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(input.type).toBe('text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input.type).toBe('password');
  });
});
