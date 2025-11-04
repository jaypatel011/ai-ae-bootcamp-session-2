# TODO List App - Implementation Guide

## Overview
This guide provides technical implementation details for building the TODO List application based on the functional requirements.

---

## Architecture Overview

```
Frontend (React)
├── Components/
│   ├── TaskList
│   ├── TaskItem
│   ├── TaskDetail
│   ├── QuickAdd
│   └── Filters
├── Hooks/
│   └── useTasks
├── Utils/
│   ├── taskManager.js
│   ├── dateUtils.js
│   └── filterUtils.js
└── Styles/
    └── App.css

Backend (Express.js)
├── Routes/
│   └── tasks.js
├── Controllers/
│   └── taskController.js
├── Models/
│   └── Task.js
└── Middleware/
    └── validation.js
```

---

## Frontend Implementation

### 1. Task Data Structure (Frontend)

```javascript
// src/models/Task.js
class Task {
  constructor(title, {
    id = generateUUID(),
    description = '',
    dueDate = null,
    category = 'Other',
    status = 0,
    parentTaskId = null,
    subTasks = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.category = category;
    this.status = status;
    this.parentTaskId = parentTaskId;
    this.subTasks = subTasks;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get isCompleted() {
    return this.status === 100;
  }

  get statusLabel() {
    if (this.status === 0) return 'Not Started';
    if (this.status === 25) return 'In Progress';
    if (this.status === 50) return 'Half Done';
    if (this.status === 75) return 'Almost Done';
    if (this.status === 100) return 'Complete';
    return `${this.status}%`;
  }

  update(updates) {
    Object.assign(this, updates, { updatedAt: new Date().toISOString() });
  }
}
```

### 2. Custom Hook - useTasks

```javascript
// src/hooks/useTasks.js
import { useState, useEffect } from 'react';
import { TaskManager } from '../utils/taskManager';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({
    category: null,
    status: 'all', // 'all', 'completed', 'incomplete', 'in-progress'
    dateRange: null, // 'overdue', 'today', 'tomorrow', 'week', 'month', null
    searchQuery: ''
  });
  const [sort, setSort] = useState('dueDate-asc');

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = TaskManager.loadTasks();
    setTasks(savedTasks);
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    TaskManager.saveTasks(tasks);
  }, [tasks]);

  const addTask = (title, options = {}) => {
    const newTask = TaskManager.createTask(title, options);
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const addSubTask = (parentTaskId, title, options = {}) => {
    const subTask = TaskManager.createTask(title, { parentTaskId, ...options });
    const updatedTasks = tasks.map(task => {
      if (task.id === parentTaskId) {
        return { ...task, subTasks: [...task.subTasks, subTask.id] };
      }
      return task;
    });
    setTasks([...updatedTasks, subTask]);
    return subTask;
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = TaskManager.filterTasks(tasks, filter);
    return TaskManager.sortTasks(filtered, sort);
  };

  return {
    tasks: getFilteredAndSortedTasks(),
    allTasks: tasks,
    filter,
    setFilter,
    sort,
    setSort,
    addTask,
    updateTask,
    deleteTask,
    addSubTask
  };
};
```

### 3. Task Manager Utility

```javascript
// src/utils/taskManager.js
import { v4 as uuidv4 } from 'uuid';
import * as dateUtils from './dateUtils';

export class TaskManager {
  static CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];
  static PREDEFINED_STATUS = [0, 25, 50, 75, 100];
  static STORAGE_KEY = 'todoapp_tasks';

  static createTask(title, options = {}) {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    return {
      id: options.id || uuidv4(),
      title: title.trim(),
      description: options.description || '',
      dueDate: options.dueDate || null,
      category: options.category || 'Other',
      status: options.status || 0,
      parentTaskId: options.parentTaskId || null,
      subTasks: options.subTasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static saveTasks(tasks) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  static loadTasks() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  static filterTasks(tasks, filters) {
    return tasks.filter(task => {
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
        if (!dateUtils.matchesDateRange(task.dueDate, filters.dateRange)) return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query) &&
            !task.description.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }

  static sortTasks(tasks, sortOption) {
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

  static getSubTasks(tasks, parentTaskId) {
    return tasks.filter(task => task.parentTaskId === parentTaskId);
  }

  static calculateParentTaskStatus(tasks, parentTaskId) {
    const subTasks = this.getSubTasks(tasks, parentTaskId);
    if (subTasks.length === 0) return null; // No sub-tasks

    const avgStatus = Math.round(subTasks.reduce((sum, task) => sum + task.status, 0) / subTasks.length);
    return avgStatus;
  }
}
```

### 4. Date Utilities

```javascript
// src/utils/dateUtils.js
export const getRelativeDateLabel = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const taskDate = new Date(dateString);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate < today) {
    const daysOverdue = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
    return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
  }

  if (taskDate.getTime() === today.getTime()) return 'Due Today';
  if (taskDate.getTime() === tomorrow.getTime()) return 'Due Tomorrow';
  if (taskDate < nextWeek) {
    const daysAway = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
    return `Due in ${daysAway} day${daysAway !== 1 ? 's' : ''}`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const matchesDateRange = (dateString, range) => {
  if (!dateString) return range === 'no-due-date';

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(dateString);
  taskDate.setHours(0, 0, 0, 0);

  switch (range) {
    case 'overdue':
      return taskDate < today;
    case 'today':
      return taskDate.getTime() === today.getTime();
    case 'tomorrow': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return taskDate.getTime() === tomorrow.getTime();
    }
    case 'week': {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return taskDate >= today && taskDate <= weekFromNow;
    }
    case 'month': {
      const monthFromNow = new Date(today);
      monthFromNow.setMonth(monthFromNow.getMonth() + 1);
      return taskDate >= today && taskDate <= monthFromNow;
    }
    case 'no-due-date':
      return !dateString;
    default:
      return true;
  }
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0]; // Return YYYY-MM-DD format
};
```

### 5. Component Structure

#### TaskList Component
```javascript
// src/components/TaskList.jsx
import React from 'react';
import TaskItem from './TaskItem';
import FilterBar from './FilterBar';
import QuickAdd from './QuickAdd';

const TaskList = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, onAddSubTask }) => {
  return (
    <div className="task-list">
      <QuickAdd onAddTask={onAddTask} />
      <FilterBar />
      <div className="tasks">
        {tasks.length === 0 ? (
          <div className="no-tasks">No tasks found</div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              onAddSubTask={onAddSubTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
```

#### TaskItem Component
```javascript
// src/components/TaskItem.jsx
import React, { useState } from 'react';
import { getRelativeDateLabel } from '../utils/dateUtils';
import TaskDetail from './TaskDetail';
import '../styles/TaskItem.css';

const TaskItem = ({ task, allTasks = [], onUpdate, onDelete, onAddSubTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { status: newStatus });
  };

  const getStatusColor = (status) => {
    if (status >= 75) return '#4CAF50';
    if (status >= 50) return '#FFC107';
    if (status >= 25) return '#FF9800';
    return '#F44336';
  };

  return (
    <>
      <div className="task-item" onClick={() => setShowDetail(true)}>
        <div className="task-content">
          <div className="task-header">
            <span className={`task-title ${task.status === 100 ? 'completed' : ''}`}>
              {task.title}
            </span>
            <span className="task-category" style={{ backgroundColor: getCategoryColor(task.category) }}>
              {task.category}
            </span>
          </div>
          
          <div className="task-meta">
            {task.dueDate && (
              <span className="task-due-date">
                📅 {getRelativeDateLabel(task.dueDate)}
              </span>
            )}
            <div className="task-progress">
              <div
                className="progress-bar"
                style={{
                  width: `${task.status}%`,
                  backgroundColor: getStatusColor(task.status)
                }}
              />
              <span className="progress-text">{task.status}%</span>
            </div>
          </div>
        </div>

        {task.subTasks && task.subTasks.length > 0 && (
          <button
            className="expand-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▼' : '▶'} {task.subTasks.length} sub-tasks
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="sub-tasks">
          {/* Render sub-tasks */}
        </div>
      )}

      {showDetail && (
        <TaskDetail
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddSubTask={onAddSubTask}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    Work: '#3F51B5',
    Personal: '#E91E63',
    Shopping: '#FF9800',
    Health: '#4CAF50',
    Finance: '#2196F3',
    Education: '#9C27B0',
    Home: '#FF5722',
    Other: '#9E9E9E'
  };
  return colors[category] || '#9E9E9E';
};

export default TaskItem;
```

---

## Backend Implementation

### 1. Express Routes

```javascript
// backend/routes/tasks.js
const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
```

### 2. Task Controller

```javascript
// backend/controllers/taskController.js
const Task = require('../models/Task');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  const task = new Task(req.body);
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    Object.assign(task, req.body, { updatedAt: new Date() });
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### 3. Task Model

```javascript
// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    minlength: 1,
    maxlength: 255
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'],
    default: 'Other'
  },
  status: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  subTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.virtual('isCompleted').get(function() {
  return this.status === 100;
});

module.exports = mongoose.model('Task', taskSchema);
```

---

## Testing Strategy

### Frontend Tests
```javascript
// src/__tests__/taskManager.test.js
import { TaskManager } from '../utils/taskManager';

describe('TaskManager', () => {
  describe('createTask', () => {
    test('creates a task with required fields', () => {
      const task = TaskManager.createTask('Test Task');
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe(0);
      expect(task.category).toBe('Other');
    });

    test('throws error when title is empty', () => {
      expect(() => TaskManager.createTask('')).toThrow('Task title is required');
    });
  });

  describe('filterTasks', () => {
    test('filters by category', () => {
      const tasks = [
        { ...sampleTask(), category: 'Work' },
        { ...sampleTask(), category: 'Personal' }
      ];
      const filtered = TaskManager.filterTasks(tasks, { category: 'Work' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('Work');
    });
  });

  describe('sortTasks', () => {
    test('sorts by due date ascending', () => {
      const tasks = [
        { ...sampleTask(), dueDate: '2025-11-10' },
        { ...sampleTask(), dueDate: '2025-11-05' }
      ];
      const sorted = TaskManager.sortTasks(tasks, 'dueDate-asc');
      expect(sorted[0].dueDate).toBe('2025-11-05');
    });
  });
});
```

---

## Styling Guide

### Category Colors
- Work: #3F51B5 (Indigo)
- Personal: #E91E63 (Pink)
- Shopping: #FF9800 (Orange)
- Health: #4CAF50 (Green)
- Finance: #2196F3 (Blue)
- Education: #9C27B0 (Purple)
- Home: #FF5722 (Deep Orange)
- Other: #9E9E9E (Gray)

### Status Colors
- 0-24%: #F44336 (Red)
- 25-49%: #FF9800 (Orange)
- 50-74%: #FFC107 (Amber)
- 75-99%: #8BC34A (Light Green)
- 100%: #4CAF50 (Green)

---

## Development Checklist

- [ ] Set up project structure (frontend/backend)
- [ ] Create Task model and data structures
- [ ] Implement TaskManager utility class
- [ ] Build core components (TaskList, TaskItem, TaskDetail)
- [ ] Implement filtering and sorting logic
- [ ] Add date utilities and formatting
- [ ] Build quick add interface
- [ ] Implement local storage persistence
- [ ] Add error handling and validation
- [ ] Write unit tests
- [ ] Add responsive CSS styling
- [ ] Add accessibility features
- [ ] Performance optimization
- [ ] Documentation and README

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Ready for Development
