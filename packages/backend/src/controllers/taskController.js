const TaskModel = require('../models/Task');

/**
 * Task Controller - Handles task-related HTTP requests
 */

/**
 * GET /api/tasks
 * Retrieve all tasks
 */
const getAllTasks = (req, res) => {
  try {
    const tasks = TaskModel.getAll();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message,
    });
  }
};

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID
 */
const getTask = (req, res) => {
  try {
    const { id } = req.params;
    const task = TaskModel.getById(id);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND',
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      error: 'Failed to fetch task',
      message: error.message,
    });
  }
};

/**
 * POST /api/tasks
 * Create a new task
 */
const createTask = (req, res) => {
  try {
    const { title, description, dueDate, category, status, parentTaskId } = req.body;

    const newTask = TaskModel.create({
      title,
      description,
      dueDate,
      category,
      status,
      parentTaskId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);

    // Return 400 for validation errors, 500 for server errors
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to create task',
      code: 'CREATE_TASK_ERROR',
    });
  }
};

/**
 * PUT /api/tasks/:id
 * Update a task
 */
const updateTask = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'At least one field must be updated',
        code: 'NO_UPDATES_PROVIDED',
      });
    }

    const updatedTask = TaskModel.update(id, updates);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);

    // Return 404 if task not found, 400 for validation errors
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to update task',
      code: 'UPDATE_TASK_ERROR',
    });
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task (cascades to sub-tasks)
 */
const deleteTask = (req, res) => {
  try {
    const { id } = req.params;

    TaskModel.delete(id);

    res.json({
      message: 'Task deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting task:', error);

    // Return 404 if task not found
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to delete task',
      code: 'DELETE_TASK_ERROR',
    });
  }
};

/**
 * GET /api/tasks/:id/subtasks
 * Retrieve all sub-tasks for a task
 */
const getSubTasks = (req, res) => {
  try {
    const { id } = req.params;

    // Verify parent task exists
    const parentTask = TaskModel.getById(id);
    if (!parentTask) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND',
      });
    }

    const subTasks = TaskModel.getSubTasks(id);
    res.json(subTasks);
  } catch (error) {
    console.error('Error fetching sub-tasks:', error);
    res.status(500).json({
      error: 'Failed to fetch sub-tasks',
      message: error.message,
    });
  }
};

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getSubTasks,
};
