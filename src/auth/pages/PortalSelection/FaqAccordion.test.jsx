import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FaqAccordion from './FaqAccordion';

const items = [
  ['How do I register?', 'Use the registration form.'],
  ['How do I get support?', 'Contact the support team.'],
];

describe('FaqAccordion', () => {
  it('exposes accordion state and switches the visible answer', () => {
    render(<FaqAccordion items={items} />);

    const first = screen.getByRole('button', { name: 'How do I register?' });
    const second = screen.getByRole('button', { name: 'How do I get support?' });
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Use the registration form.')).toBeVisible();

    fireEvent.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Contact the support team.')).toBeVisible();
  });
});
