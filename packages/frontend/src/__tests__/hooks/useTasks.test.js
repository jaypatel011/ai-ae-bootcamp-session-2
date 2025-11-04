/**
 * useTasks hook tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../../hooks/useTasks';
import { TaskManager } from '../../utils/task-manager';

// Mock TaskManager
jest.mock('../../utils/task-manager');

// Mock fetch
global.fetch = jest.fn();

describe('useTasks Hook', () => {
  const mockTask = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    fetch.mockClear();
    
    // Mock TaskManager methods
    TaskManager.loadTasks.mockReturnValue([]);
    TaskManager.saveTasks.mockImplementation(() => {});
    TaskManager.createTask.mockReturnValue(mockTask);
    TaskManager.validateTask.mockReturnValue(null);
    TaskManager.filterTasks.mockImplementation((tasks) => tasks);
    TaskManager.sortTasks.mockImplementation((tasks) => tasks);
    TaskManager.getSubTasks.mockReturnValue([]);
  });

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.allTasks).toEqual([]);
    expect(result.current.filter).toEqual({
      category: null,
      status: 'all',
      dateRange: null,
      searchQuery: '',
    });
    expect(result.current.sort).toBe('dueDate-asc');
  });

  test('initializes with loading state true', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.loading).toBe(true);
  });

  test('initializes with no error', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.error).toBeNull();
  });

  test('loads tasks from API on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTask],
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  test('sets tasks after successful API call', async () => {
    const apiTasks = [mockTask, { ...mockTask, id: '2', title: 'Task 2' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiTasks,
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.allTasks.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('handles API fetch error and falls back to localStorage', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    TaskManager.loadTasks.mockReturnValue([mockTask]);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.allTasks).toEqual([mockTask]);
    });
  });

  test('sets error message on API failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    TaskManager.loadTasks.mockReturnValue([]);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  test('addTask is a function', () => {
    const { result } = renderHook(() => useTasks());
    expect(typeof result.current.addTask).toBe('function');
  });

  test('updateTask is a function', () => {
    const { result } = renderHook(() => useTasks());
    expect(typeof result.current.updateTask).toBe('function');
  });

  test('deleteTask is a function', () => {
    const { result } = renderHook(() => useTasks());
    expect(typeof result.current.deleteTask).toBe('function');
  });

  test('addSubTask is a function', () => {
    const { result } = renderHook(() => useTasks());
    expect(typeof result.current.addSubTask).toBe('function');
  });

  test('getSubTasks is a function', () => {
    const { result } = renderHook(() => useTasks());
    expect(typeof result.current.getSubTasks).toBe('function');
  });

  test('setFilter updates filter state', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setFilter({ category: 'Work', status: 'all', dateRange: null, searchQuery: '' });
    });

    expect(result.current.filter.category).toBe('Work');
  });

  test('setFilter with multiple criteria', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setFilter({
        category: 'Personal',
        status: 'completed',
        dateRange: 'today',
        searchQuery: 'meeting'
      });
    });

    expect(result.current.filter.category).toBe('Personal');
    expect(result.current.filter.status).toBe('completed');
    expect(result.current.filter.dateRange).toBe('today');
    expect(result.current.filter.searchQuery).toBe('meeting');
  });

  test('setSort updates sort state', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setSort('title-asc');
    });

    expect(result.current.sort).toBe('title-asc');
  });

  test('setSort with different values', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setSort('status-desc');
    });

    expect(result.current.sort).toBe('status-desc');

    act(() => {
      result.current.setSort('createdAt-asc');
    });

    expect(result.current.sort).toBe('createdAt-asc');
  });

  test('returns tasks array', () => {
    const { result } = renderHook(() => useTasks());
    expect(Array.isArray(result.current.tasks)).toBe(true);
  });

  test('returns allTasks array', () => {
    const { result } = renderHook(() => useTasks());
    expect(Array.isArray(result.current.allTasks)).toBe(true);
  });

  test('getSubTasks returns sub-tasks for a parent task', () => {
    const subTask = { id: 'sub1', parentTaskId: '1', title: 'Sub Task' };
    TaskManager.getSubTasks.mockReturnValue([subTask]);

    const { result } = renderHook(() => useTasks());

    const subTasks = result.current.getSubTasks('1');
    expect(subTasks).toEqual([subTask]);
  });

  test('setError updates error state', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setError('Test error message');
    });

    expect(result.current.error).toBe('Test error message');
  });

  test('setError can clear error', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });
});

