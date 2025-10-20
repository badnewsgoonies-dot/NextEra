/*
 * StarterSelectScreen Tests
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarterSelectScreen } from '../../src/screens/StarterSelectScreen.js';

describe('StarterSelectScreen', () => {
  const mockHandlers = {
    onSelect: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders all 12 starter units', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      expect(screen.getByText('Warrior')).toBeInTheDocument();
      expect(screen.getByText('Guardian')).toBeInTheDocument();
      expect(screen.getByText('Paladin')).toBeInTheDocument();
      expect(screen.getByText('Rogue')).toBeInTheDocument();
      expect(screen.getByText('Mage')).toBeInTheDocument();
      expect(screen.getByText('Ranger')).toBeInTheDocument();
      expect(screen.getByText('Cleric')).toBeInTheDocument();
      expect(screen.getByText('Shaman')).toBeInTheDocument();
      expect(screen.getByText('Bard')).toBeInTheDocument();
      expect(screen.getByText('Necromancer')).toBeInTheDocument();
      expect(screen.getByText('Engineer')).toBeInTheDocument();
      expect(screen.getByText('Summoner')).toBeInTheDocument();
    });

    test('displays selection counter', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      expect(screen.getByText(/Selected: 0\/4/)).toBeInTheDocument();
    });

    test('Start button is disabled initially', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      const startButton = screen.getByText(/Start Journey/);
      expect(startButton).toBeDisabled();
    });
  });

  describe('Unit Selection', () => {
    test('can select a unit', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      const warriorCard = screen.getByRole('checkbox', { name: /Warrior/ });
      fireEvent.click(warriorCard);

      expect(screen.getByText(/Selected: 1\/4/)).toBeInTheDocument();
    });

    test('can select up to 4 units', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      fireEvent.click(screen.getByRole('checkbox', { name: /Warrior/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Rogue/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Cleric/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Mage/ }));

      expect(screen.getByText(/Selected: 4\/4/)).toBeInTheDocument();
      expect(screen.getByText(/Ready to start!/)).toBeInTheDocument();
    });

    test('cannot select more than 4 units', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      // Select 4 units
      fireEvent.click(screen.getByRole('checkbox', { name: /Warrior/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Rogue/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Cleric/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Mage/ }));

      // Try to select 5th
      fireEvent.click(screen.getByRole('checkbox', { name: /Ranger/ }));

      // Should still be 4
      expect(screen.getByText(/Selected: 4\/4/)).toBeInTheDocument();
    });

    test('can deselect a unit', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      const warriorCard = screen.getByRole('checkbox', { name: /Warrior/ });
      
      // Select
      fireEvent.click(warriorCard);
      expect(screen.getByText(/Selected: 1\/4/)).toBeInTheDocument();

      // Deselect
      fireEvent.click(warriorCard);
      expect(screen.getByText(/Selected: 0\/4/)).toBeInTheDocument();
    });
  });

  describe('Start Button', () => {
    test('Start button enabled when 4 units selected', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      fireEvent.click(screen.getByRole('checkbox', { name: /Warrior/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Rogue/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Cleric/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Mage/ }));

      const startButton = screen.getByText(/Start Journey/);
      expect(startButton).not.toBeDisabled();
    });

    test('clicking Start calls onSelect with selected units', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      fireEvent.click(screen.getByRole('checkbox', { name: /Warrior/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Rogue/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Cleric/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Mage/ }));

      const startButton = screen.getByText(/Start Journey/);
      fireEvent.click(startButton);

      expect(mockHandlers.onSelect).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onSelect).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Warrior' }),
          expect.objectContaining({ name: 'Rogue' }),
          expect.objectContaining({ name: 'Cleric' }),
          expect.objectContaining({ name: 'Mage' }),
        ])
      );
    });
  });

  describe('Cancel Button', () => {
    test('Cancel button calls onCancel', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      const cancelButton = screen.getByText(/Back to Menu/);
      fireEvent.click(cancelButton);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    test('Arrow keys navigate between units', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      // First unit should have tabIndex 0
      const firstUnit = screen.getByRole('checkbox', { name: /Warrior/ });
      expect(firstUnit).toHaveAttribute('tabIndex', '0');

      // Press ArrowRight
      fireEvent.keyDown(window, { key: 'ArrowRight' });

      // Second unit should now have tabIndex 0
      const secondUnit = screen.getByRole('checkbox', { name: /Guardian/ });
      expect(secondUnit).toHaveAttribute('tabIndex', '0');
    });

    test('Space key selects focused unit', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      fireEvent.keyDown(window, { key: ' ' });

      expect(screen.getByText(/Selected: 1\/4/)).toBeInTheDocument();
    });

    test('Escape key calls onCancel', () => {
      render(<StarterSelectScreen {...mockHandlers} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
