/**
 * Component integration tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock fetch
global.fetch = jest.fn();

describe('App Component Integration', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test('renders app header', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);
    expect(screen.getByText('✨ FlowTask')).toBeInTheDocument();
    expect(screen.getByText('Organize your life, amplify your productivity')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<App />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('displays error message on failed fetch', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to sync/i)).toBeInTheDocument();
    });
  });

  test('renders quick add form', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    });
  });

  test('renders filter bar', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    });
  });

  test('displays no tasks message when empty', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
    });
  });

  test('displays tasks from API', async () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task',
        category: 'Work',
        status: 50,
        dueDate: null,
        description: '',
        parentTaskId: null,
        subTasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('can add a new task', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '1',
        title: 'New Task',
        category: 'Other',
        status: 0,
        dueDate: null,
        description: '',
        parentTaskId: null,
        subTasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    render(<App />);

    const input = await screen.findByPlaceholderText('Add a new task...');
    const button = await screen.findByRole('button', { name: /Create task/i });

    await user.type(input, 'New Task');
    await user.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3030/api/tasks',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  test('closes error message when close button is clicked', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to sync/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close error');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Failed to sync/i)).not.toBeInTheDocument();
    });
  });

  test('renders error state with visible error message', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));
    render(<App />);

    await waitFor(() => {
      const errorCard = screen.getByText(/Failed to sync/i);
      expect(errorCard).toBeInTheDocument();
    });
  });

  test('recovers from error with retry', async () => {
    // First call fails
    fetch.mockRejectedValueOnce(new Error('Network error'));
    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to sync/i)).toBeInTheDocument();
    });

    // Second attempt succeeds
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    rerender(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    });
  });

  test('handles API response with tasks array', async () => {
    const tasks = [
      {
        id: '1',
        title: 'Task 1',
        category: 'Work',
        status: 0,
        dueDate: null,
        description: '',
        parentTaskId: null,
        subTasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Task 2',
        category: 'Personal',
        status: 100,
        dueDate: null,
        description: '',
        parentTaskId: null,
        subTasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => tasks,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('app renders complete UI structure', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('.app')).toBeInTheDocument();
      expect(container.querySelector('.app-header')).toBeInTheDocument();
      expect(container.querySelector('.app-main')).toBeInTheDocument();
    });
  });
});
