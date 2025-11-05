/**
 * QuickAdd component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickAdd from '../../components/QuickAdd';

describe('QuickAdd Component', () => {
  const mockOnAddTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field', () => {
    render(<QuickAdd onAddTask={mockOnAddTask} />);
    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
  });

  test('renders category select', () => {
    render(<QuickAdd onAddTask={mockOnAddTask} />);
    expect(screen.getByDisplayValue('Other')).toBeInTheDocument();
  });

  test('renders add button', () => {
    render(<QuickAdd onAddTask={mockOnAddTask} />);
    expect(screen.getByRole('button', { name: /Create task/i })).toBeInTheDocument();
  });

  test('calls onAddTask with title and category', async () => {
    const user = userEvent.setup();
    mockOnAddTask.mockResolvedValueOnce({});

    render(<QuickAdd onAddTask={mockOnAddTask} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    const select = screen.getByDisplayValue('Other');
    const button = screen.getByRole('button', { name: /Create task/i });

    await user.selectOptions(select, 'Work');
    await user.type(input, 'New Task');
    await user.click(button);

    expect(mockOnAddTask).toHaveBeenCalledWith('New Task', { category: 'Work' });
  });

  test('clears input after successful add', async () => {
    const user = userEvent.setup();
    mockOnAddTask.mockResolvedValueOnce({});

    render(<QuickAdd onAddTask={mockOnAddTask} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    const button = screen.getByRole('button', { name: /Create task/i });

    await user.type(input, 'New Task');
    await user.click(button);

    // Wait for state to update and check input is cleared
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  test('disables button when input is empty', () => {
    render(<QuickAdd onAddTask={mockOnAddTask} />);
    const button = screen.getByRole('button', { name: /Create task/i });
    expect(button).toBeDisabled();
  });

  test('enables button when input has text', async () => {
    const user = userEvent.setup();
    render(<QuickAdd onAddTask={mockOnAddTask} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    const button = screen.getByRole('button', { name: /Create task/i });

    await user.type(input, 'Task');
    expect(button).not.toBeDisabled();
  });

  test('handles add errors gracefully', async () => {
    const user = userEvent.setup();
    mockOnAddTask.mockRejectedValueOnce(new Error('Failed'));

    render(<QuickAdd onAddTask={mockOnAddTask} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    const button = screen.getByRole('button', { name: /Create task/i });

    await user.type(input, 'New Task');
    await user.click(button);

    expect(mockOnAddTask).toHaveBeenCalled();
  });

  test('renders category dropdown', () => {
    const { container } = render(
      <QuickAdd onAddTask={mockOnAddTask} />
    );

    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  test('disables inputs during submission', async () => {
    const user = userEvent.setup();
    // Create a promise that we can control to delay the task creation
    let resolveAdd;
    const addPromise = new Promise((resolve) => {
      resolveAdd = resolve;
    });
    mockOnAddTask.mockReturnValueOnce(addPromise);

    const { container } = render(
      <QuickAdd onAddTask={mockOnAddTask} />
    );

    const input = screen.getByPlaceholderText('Add a new task...');
    const select = container.querySelector('select');
    const button = screen.getByRole('button', { name: /Create task/i });

    // Type task
    await user.type(input, 'New Task');

    // Start form submission (but don't await it yet)
    user.click(button);

    // Give React time to update
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(select).toBeDisabled();
      expect(button).toBeDisabled();
    });

    // Resolve the promise to complete the submission
    resolveAdd({});
  });
});
