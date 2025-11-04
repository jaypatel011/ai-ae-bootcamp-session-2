const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initializeDatabase } = require('./utils/database');
const taskController = require('./controllers/taskController');
const { validateCreateTask, validateUpdateTask, validateTaskId } = require('./middleware/validation');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize database on app startup
initializeDatabase();

// Task Routes
app.get('/api/tasks', taskController.getAllTasks);

app.get('/api/tasks/:id', validateTaskId, taskController.getTask);

app.post('/api/tasks', validateCreateTask, taskController.createTask);

app.put('/api/tasks/:id', validateTaskId, validateUpdateTask, taskController.updateTask);

app.delete('/api/tasks/:id', validateTaskId, taskController.deleteTask);

app.get('/api/tasks/:id/subtasks', validateTaskId, taskController.getSubTasks);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
  });
});

module.exports = app;