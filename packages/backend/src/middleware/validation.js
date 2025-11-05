/**
 * Validation middleware for task operations
 */

/**
 * Validate task creation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateCreateTask = (req, res, next) => {
  const { title, description, dueDate, category, status } = req.body;

  // Validate title (required)
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'Task title is required',
      code: 'INVALID_TITLE',
    });
  }

  if (title.length > 255) {
    return res.status(400).json({
      error: 'Task title must be 255 characters or less',
      code: 'TITLE_TOO_LONG',
    });
  }

  // Validate description (optional)
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return res.status(400).json({
        error: 'Task description must be a string',
        code: 'INVALID_DESCRIPTION',
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        error: 'Task description must be 1000 characters or less',
        code: 'DESCRIPTION_TOO_LONG',
      });
    }
  }

  // Validate category (optional)
  if (category !== undefined && category !== null) {
    const validCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Category must be one of: ${validCategories.join(', ')}`,
        code: 'INVALID_CATEGORY',
      });
    }
  }

  // Validate status (optional)
  if (status !== undefined && status !== null) {
    if (typeof status !== 'number' || !Number.isInteger(status) || status < 0 || status > 100) {
      return res.status(400).json({
        error: 'Status must be an integer between 0 and 100',
        code: 'INVALID_STATUS',
      });
    }
  }

  // Validate dueDate (optional)
  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== 'string') {
      return res.status(400).json({
        error: 'Due date must be a string',
        code: 'INVALID_DUE_DATE',
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}/.test(dueDate)) {
      return res.status(400).json({
        error: 'Due date must be in ISO 8601 format (YYYY-MM-DD)',
        code: 'INVALID_DUE_DATE_FORMAT',
      });
    }
  }

  next();
};

/**
 * Validate task update request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateUpdateTask = (req, res, next) => {
  const { title, description, dueDate, category, status } = req.body;

  // Allow any field to be updated, but validate if provided
  if (title !== undefined && title !== null) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Task title must be a non-empty string',
        code: 'INVALID_TITLE',
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        error: 'Task title must be 255 characters or less',
        code: 'TITLE_TOO_LONG',
      });
    }
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return res.status(400).json({
        error: 'Task description must be a string',
        code: 'INVALID_DESCRIPTION',
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        error: 'Task description must be 1000 characters or less',
        code: 'DESCRIPTION_TOO_LONG',
      });
    }
  }

  if (category !== undefined && category !== null) {
    const validCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Category must be one of: ${validCategories.join(', ')}`,
        code: 'INVALID_CATEGORY',
      });
    }
  }

  if (status !== undefined && status !== null) {
    if (typeof status !== 'number' || !Number.isInteger(status) || status < 0 || status > 100) {
      return res.status(400).json({
        error: 'Status must be an integer between 0 and 100',
        code: 'INVALID_STATUS',
      });
    }
  }

  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== 'string') {
      return res.status(400).json({
        error: 'Due date must be a string',
        code: 'INVALID_DUE_DATE',
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}/.test(dueDate)) {
      return res.status(400).json({
        error: 'Due date must be in ISO 8601 format (YYYY-MM-DD)',
        code: 'INVALID_DUE_DATE_FORMAT',
      });
    }
  }

  next();
};

/**
 * Validate task ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      error: 'Task ID is required',
      code: 'INVALID_TASK_ID',
    });
  }

  next();
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
};
