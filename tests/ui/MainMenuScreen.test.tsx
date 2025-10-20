/*
 * MainMenuScreen Tests
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenuScreen } from '../../src/screens/MainMenuScreen.js';

describe('MainMenuScreen', () => {
  const mockHandlers = {
    onNewGame: vi.fn(),
    onContinue: vi.fn(),
    onLoadGame: vi.fn(),
    onSettings: vi.fn(),
    onExit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders all menu items', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      expect(screen.getByRole('menuitem', { name: 'New Game' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Continue' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Load Game' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Exit' })).toBeInTheDocument();
    });

    test('displays title and subtitle', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      expect(screen.getByText('NextEra')).toBeInTheDocument();
      expect(screen.getByText('Battle-First Roguelike')).toBeInTheDocument();
    });

    test('shows keyboard hints', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      expect(screen.getByText(/Use ↑↓ arrows to navigate/)).toBeInTheDocument();
    });
  });

  describe('Continue Button State', () => {
    test('Continue button enabled when hasSaves=true', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      const continueButton = screen.getByRole('menuitem', { name: 'Continue' });
      expect(continueButton).not.toBeDisabled();
    });

    test('Continue button disabled when hasSaves=false', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={false} />);

      const continueButton = screen.getByRole('menuitem', { name: 'Continue' });
      expect(continueButton).toBeDisabled();
    });

    test('Shows warning when no saves exist', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={false} />);

      expect(screen.getByText(/Continue disabled - no saved games found/)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('ArrowDown moves selection down', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      // First item should have tabIndex 0
      const newGameButton = screen.getByRole('menuitem', { name: 'New Game' });
      expect(newGameButton).toHaveAttribute('tabIndex', '0');

      // Press ArrowDown
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      // Second item should now have tabIndex 0
      const continueButton = screen.getByRole('menuitem', { name: 'Continue' });
      expect(continueButton).toHaveAttribute('tabIndex', '0');
    });

    test('ArrowUp moves selection up', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      // Move down first
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      // Now move up
      fireEvent.keyDown(window, { key: 'ArrowUp' });

      const continueButton = screen.getByRole('menuitem', { name: 'Continue' });
      expect(continueButton).toHaveAttribute('tabIndex', '0');
    });

    test('Enter key triggers selected action', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockHandlers.onNewGame).toHaveBeenCalledTimes(1);
    });

    test('Space key triggers selected action', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      fireEvent.keyDown(window, { key: ' ' });

      expect(mockHandlers.onNewGame).toHaveBeenCalledTimes(1);
    });

    test('Escape key calls onExit', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockHandlers.onExit).toHaveBeenCalledTimes(1);
    });

    test('Skips disabled items when navigating', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={false} />);

      // Start at New Game (index 0)
      // ArrowDown should skip Continue (disabled) and go to Load Game (index 2)
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      const loadGameButton = screen.getByRole('menuitem', { name: 'Load Game' });
      expect(loadGameButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Click Handlers', () => {
    test('New Game button calls onNewGame', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      const newGameButton = screen.getByRole('menuitem', { name: 'New Game' });
      fireEvent.click(newGameButton);

      expect(mockHandlers.onNewGame).toHaveBeenCalledTimes(1);
    });

    test('Continue button calls onContinue when enabled', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      const continueButton = screen.getByRole('menuitem', { name: 'Continue' });
      fireEvent.click(continueButton);

      expect(mockHandlers.onContinue).toHaveBeenCalledTimes(1);
    });

    test('Load Game button calls onLoadGame', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      const loadGameButton = screen.getByRole('menuitem', { name: 'Load Game' });
      fireEvent.click(loadGameButton);

      expect(mockHandlers.onLoadGame).toHaveBeenCalledTimes(1);
    });

    test('Settings button calls onSettings', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      const settingsButton = screen.getByRole('menuitem', { name: 'Settings' });
      fireEvent.click(settingsButton);

      expect(mockHandlers.onSettings).toHaveBeenCalledTimes(1);
    });

    test('Exit button calls onExit', () => {
      render(<MainMenuScreen {...mockHandlers} hasSaves={true} />);

      const exitButton = screen.getByRole('menuitem', { name: 'Exit' });
      fireEvent.click(exitButton);

      expect(mockHandlers.onExit).toHaveBeenCalledTimes(1);
    });
  });
});
