# TODO App - Phased Implementation Plan

**Document Purpose**: Detailed technical roadmap for expanding the TODO app from basic item management to a production-ready TODO list application.

**Scope**: Priority 1 features (MVP) split into phases, then Phase 2 features (Priority 2).

**Database**: SQLite with persistent file storage

**Frontend State Management**: Custom React hook (`useTasks`)

---

## PHASE 1: MVP - CORE FUNCTIONALITY

Complete Priority 1 features to reach MVP status with full CRUD, filtering, sorting, due dates, categories, and status tracking.

### Phase 1 - Backend Implementation

#### 1.1 Data Model & Persistence

**File**: `packages/backend/src/models/Task.js`

Task schema with all required fields:

```javascript
{
  id: "UUID string",
  title: "string (1-255 chars, required)",
  description: "string (0-1000 chars, optional, default: '')",
  dueDate: "ISO 8601 date string or null (optional, default: null)",
  category: "enum string (Work|Personal|Shopping|Health|Finance|Education|Home|Other, default: 'Other')",
  status: "integer 0-100 representing % complete (default: 0)",
  parentTaskId: "UUID string or null (for sub-tasks, default: null)",
  subTasks: "array of UUID strings (default: [])",
  createdAt: "ISO 8601 timestamp (auto-set on creation)",
  updatedAt: "ISO 8601 timestamp (auto-set on creation, updated on modification)",
  isCompleted: "boolean derived from status === 100"
}
```

**Database Setup**:
- Use SQLite with `better-sqlite3` (already installed)
- Create persistent database file: `packages/backend/data/tasks.db`
- Create schema on app startup if DB doesn't exist
- Use synchronous operations for simplicity (better-sqlite3 is sync-only)

**Migrations/Schema**:
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(title) > 0 AND length(title) <= 255),
  description TEXT DEFAULT '',
  dueDate TEXT,
  category TEXT DEFAULT 'Other' CHECK(category IN ('Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other')),
  status INTEGER DEFAULT 0 CHECK(status >= 0 AND status <= 100),
  parentTaskId TEXT,
  subTasks TEXT DEFAULT '[]',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY(parentTaskId) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parentTaskId ON tasks(parentTaskId);
CREATE INDEX IF NOT EXISTS idx_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
```

#### 1.2 Backend Architecture - MVC Pattern

**File Structure**:
```
packages/backend/src/
├── app.js                  (Express app configuration)
├── index.js                (Server entry point)
├── models/
│   └── Task.js            (Task model and DB operations)
├── controllers/
│   └── taskController.js   (Business logic for each route)
├── middleware/
│   └── validation.js       (Input validation middleware)
├── utils/
│   └── database.js         (DB initialization and helpers)
└── data/
    └── tasks.db           (SQLite database file - .gitignored)
```

**Models/Task.js** - Handles all DB operations:
- `TaskModel.create(taskData)` - Create new task, return created task
- `TaskModel.getAll()` - Return all tasks
- `TaskModel.getById(id)` - Return single task or null
- `TaskModel.update(id, updates)` - Update task fields, return updated task
- `TaskModel.delete(id)` - Delete task and cascade delete sub-tasks
- `TaskModel.deleteSubTasksOf(parentId)` - Helper to delete all sub-tasks
- Input validation and error handling at this layer

**Controllers/taskController.js** - HTTP request handlers:
- Each controller function handles one route
- Calls TaskModel methods
- Returns appropriate HTTP status codes
- Handles errors and formats responses

**Middleware/validation.js**:
- Validate request body on POST/PUT
- Check required fields, data types, value ranges
- Return 400 Bad Request with error message if invalid
- Pass to next() if valid

#### 1.3 Backend - REST API Endpoints

| Method | Route | Purpose | Status |
|--------|-------|---------|--------|
| GET | `/api/tasks` | Retrieve all tasks | 200 OK, array of tasks |
| POST | `/api/tasks` | Create new task | 201 Created, new task object |
| PUT | `/api/tasks/:id` | Update task | 200 OK, updated task object |
| DELETE | `/api/tasks/:id` | Delete task | 200 OK with message |
| GET | `/api/tasks/:id` | Get single task | 200 OK, task object |

**Error Responses** (all POST/PUT/DELETE/GET):
- 400 Bad Request - Invalid input (missing title, invalid category, etc.)
- 404 Not Found - Task ID doesn't exist
- 500 Internal Server Error - Unexpected server error

**Request/Response Examples**:

```javascript
// POST /api/tasks - Create task
Request:
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "dueDate": "2025-11-10",
  "category": "Shopping",
  "status": 0
}

Response (201):
{
  "id": "uuid-here",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "dueDate": "2025-11-10",
  "category": "Shopping",
  "status": 0,
  "parentTaskId": null,
  "subTasks": [],
  "createdAt": "2025-11-04T10:30:00Z",
  "updatedAt": "2025-11-04T10:30:00Z",
  "isCompleted": false
}

// PUT /api/tasks/:id - Update task
Request:
{
  "status": 50,
  "description": "Updated description"
}

Response (200):
{
  "id": "uuid-here",
  "title": "Buy groceries",
  "description": "Updated description",
  "dueDate": "2025-11-10",
  "category": "Shopping",
  "status": 50,
  "parentTaskId": null,
  "subTasks": [],
  "createdAt": "2025-11-04T10:30:00Z",
  "updatedAt": "2025-11-04T10:30:00Z",
  "isCompleted": false
}
```

#### 1.4 Backend Testing

**Location**: `packages/backend/__tests__/tasks.test.js`

**Test Coverage**:
- GET /api/tasks returns empty array on startup
- POST /api/tasks creates task with all fields
- POST /api/tasks validates required title field
- POST /api/tasks validates category enum
- POST /api/tasks validates status 0-100 range
- PUT /api/tasks/:id updates specific fields
- PUT /api/tasks/:id returns 404 for non-existent ID
- DELETE /api/tasks/:id removes task
- DELETE /api/tasks/:id cascades to delete sub-tasks
- GET /api/tasks/:id returns correct task
- Database persistence across server restarts

**Tools**: Jest + Supertest for HTTP testing

---

### Phase 1 - Frontend Implementation

#### 1.5 Utilities Layer

**File**: `packages/frontend/src/utils/task-manager.js`

`TaskManager` class with static methods for all task operations (filtering, sorting, CRUD):

```javascript
class TaskManager {
  // Constants
  static CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];
  static PREDEFINED_STATUS = [0, 25, 50, 75, 100];
  static STORAGE_KEY = 'todoapp_tasks';

  // Task creation and validation
  static createTask(title, options = {}) → Task object
  static validateTask(task) → { isValid: boolean, errors: string[] }

  // Persistence
  static saveTasks(tasks) → void (save to localStorage)
  static loadTasks() → Task[] (load from localStorage, fallback to [])

  // Filtering
  static filterTasks(tasks, filters) → Task[]
    // Filters: category, status ('all'|'completed'|'incomplete'|'in-progress'), dateRange, searchQuery
    // Returns only parent tasks (not sub-tasks in main list)

  // Sorting
  static sortTasks(tasks, sortOption) → Task[]
    // sortOption: 'dueDate-asc', 'dueDate-desc', 'createdAt-asc', 'createdAt-desc', 'title-asc', 'title-desc', 'category-asc', 'status-asc', 'status-desc'

  // Sub-task helpers
  static getSubTasks(tasks, parentTaskId) → Task[]
  static calculateParentTaskStatus(tasks, parentTaskId) → number (average %)
}
```

**File**: `packages/frontend/src/utils/date-utils.js`

Date formatting and range matching utilities:

```javascript
export const getRelativeDateLabel = (dateString) → string
  // Returns: "Due Today", "Due Tomorrow", "Due in X days", "Overdue by X days", "Nov 10, 2025"

export const matchesDateRange = (dateString, range) → boolean
  // Range: 'overdue', 'today', 'tomorrow', 'week', 'month', 'no-due-date'

export const formatDateForInput = (dateString) → string
  // Returns YYYY-MM-DD for HTML date input

export const isOverdue = (dateString) → boolean

export const daysUntilDue = (dateString) → number
  // Positive = days in future, negative = days overdue, 0 = today
```

**File**: `packages/frontend/src/utils/uuid.js`

Simple UUID v4 generation:

```javascript
export const generateUUID = () → string
  // Use library or simple implementation
```

#### 1.6 React Custom Hook - useTasks

**File**: `packages/frontend/src/hooks/useTasks.js`

Custom hook for complete task state management:

```javascript
export const useTasks = () => {
  // State
  const [allTasks, setAllTasks] = useState([])
  const [filter, setFilter] = useState({
    category: null,           // null = show all
    status: 'all',
    dateRange: null,
    searchQuery: ''
  })
  const [sort, setSort] = useState('dueDate-asc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Effects
  useEffect(() => {
    // Load from localStorage on mount
    // Load from backend API for sync
  }, [])

  useEffect(() => {
    // Save to localStorage whenever allTasks changes
  }, [allTasks])

  // Methods
  const getFilteredAndSortedTasks = () => Task[]
  const addTask = (title, options) → Task
  const updateTask = (taskId, updates) → void
  const deleteTask = (taskId) → void
  const addSubTask = (parentTaskId, title, options) → Task

  // Return
  return {
    tasks: getFilteredAndSortedTasks(),
    allTasks,
    filter, setFilter,
    sort, setSort,
    loading, error,
    addTask, updateTask, deleteTask, addSubTask
  }
}
```

**Key Behaviors**:
- Load from localStorage on initial mount
- Save to localStorage after every change
- Optional: Sync with backend API for multi-tab/window persistence
- Handle loading/error states

#### 1.7 UI Components

**Component Structure**:

```
src/components/
├── App.jsx                (Root component, wires hook and subcomponents)
├── TaskList.jsx           (Main list view, passes tasks to TaskItem)
├── TaskItem.jsx           (Individual task display, compact view)
├── TaskDetail.jsx         (Expanded task view in modal/sidebar)
├── QuickAdd.jsx           (Form for quick task creation)
├── FilterBar.jsx          (Filters and sort selector)
└── CategoryBadge.jsx      (Reusable category badge component)
```

**App.jsx - Root Component**:
- Initialize `useTasks()` hook
- Render QuickAdd at top
- Render FilterBar below
- Render TaskList with filtered/sorted tasks
- Pass handlers (onAdd, onUpdate, onDelete, onAddSubTask) to children

**TaskList.jsx**:
- Props: `tasks`, `onUpdateTask`, `onDeleteTask`, `onAddSubTask`
- Render empty state if no tasks
- Map over tasks array, render TaskItem for each
- Handle "no results" for filtered views

**TaskItem.jsx**:
- Props: `task`, `onUpdate`, `onDelete`, `onAddSubTask`, `allTasks`
- Display: title, category badge, due date (relative), progress bar (%), sub-task count
- Show completed state (strikethrough, faded, checkmark)
- Click to expand detail view
- Button to toggle expand/collapse sub-tasks
- Display sub-tasks indented (if expanded)

**TaskDetail.jsx** (Modal or Sidebar):
- Props: `task`, `allTasks`, `onUpdate`, `onDelete`, `onAddSubTask`, `onClose`
- Show full task properties: title, description, due date, category, status (%)
- Show timestamps (created, updated)
- Inline edit fields (save on blur or explicit save button)
- Quick status buttons (0%, 25%, 50%, 75%, 100%)
- List sub-tasks with quick-add sub-task form
- Delete button with confirmation dialog

**QuickAdd.jsx**:
- Single input field for task title
- Optional: quick category and due date selector
- Button to create task
- Clear input after creation
- Enter key submits form

**FilterBar.jsx**:
- Category filter (dropdown or multi-select)
- Status filter (dropdown: All, Completed, Incomplete, In Progress)
- Date range filter (dropdown: Overdue, Today, Tomorrow, This Week, This Month, No Due Date)
- Sort selector (dropdown)
- Clear filters button

**CategoryBadge.jsx**:
- Props: `category`
- Render colored badge with category name
- Use CSS class for styling by category

#### 1.8 Glassmorphism Styling

**File**: `packages/frontend/src/App.css` (or split into component-specific files)

**CSS Variables** (root):
```css
:root {
  /* Glass Effects */
  --glass-white: rgba(255, 255, 255, 0.1);
  --glass-white-hover: rgba(255, 255, 255, 0.15);
  --glass-white-active: rgba(255, 255, 255, 0.2);
  --glass-blur-primary: blur(20px) saturate(180%);

  /* Colors - Categories */
  --color-work: rgba(99, 102, 241, 0.85);
  --color-personal: rgba(236, 72, 153, 0.85);
  --color-shopping: rgba(251, 146, 60, 0.85);
  --color-health: rgba(34, 197, 94, 0.85);
  --color-finance: rgba(59, 130, 246, 0.85);
  --color-education: rgba(168, 85, 247, 0.85);
  --color-home: rgba(239, 68, 68, 0.85);
  --color-other: rgba(107, 114, 128, 0.85);

  /* Colors - Status Progress */
  --color-status-0: #ef4444;
  --color-status-25: #f59e0b;
  --color-status-50: #eab308;
  --color-status-75: #84cc16;
  --color-status-100: #10b981;

  /* Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  --text-base: 1rem;
  --text-sm: 0.875rem;
  --text-xs: 0.75rem;

  /* Spacing */
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Shadows */
  --shadow-lg: 0 8px 32px rgba(31, 38, 135, 0.15);
  --shadow-inset: inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
}
```

**Global Styles**:
```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: var(--font-primary);
  color: white;
  min-height: 100vh;
  margin: 0;
  padding: var(--space-8);
}

* {
  box-sizing: border-box;
}
```

**Glass Card Base**:
```css
.glass-card {
  background: var(--glass-white);
  backdrop-filter: var(--glass-blur-primary);
  -webkit-backdrop-filter: var(--glass-blur-primary);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: var(--shadow-lg), var(--shadow-inset);
  padding: var(--space-6);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: var(--glass-white-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2), var(--shadow-inset);
}
```

**Task Card Specific**:
```css
.task-item {
  @extends .glass-card;
  margin-bottom: var(--space-4);
  cursor: pointer;
}

.task-item.completed {
  opacity: 0.7;
  text-decoration: line-through;
}

.task-category-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  border-radius: 20px;
  font-size: var(--text-xs);
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.task-category-badge.work { background: var(--color-work); }
.task-category-badge.personal { background: var(--color-personal); }
/* ... etc for all categories ... */
```

**Progress Bar**:
```css
.progress-bar-container {
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  overflow: hidden;
  margin: var(--space-2) 0;
}

.progress-bar {
  height: 100%;
  border-radius: 20px;
  transition: width 400ms ease;
  background: var(--color-status-0);
}

.progress-bar[data-status="25"] { background: var(--color-status-25); }
.progress-bar[data-status="50"] { background: var(--color-status-50); }
.progress-bar[data-status="75"] { background: var(--color-status-75); }
.progress-bar[data-status="100"] { background: var(--color-status-100); }
```

**Buttons**:
```css
.btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: var(--space-2) var(--space-4);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 300ms ease;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
}
```

**Input Fields**:
```css
input, select, textarea {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: var(--space-2) var(--space-4);
  color: white;
  font-size: var(--text-base);
  font-family: var(--font-primary);
}

input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}
```

**Responsive Breakpoints**:
```css
/* Mobile (<768px) */
@media (max-width: 767px) {
  body { padding: var(--space-4); }
  .task-item { margin-bottom: var(--space-2); }
  input, button { min-height: 44px; } /* touch targets */
}

/* Tablet (768px - 1024px) */
@media (min-width: 768px) {
  .app-container { display: grid; grid-template-columns: 250px 1fr; gap: var(--space-8); }
}

/* Desktop (>1024px) */
@media (min-width: 1024px) {
  body { max-width: 1200px; margin: 0 auto; }
}
```

#### 1.9 Frontend Testing

**Test Files**:

`packages/frontend/src/__tests__/utils/task-manager.test.js`:
- Test all TaskManager methods (create, filter, sort, etc.)
- Test localStorage save/load
- Test filtering by category, status, date range
- Test sorting by all options
- Test sub-task calculations

`packages/frontend/src/__tests__/utils/date-utils.test.js`:
- Test relative date labels (Due Today, Due Tomorrow, etc.)
- Test date range matching
- Test overdue detection

`packages/frontend/src/__tests__/hooks/useTasks.test.js`:
- Test hook initialization (loads from localStorage)
- Test adding task
- Test updating task
- Test deleting task
- Test filter/sort state changes
- Test localStorage persistence

`packages/frontend/src/__tests__/components/TaskItem.test.js`:
- Test task displays with title, category, due date, progress
- Test completed state styling
- Test click to expand detail
- Test status update

`packages/frontend/src/__tests__/components/TaskList.test.js`:
- Test renders empty state when no tasks
- Test renders task items from props
- Test passes handlers correctly

`packages/frontend/src/__tests__/components/App.test.js`:
- Test full integration (create task, update, delete)
- Test filtering and sorting work end-to-end
- Test localStorage persistence

---

## PHASE 2: PRIORITY 2 FEATURES

Implement after Phase 1 is complete and tested. Adds advanced features for power users.

### Phase 2 Scope

1. **Advanced Sorting** (Task 9)
   - Sort by creation date (newest/oldest first)
   - Sort alphabetically (A-Z / Z-A)
   - Sort by category
   - Sort by completion status (highest % / lowest % first)

2. **Advanced Filtering** (Task 10)
   - Date range filtering: Overdue, Today, Tomorrow, This Week, This Month, No Due Date
   - Multi-select categories with AND/OR logic
   - Filter by status: completed, incomplete, in-progress

3. **Search Functionality** (Task 10)
   - Real-time search by title and description
   - Case-insensitive substring matching
   - Debounced input (300ms)
   - Results respect current filters/sort

4. **Sub-Tasks & Hierarchy** (Task 11)
   - Create sub-tasks from task detail view
   - Display sub-tasks indented under parent
   - Collapse/expand sub-tasks
   - Parent completion % = average of sub-task %
   - Cascading delete (delete parent → delete all sub-tasks)

5. **Task Descriptions** (Task 12)
   - Optional description field (0-1000 chars)
   - Expanded view in TaskDetail
   - Edit inline with save button

---

## IMPLEMENTATION GUIDELINES

### Code Standards (Per coding-guidelines.md)

- **Indentation**: 2 spaces (never tabs)
- **Naming**: camelCase for vars/functions, PascalCase for components/classes, UPPER_SNAKE_CASE for constants, kebab-case for file names
- **Comments**: Explain "why", not "what"
- **Error Handling**: User-friendly messages, proper HTTP status codes
- **Testing**: Jest for both frontend and backend, comprehensive coverage

### File Naming

- Components: `TaskList.jsx` (matches component name)
- Utilities: `task-manager.js`, `date-utils.js`
- Tests: `__tests__/component.test.js` or `component.test.js`
- Files are kebab-case, except components which are PascalCase

### Import Organization

**Frontend (ES6 modules)**:
```javascript
import React, { useState } from 'react';           // React first
import { TaskManager } from '../utils/task-manager'; // utilities
import TaskList from './TaskList';                // components
import './App.css';                               // styles last
```

**Backend (CommonJS)**:
```javascript
const express = require('express');               // Node modules
const cors = require('cors');                     // third-party
const { TaskModel } = require('./models/Task');   // local
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/phase-1-backend`
2. Commit frequently with clear messages: `git commit -m "feat: implement task CRUD endpoints"`
3. Push to branch and create PR with Phase number in title
4. Reference this plan in PR description for context

---

## ESTIMATED TIMELINE

- **Phase 1 Backend** (Data Model + API): 3-4 days
- **Phase 1 Frontend Utilities**: 2-3 days
- **Phase 1 Frontend Components + Styling**: 4-5 days
- **Phase 1 Testing**: 2-3 days
- **Phase 1 Total**: ~2-3 weeks for MVP

- **Phase 2**: ~2-3 weeks for all Priority 2 features

---

## SUCCESS CRITERIA - PHASE 1

- ✅ All 8 tasks in Phase 1 completed and tested
- ✅ 100% of Priority 1 features from functional-requirements.md implemented
- ✅ All code passes eslint and prettier formatting
- ✅ All tests passing with >80% coverage
- ✅ App works in browser at `http://localhost:3000`
- ✅ Data persists in SQLite and localStorage
- ✅ UI matches glassmorphism design system
- ✅ Responsive on mobile (< 768px), tablet (768-1024px), and desktop (> 1024px)
- ✅ WCAG 2.1 AA accessibility compliance (keyboard nav, focus indicators, color contrast)

---

**Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Ready for Phase 1 Implementation
