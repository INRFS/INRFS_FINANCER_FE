import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Settings from './Settings';

vi.mock('../../../auth/authState', () => ({
  useAuth: () => ({ updateUser: vi.fn() }),
}));

vi.mock('../../../common/hooks/useApiQuery', () => {
  const queryResult = {
    data: {
      user: { fullName: { unexpected: true }, firstName: 'Bala', lastName: 'Rao', phone: { value: '9999999999' }, email: 'bala@example.com' },
      financer: { displayName: 'Bala Finance', city: 'Hyderabad', state: 'Telangana' },
      profileImage: null,
      plan: { name: 'Premium' },
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  };
  return { useApiQuery: () => queryResult };
});

describe('Financer Settings', () => {
  it('renders safely when optional API values are not primitive strings', () => {
    render(<Settings />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bala Rao')).toBeInTheDocument();
    expect(screen.getByText('No active plan')).toBeInTheDocument();
  });
});
