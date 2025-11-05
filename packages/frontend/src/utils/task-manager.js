/**
 * Task Manager Utility
 * Handles task CRUD operations, filtering, sorting, and validation
 */

import { generateUUID } from './uuid';

export class TaskManager {
  static CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];
  static PREDEFINED_STATUS = [0, 25, 50, 75, 100];
  static STORAGE_KEY = 'todoapp_tasks';
  static API_BASE_URL = 'http://localhost:3030/api';

  /**
   * Creates a new task object
   * @param {string} title - Task title (required)
   * @param {Object} options - Optional task properties
   * @returns {Object} New task object
   */
  static createTask(title, options = {}) {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    if (title.length > 255) {
      throw new Error('Task title must be 255 characters or less');
    }

    return {
      id: options.id || generateUUID(),
      title: title.trim(),
      description: options.description || '',
      dueDate: options.dueDate || null,
      category: options.category || 'Other',
      status: options.status || 0,
      parentTaskId: options.parentTaskId || null,
      subTasks: options.subTasks || [],
      createdAt: options.createdAt || new Date().toISOString(),
      updatedAt: options.updatedAt || new Date().toISOString(),
    };
  }

  /**
   * Validates a task object
   * @param {Object} task - Task to validate
   * @returns {string|null} Error message or null if valid
   */
  static validateTask(task) {
    if (!task.title || task.title.trim().length === 0) {
      return 'Task title is required';
    }

    if (task.title.length > 255) {
      return 'Task title must be 255 characters or less';
    }

    if (task.description && task.description.length > 1000) {
      return 'Task description must be 1000 characters or less';
    }

    if (!this.CATEGORIES.includes(task.category)) {
      return `Category must be one of: ${this.CATEGORIES.join(', ')}`;
    }

    if (typeof task.status !== 'number' || task.status < 0 || task.status > 100) {
      return 'Status must be a number between 0 and 100';
    }

    if (task.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
      return 'Due date must be in YYYY-MM-DD format';
    }

    return null;
  }

  /**
   * Saves tasks to localStorage
   * @param {Array} tasks - Tasks to save
   */
  static saveTasks(tasks) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  /**
   * Loads tasks from localStorage
   * @returns {Array} Array of tasks or empty array
   */
  static loadTasks() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  /**
   * Filters tasks based on filter criteria
   * @param {Array} tasks - All tasks
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered tasks (parent tasks only)
   */
  static filterTasks(tasks, filters = {}) {
    return tasks.filter((task) => {
      // Only include parent tasks (not sub-tasks in main list)
      if (task.parentTaskId) return false;

      // Category filter
      if (filters.category && task.category !== filters.category) return false;

      // Status filter
      if (filters.status === 'completed' && task.status !== 100) return false;
      if (filters.status === 'incomplete' && task.status === 100) return false;
      if (filters.status === 'in-progress' && (task.status === 0 || task.status === 100)) return false;

      // Date range filter
      if (filters.dateRange) {
        const { matchesDateRange } = require('./date-utils');
        if (!matchesDateRange(task.dueDate, filters.dateRange)) return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query) && !task.description.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sorts tasks based on sort option
   * @param {Array} tasks - Tasks to sort
   * @param {string} sortOption - Sort option (field-direction, e.g., "dueDate-asc")
   * @returns {Array} Sorted tasks
   */
  static sortTasks(tasks, sortOption = 'dueDate-asc') {
    const [field, direction] = sortOption.split('-');
    const isAsc = direction === 'asc';

    const sorted = [...tasks].sort((a, b) => {
      let aValue, bValue;

      switch (field) {
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return isAsc ? -1 : 1;
      if (aValue > bValue) return isAsc ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Gets all sub-tasks for a parent task
   * @param {Array} tasks - All tasks
   * @param {string} parentTaskId - Parent task ID
   * @returns {Array} Array of sub-tasks
   */
  static getSubTasks(tasks, parentTaskId) {
    return tasks.filter((task) => task.parentTaskId === parentTaskId);
  }

  /**
   * Calculates parent task status based on sub-task percentages
   * @param {Array} tasks - All tasks
   * @param {string} parentTaskId - Parent task ID
   * @returns {number|null} Average percentage or null if no sub-tasks
   */
  static calculateParentTaskStatus(tasks, parentTaskId) {
    const subTasks = this.getSubTasks(tasks, parentTaskId);
    if (subTasks.length === 0) return null;

    const avgStatus = Math.round(subTasks.reduce((sum, task) => sum + task.status, 0) / subTasks.length);
    return avgStatus;
  }

  /**
   * Checks if a task is completed
   * @param {Object} task - Task object
   * @returns {boolean} Whether task is completed
   */
  static isCompleted(task) {
    return task.status === 100;
  }

  /**
   * Gets status label for a percentage
   * @param {number} status - Status percentage (0-100)
   * @returns {string} Human-readable status label
   */
  static getStatusLabel(status) {
    if (status === 0) return 'Not Started';
    if (status === 25) return 'In Progress';
    if (status === 50) return 'Half Done';
    if (status === 75) return 'Almost Done';
    if (status === 100) return 'Complete';
    return `${status}%`;
  }
}
