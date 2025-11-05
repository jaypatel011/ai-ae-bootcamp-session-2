/**
 * useTasks Hook
 * Custom React hook for managing task state, filters, sorting, and API calls
 */

import { useState, useEffect } from 'react';
import { TaskManager } from '../utils/task-manager';

export const useTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    category: null,
    status: 'all', // 'all', 'completed', 'incomplete', 'in-progress'
    dateRange: null, // 'overdue', 'today', 'tomorrow', 'week', 'month', null
    searchQuery: '',
  });
  const [sort, setSort] = useState('dueDate-asc');

  // Load tasks from backend on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${TaskManager.API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to load tasks');
        const data = await response.json();
        setAllTasks(data);
        TaskManager.saveTasks(data); // Also save to localStorage
      } catch (err) {
        console.error('Error loading tasks:', err);
        // Fall back to localStorage if API fails
        const cached = TaskManager.loadTasks();
        setAllTasks(cached);
        setError('Failed to sync with server, using cached data');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    TaskManager.saveTasks(allTasks);
  }, [allTasks]);

  /**
   * Apply filters and sorting to get displayable tasks
   */
  const getFilteredAndSortedTasks = () => {
    let filtered = TaskManager.filterTasks(allTasks, filter);
    return TaskManager.sortTasks(filtered, sort);
  };

  /**
   * Add a new task
   */
  const addTask = async (title, options = {}) => {
    try {
      const task = TaskManager.createTask(title, options);

      // Validate task
      const validationError = TaskManager.validateTask(task);
      if (validationError) throw new Error(validationError);

      // Call backend API
      const response = await fetch(`${TaskManager.API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const createdTask = await response.json();
      setAllTasks([...allTasks, createdTask]);
      return createdTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update an existing task
   */
  const updateTask = async (taskId, updates) => {
    try {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Validate updated task
      const validationError = TaskManager.validateTask(updatedTask);
      if (validationError) throw new Error(validationError);

      // Call backend API
      const response = await fetch(`${TaskManager.API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const result = await response.json();
      setAllTasks(allTasks.map((t) => (t.id === taskId ? result : t)));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Delete a task
   */
  const deleteTask = async (taskId) => {
    try {
      // Call backend API
      const response = await fetch(`${TaskManager.API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      setAllTasks(allTasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Add a sub-task to a parent task
   */
  const addSubTask = async (parentTaskId, title, options = {}) => {
    try {
      const subTask = TaskManager.createTask(title, { parentTaskId, ...options });

      // Validate sub-task
      const validationError = TaskManager.validateTask(subTask);
      if (validationError) throw new Error(validationError);

      // Call backend API
      const response = await fetch(`${TaskManager.API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sub-task');
      }

      const createdSubTask = await response.json();

      // Update parent task's subTasks array
      const parentTask = allTasks.find((t) => t.id === parentTaskId);
      if (parentTask) {
        const updatedParent = {
          ...parentTask,
          subTasks: [...(parentTask.subTasks || []), createdSubTask.id],
          updatedAt: new Date().toISOString(),
        };

        // Update parent in backend
        await fetch(`${TaskManager.API_BASE_URL}/tasks/${parentTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedParent),
        });

        // Update local state
        setAllTasks(allTasks.map((t) => (t.id === parentTaskId ? updatedParent : t)));
      }

      setAllTasks((prev) => [...prev, createdSubTask]);
      return createdSubTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Get all sub-tasks for a parent task
   */
  const getSubTasks = (parentTaskId) => {
    return TaskManager.getSubTasks(allTasks, parentTaskId);
  };

  return {
    tasks: getFilteredAndSortedTasks(),
    allTasks,
    loading,
    error,
    setError,
    filter,
    setFilter,
    sort,
    setSort,
    addTask,
    updateTask,
    deleteTask,
    addSubTask,
    getSubTasks,
  };
};
