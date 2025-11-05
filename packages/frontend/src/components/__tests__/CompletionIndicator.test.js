/**
 * CompletionIndicator Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import CompletionIndicator from '../CompletionIndicator';

describe('CompletionIndicator', () => {
  describe('Rendering', () => {
    it('should render uncompleted state by default', () => {
      render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      const indicator = screen.getByRole('checkbox', { name: /mark test task as complete/i });
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-checked', 'false');
    });

    it('should render completed state with checkmark', () => {
      render(
        <CompletionIndicator
          isCompleted={true}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      const indicator = screen.getByRole('checkbox', { name: /mark test task as incomplete/i });
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-checked', 'true');
      
      // Check for checkmark SVG
      const svg = indicator.querySelector('svg.checkmark');
      expect(svg).toBeInTheDocument();
    });

    it('should apply completed class when isCompleted is true', () => {
      const { container } = render(
        <CompletionIndicator
          isCompleted={true}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      const button = container.querySelector('.completion-indicator');
      expect(button).toHaveClass('completed');
    });

    it('should not apply completed class when isCompleted is false', () => {
      const { container } = render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      const button = container.querySelector('.completion-indicator');
      expect(button).not.toHaveClass('completed');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when clicked', () => {
      const handleChange = jest.fn();
      render(
        <CompletionIndicator
          isCompleted={false}
          onChange={handleChange}
          taskTitle="Test Task"
        />
      );

      const indicator = screen.getByRole('checkbox', { name: /mark test task as complete/i });
      fireEvent.click(indicator);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should stop event propagation when clicked', () => {
      const handleChange = jest.fn();
      const handleParentClick = jest.fn();

      const { container } = render(
        <div onClick={handleParentClick}>
          <CompletionIndicator
            isCompleted={false}
            onChange={handleChange}
            taskTitle="Test Task"
          />
        </div>
      );

      const indicator = screen.getByRole('checkbox', { name: /mark test task as complete/i });
      fireEvent.click(indicator);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleParentClick).not.toHaveBeenCalled();
    });

    it('should be keyboard accessible', () => {
      const handleChange = jest.fn();
      render(
        <CompletionIndicator
          isCompleted={false}
          onChange={handleChange}
          taskTitle="Test Task"
        />
      );

      const indicator = screen.getByRole('checkbox', { name: /mark test task as complete/i });
      
      // Test with Enter key
      fireEvent.keyDown(indicator, { key: 'Enter', code: 'Enter' });
      fireEvent.click(indicator);
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      const indicator = screen.getByRole('checkbox');
      expect(indicator).toBeInTheDocument();
    });

    it('should have aria-checked attribute', () => {
      const { rerender } = render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      let indicator = screen.getByRole('checkbox');
      expect(indicator).toHaveAttribute('aria-checked', 'false');

      rerender(
        <CompletionIndicator
          isCompleted={true}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      indicator = screen.getByRole('checkbox');
      expect(indicator).toHaveAttribute('aria-checked', 'true');
    });

    it('should have descriptive aria-label based on task title and state', () => {
      const { rerender } = render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Buy groceries"
        />
      );

      let indicator = screen.getByRole('checkbox', { name: /mark buy groceries as complete/i });
      expect(indicator).toBeInTheDocument();

      rerender(
        <CompletionIndicator
          isCompleted={true}
          onChange={() => {}}
          taskTitle="Buy groceries"
        />
      );

      indicator = screen.getByRole('checkbox', { name: /mark buy groceries as incomplete/i });
      expect(indicator).toBeInTheDocument();
    });

    it('should be a button element with type="button"', () => {
      const { container } = render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      const button = container.querySelector('button[type="button"]');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should render indicator circle element', () => {
      const { container } = render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      const circle = container.querySelector('.indicator-circle');
      expect(circle).toBeInTheDocument();
    });

    it('should show checkmark SVG only when completed', () => {
      const { container, rerender } = render(
        <CompletionIndicator
          isCompleted={false}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      let checkmark = container.querySelector('.checkmark');
      expect(checkmark).not.toBeInTheDocument();

      rerender(
        <CompletionIndicator
          isCompleted={true}
          onChange={() => {}}
          taskTitle="Test Task"
        />
      );

      checkmark = container.querySelector('.checkmark');
      expect(checkmark).toBeInTheDocument();
    });
  });
});
