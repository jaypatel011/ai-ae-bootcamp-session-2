const { db } = require('../utils/database');
const crypto = require('crypto');

/**
 * Generate a UUID v4 string
 * @returns {string} UUID v4 format string
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * TaskModel - Data access layer for tasks
 * Provides methods for CRUD operations and querying
 */
class TaskModel {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} taskData.title - Task title (required)
   * @param {string} taskData.description - Task description (optional)
   * @param {string} taskData.dueDate - Task due date in ISO format (optional)
   * @param {string} taskData.category - Task category (optional, default 'Other')
   * @param {number} taskData.status - Task completion status 0-100 (optional, default 0)
   * @param {string} taskData.parentTaskId - Parent task ID for sub-tasks (optional)
   * @returns {Object} Created task object
   * @throws {Error} If validation fails
   */
  static create(taskData) {
    const {
      title,
      description = '',
      dueDate = null,
      category = 'Other',
      status = 0,
      parentTaskId = null,
    } = taskData;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new Error('Task title is required and must be a non-empty string');
    }

    if (title.length > 255) {
      throw new Error('Task title must be 255 characters or less');
    }

    // Validate optional fields
    const validCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];
    if (!validCategories.includes(category)) {
      throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
    }

    if (typeof status !== 'number' || status < 0 || status > 100 || !Number.isInteger(status)) {
      throw new Error('Status must be an integer between 0 and 100');
    }

    if (description && description.length > 1000) {
      throw new Error('Description must be 1000 characters or less');
    }

    if (dueDate && typeof dueDate === 'string') {
      // Validate ISO date format
      if (!/^\d{4}-\d{2}-\d{2}/.test(dueDate)) {
        throw new Error('Due date must be in ISO 8601 format (YYYY-MM-DD)');
      }
    }

    // If parentTaskId provided, verify parent exists
    if (parentTaskId) {
      const parent = this.getById(parentTaskId);
      if (!parent) {
        throw new Error(`Parent task with ID ${parentTaskId} not found`);
      }
    }

    const id = generateUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO tasks (
        id,
        title,
        description,
        dueDate,
        category,
        status,
        parentTaskId,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title.trim(),
      description,
      dueDate,
      category,
      status,
      parentTaskId,
      now,
      now
    );

    return this.getById(id);
  }

  /**
   * Get a task by ID
   * @param {string} id - Task ID
   * @returns {Object|null} Task object or null if not found
   */
  static getById(id) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id);

    if (task) {
      return this._formatTask(task);
    }

    return null;
  }

  /**
   * Get all tasks (parent tasks only, sub-tasks are nested)
   * @returns {Array<Object>} Array of task objects
   */
  static getAll() {
    const stmt = db.prepare(`
      SELECT * FROM tasks
      WHERE parentTaskId IS NULL
      ORDER BY createdAt DESC
    `);

    const tasks = stmt.all();
    return tasks.map(task => this._formatTask(task));
  }

  /**
   * Get all sub-tasks for a parent task
   * @param {string} parentTaskId - Parent task ID
   * @returns {Array<Object>} Array of sub-task objects
   */
  static getSubTasks(parentTaskId) {
    const stmt = db.prepare(`
      SELECT * FROM tasks
      WHERE parentTaskId = ?
      ORDER BY createdAt DESC
    `);

    const subTasks = stmt.all(parentTaskId);
    return subTasks.map(task => this._formatTask(task));
  }

  /**
   * Update a task
   * @param {string} id - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated task object
   * @throws {Error} If task not found or validation fails
   */
  static update(id, updates) {
    // Verify task exists
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // Validate updates
    if (updates.title !== undefined) {
      if (!updates.title || typeof updates.title !== 'string' || updates.title.trim().length === 0) {
        throw new Error('Task title is required and must be a non-empty string');
      }
      if (updates.title.length > 255) {
        throw new Error('Task title must be 255 characters or less');
      }
    }

    if (updates.description !== undefined && updates.description.length > 1000) {
      throw new Error('Description must be 1000 characters or less');
    }

    if (updates.category !== undefined) {
      const validCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];
      if (!validCategories.includes(updates.category)) {
        throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
      }
    }

    if (updates.status !== undefined) {
      if (typeof updates.status !== 'number' || updates.status < 0 || updates.status > 100 || !Number.isInteger(updates.status)) {
        throw new Error('Status must be an integer between 0 and 100');
      }
    }

    if (updates.dueDate !== undefined && updates.dueDate && typeof updates.dueDate === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}/.test(updates.dueDate)) {
        throw new Error('Due date must be in ISO 8601 format (YYYY-MM-DD)');
      }
    }

    // Build dynamic update query
    const allowedFields = ['title', 'description', 'dueDate', 'category', 'status'];
    const fieldsToUpdate = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
      return existing;
    }

    const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
    const values = fieldsToUpdate.map(field => {
      const value = updates[field];
      return field === 'title' ? value.trim() : value;
    });

    const stmt = db.prepare(`
      UPDATE tasks
      SET ${setClause}, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(...values, new Date().toISOString(), id);

    return this.getById(id);
  }

  /**
   * Delete a task (cascades to sub-tasks)
   * @param {string} id - Task ID
   * @returns {boolean} True if task was deleted
   * @throws {Error} If task not found
   */
  static delete(id) {
    // Verify task exists
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Calculate parent task status as average of sub-tasks
   * @param {string} parentTaskId - Parent task ID
   * @returns {number|null} Average status percentage or null if no sub-tasks
   */
  static calculateParentTaskStatus(parentTaskId) {
    const subTasks = this.getSubTasks(parentTaskId);

    if (subTasks.length === 0) {
      return null;
    }

    const avgStatus = Math.round(
      subTasks.reduce((sum, task) => sum + task.status, 0) / subTasks.length
    );

    return avgStatus;
  }

  /**
   * Get all sub-task IDs for a task (recursively for nested sub-tasks)
   * @param {string} taskId - Task ID
   * @returns {Array<string>} Array of sub-task IDs
   */
  static getSubTaskIds(taskId) {
    const stmt = db.prepare('SELECT id FROM tasks WHERE parentTaskId = ?');
    const directSubTasks = stmt.all(taskId);

    let allSubTaskIds = directSubTasks.map(t => t.id);

    // Recursively get nested sub-tasks
    for (const subTaskId of allSubTaskIds) {
      const nestedIds = this.getSubTaskIds(subTaskId);
      allSubTaskIds = allSubTaskIds.concat(nestedIds);
    }

    return allSubTaskIds;
  }

  /**
   * Format task object with derived fields
   * @private
   * @param {Object} task - Raw task from database
   * @returns {Object} Formatted task with computed fields
   */
  static _formatTask(task) {
    return {
      ...task,
      isCompleted: task.status === 100,
      subTasks: [], // Will be populated by controller if needed
    };
  }
}

module.exports = TaskModel;
