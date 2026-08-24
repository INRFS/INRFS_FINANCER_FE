import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import SearchInput from './SearchInput';
import { CheckCircle } from 'lucide-react';

describe('Common Components Suite', () => {
  describe('Button', () => {
    it('renders text, icon, and handles clicks', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="secondary" size="small" icon={CheckCircle} onClick={handleClick}>
          Submit Application
        </Button>
      );

      const btn = screen.getByRole('button', { name: /submit application/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveClass('common-btn-secondary');
      expect(btn).toHaveClass('common-btn-small');

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button and applies full width class when configured', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled fullWidth onClick={handleClick}>
          Disabled Button
        </Button>
      );

      const btn = screen.getByRole('button', { name: /disabled button/i });
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass('common-btn-full');

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('StatusBadge', () => {
    it('renders normalized status class and label', () => {
      const { rerender } = render(<StatusBadge status="In Progress" />);
      expect(screen.getByText('In Progress')).toHaveClass('common-badge-in-progress');

      rerender(<StatusBadge status="ACTIVE" label="Active Loan" />);
      expect(screen.getByText('Active Loan')).toHaveClass('common-badge-active');
    });
  });

  describe('Modal', () => {
    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} title="Hidden Modal" onClose={vi.fn()}>
          <p>Hidden Content</p>
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog and handles Escape key and backdrop clicks', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} title="Loan Details" onClose={handleClose}>
          <p>Modal Body</p>
          <button type="button">Inside Button</button>
        </Modal>
      );

      expect(screen.getByRole('dialog', { name: 'Loan Details' })).toBeInTheDocument();
      expect(screen.getByText('Modal Body')).toBeInTheDocument();

      // Click close button
      fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(2);

      // Backdrop overlay click
      const overlay = screen.getByRole('dialog').parentElement;
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('SearchInput', () => {
    it('renders input with value, placeholder, and handles change and clear', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <SearchInput value="test query" onChange={handleChange} placeholder="Search anything..." />
      );

      const input = screen.getByPlaceholderText('Search anything...');
      expect(input).toHaveValue('test query');

      fireEvent.change(input, { target: { value: 'new query' } });
      expect(handleChange).toHaveBeenCalledWith('new query');

      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);
      expect(handleChange).toHaveBeenCalledWith('');

      rerender(<SearchInput value="" onChange={handleChange} />);
      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    });
  });
});
