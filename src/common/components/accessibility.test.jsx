import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';
import SearchInput from './SearchInput';

describe('shared component accessibility', () => {
  it('labels search and clears its value', () => {
    const onChange = vi.fn();
    render(<SearchInput value="loan" onChange={onChange} label="Search loans" />);
    expect(screen.getByRole('textbox', { name: 'Search loans' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('exposes a modal dialog and closes it with Escape', () => {
    const onClose = vi.fn();
    render(<Modal isOpen title="Record payment" onClose={onClose}><button>Save</button></Modal>);
    expect(screen.getByRole('dialog', { name: 'Record payment' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
