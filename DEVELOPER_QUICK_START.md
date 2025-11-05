# TODO App - Developer Quick Start Guide

**Goal**: Get up to speed quickly on the TODO app implementation plan and start contributing.

---

## 5-Minute Onboarding

### 1. Understand the Vision
The TODO app is a full-featured task management application with:
- **Core Features** (Phase 1): Create/edit/delete tasks, categorization, due dates, progress tracking, filtering, sorting
- **Advanced Features** (Phase 2): Sub-tasks, search, advanced filters, descriptions

**Current State**: Basic item management (only name field). **End Goal**: Production-ready MVP with all Priority 1 features.

### 2. Know the Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18.2 | UI components, state management |
| State | Custom Hook (useTasks) | Task state, filters, sorting |
| Persistence | localStorage + SQLite | Client-side caching + server data |
| Backend | Express.js | REST API for task CRUD |
| Database | SQLite + better-sqlite3 | Persistent task storage |
| Testing | Jest + React Testing Library | Unit and integration tests |

### 3. Know the Architecture

```
FRONTEND                          BACKEND
└─ React App                      └─ Express Server
   ├─ useTasks Hook              ├─ Controllers
   │  ├─ TaskManager              │  ├─ createTask
   │  ├─ dateUtils                │  ├─ updateTask
   │  └─ localStorage             │  └─ deleteTask
   ├─ Components                  ├─ Models
   │  ├─ TaskList                 │  ├─ Task Schema
   │  ├─ TaskDetail               │  └─ DB Methods
   │  ├─ FilterBar                └─ Routes
   │  └─ QuickAdd                    ├─ GET /api/tasks
   └─ App.css (glass)                ├─ POST /api/tasks
                                     ├─ PUT /api/tasks/:id
                                     └─ DELETE /api/tasks/:id
```

### 4. Three Key Files to Know

1. **IMPLEMENTATION_PLAN.md** - The source of truth for what to build and how
2. **PHASE_1_CHECKLIST.md** - Detailed checklist of all tasks
3. **docs/coding-guidelines.md** - Code standards (indentation, naming, testing)

### 5. Where to Start?

Pick a task from `PHASE_1_CHECKLIST.md` under your area:

**Backend Focus?** Start with:
- Task 1.1: Data Model & Persistence (create Task.js with SQLite schema)
- Task 1.3: Controllers (create CRUD functions)
- Task 1.4: Validation Middleware (validate inputs)

**Frontend Focus?** Start with:
- Task 2.1: TaskManager Utility (filtering, sorting, CRUD)
- Task 2.2: dateUtils (relative date labels)
- Task 2.4: useTasks Hook (state management)
- Task 2.6: UI Components (TaskList, TaskItem, etc.)

---

## Common Commands

### Setup
```bash
# Install dependencies for all packages
npm install

# Or install specific package
cd packages/frontend && npm install
cd packages/backend && npm install
```

### Development
```bash
# Start frontend (port 3000) and backend (port 3030) concurrently
npm run start

# Or start individually
cd packages/frontend && npm start
cd packages/backend && npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run tests for one package
cd packages/frontend && npm test
cd packages/backend && npm test

# Generate coverage report
npm test -- --coverage
```

### Code Quality
```bash
# Check backend code with ESLint (if configured)
cd packages/backend && npm run lint

# Format code with Prettier (if configured)
npm run format

# Check formatting without modifying
npm run format:check
```

---

## Code Style Essentials (2 minutes)

### File Naming
- **Components**: `TaskItem.jsx` (PascalCase, matches component name)
- **Utilities**: `task-manager.js` (kebab-case)
- **Tests**: `task-manager.test.js` (kebab-case, suffixed with `.test.js`)

### Variable Naming
```javascript
// DO ✅
const taskTitle = "Buy groceries";
function calculateTaskStatus(tasks) {}
const PREDEFINED_STATUS = [0, 25, 50, 75, 100];
class TaskManager {}
const TaskItem = ({ task }) => {};

// DON'T ❌
const t = "Buy groceries";
function calc(t) {}
const status = [0, 25, 50, 75, 100];
const taskmanager = {};
```

### Import Order
```javascript
// Frontend (ES6 modules)
import React, { useState } from 'react';           // React first
import { TaskManager } from '../utils/task-manager'; // utils
import TaskList from './TaskList';                // components
import './App.css';                               // styles last

// Backend (CommonJS)
const express = require('express');               // Node modules
const { TaskModel } = require('./models/Task');   // local modules
```

### Indentation
- Always 2 spaces (never tabs)
- No trailing whitespace

### Comments
- Only explain **why**, not **what** (code should be self-documenting)
- Use JSDoc for complex functions

```javascript
// DON'T ❌
// Increment i
i++;

// DO ✅
/**
 * Calculates average completion % of all sub-tasks
 * @param {Array<Task>} tasks - All tasks in app
 * @param {string} parentTaskId - Parent task ID
 * @returns {number} Average percentage (0-100)
 */
const calculateParentTaskStatus = (tasks, parentTaskId) => {
  // Implementation here
};
```

---

## Data Model to Know

```javascript
{
  id: "uuid-string",                    // Unique identifier
  title: "Buy groceries",               // Required, 1-255 chars
  description: "Milk, eggs, bread",     // Optional, 0-1000 chars
  dueDate: "2025-11-10",                // ISO date or null
  category: "Shopping",                 // One of 8 predefined
  status: 50,                           // 0-100 representing % complete
  parentTaskId: null,                   // null for parent tasks
  subTasks: [],                         // Array of task IDs
  createdAt: "2025-11-04T10:30:00Z",   // ISO timestamp
  updatedAt: "2025-11-04T10:30:00Z",   // ISO timestamp
  isCompleted: false                    // Derived from status === 100
}
```

**8 Categories**: Work, Personal, Shopping, Health, Finance, Education, Home, Other

**5 Predefined Status Levels**: 0% (Not Started), 25% (In Progress), 50% (Half Done), 75% (Almost Done), 100% (Complete)

---

## Testing Essentials

### Test Location
```
Frontend: src/__tests__/*.test.js or src/components/__tests__/Component.test.js
Backend: __tests__/*.test.js
```

### Test Pattern (Arrange-Act-Assert)
```javascript
describe('TaskManager', () => {
  it('should filter tasks by category', () => {
    // Arrange
    const tasks = [
      { id: '1', category: 'Work', title: 'Task 1' },
      { id: '2', category: 'Personal', title: 'Task 2' }
    ];

    // Act
    const filtered = TaskManager.filterTasks(tasks, { category: 'Work' });

    // Assert
    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe('Work');
  });
});
```

### Frontend Component Testing
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../TaskItem';

it('should display task title', () => {
  const task = { id: '1', title: 'Test', status: 0 };
  render(<TaskItem task={task} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Backend API Testing
```javascript
const request = require('supertest');
const app = require('../src/app');

it('should create a task', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'Test Task' });
  
  expect(response.status).toBe(201);
  expect(response.body.title).toBe('Test Task');
});
```

---

## Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|---------|-------|
| Use tabs for indentation | Use 2 spaces |
| Single-letter variable names (except loop counters) | Descriptive names: `taskTitle` not `t` |
| Organize imports randomly | React → libs → utils → components → styles |
| Mix default and named exports in same file | Default export for components, named for utils |
| Leave console.log() in production code | Remove before committing |
| Forget to add error handling | Handle errors with try/catch and user messages |
| Skip tests | Write tests alongside code |
| Commit large, multi-feature PRs | Small, focused PRs (one feature per PR) |

---

## Debugging Tips

### Frontend
```javascript
// Use React DevTools browser extension
// Inspect component props, state, and hooks
// Check localStorage: F12 → Application → Local Storage

// Debug filtering/sorting
console.log('Filtered tasks:', TaskManager.filterTasks(tasks, filter));
console.log('Sorted tasks:', TaskManager.sortTasks(tasks, sort));
```

### Backend
```bash
# Run backend in debug mode (if nodemon is configured)
npm run dev

# Check database contents
sqlite3 packages/backend/data/tasks.db
> SELECT * FROM tasks;

# Monitor requests with Morgan logging (already enabled)
```

---

## Questions? Resources

1. **What should I build?** → See `PHASE_1_CHECKLIST.md`
2. **How should I implement it?** → See `IMPLEMENTATION_PLAN.md` for detailed specs
3. **What code standards should I follow?** → See `docs/coding-guidelines.md`
4. **How should the UI look?** → See `docs/ui-guidelines.md` for glassmorphism design system
5. **What tests do I need?** → See `docs/testing-guidelines.md` and examples in `IMPLEMENTATION_PLAN.md`

---

## Next Steps

1. **Clone/Fork** the repository
2. **Pick a task** from `PHASE_1_CHECKLIST.md` (start with backend or utilities)
3. **Create a branch**: `git checkout -b feature/task-name`
4. **Code** following guidelines in `docs/coding-guidelines.md`
5. **Test** your code with Jest
6. **Commit** with clear messages: `git commit -m "feat: implement task CRUD"`
7. **Push** to branch and create PR with reference to this plan
8. **Get reviewed** and iterate

---

**Happy coding! 🚀**

**Last Updated**: November 4, 2025  
**Questions?** Reference the docs in `/workspaces/ai-ae-bootcamp-session-2/docs/`
