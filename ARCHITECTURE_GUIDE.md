# TODO App - Architecture & Data Flow Guide

Visual reference for understanding the application architecture, data flow, and component relationships.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (React Frontend)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  App.jsx (Root Component)                                │   │
│  │  ├─ useTasks() Hook                                      │   │
│  │  │  ├─ State: allTasks, filter, sort, loading, error   │   │
│  │  │  └─ Methods: addTask, updateTask, deleteTask        │   │
│  │  │                                                      │   │
│  │  └─ Child Components:                                   │   │
│  │     ├─ QuickAdd.jsx (Create task form)                 │   │
│  │     ├─ FilterBar.jsx (Category, status, sort filters)  │   │
│  │     └─ TaskList.jsx                                     │   │
│  │        └─ TaskItem.jsx[] (Map each task)               │   │
│  │           ├─ Category badge                             │   │
│  │           ├─ Due date display                           │   │
│  │           ├─ Progress bar                               │   │
│  │           └─ Sub-tasks (if expanded)                   │   │
│  │              └─ TaskItem.jsx[] (Nested)                │   │
│  │                                                          │   │
│  │        └─ TaskDetail.jsx (Modal - when task clicked)    │   │
│  │           ├─ Edit form                                   │   │
│  │           ├─ Status buttons                              │   │
│  │           └─ Sub-task manager                            │   │
│  │                                                          │   │
│  │  Utilities (Imported):                                   │   │
│  │  ├─ TaskManager (task-manager.js)                       │   │
│  │  │  ├─ filterTasks()                                    │   │
│  │  │  ├─ sortTasks()                                      │   │
│  │  │  ├─ saveTasks() → localStorage                       │   │
│  │  │  └─ loadTasks() ← localStorage                       │   │
│  │  │                                                      │   │
│  │  └─ dateUtils (date-utils.js)                           │   │
│  │     ├─ getRelativeDateLabel()                           │   │
│  │     ├─ matchesDateRange()                               │   │
│  │     └─ formatDateForInput()                             │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Styling: App.css (Glassmorphism design system)                 │
│  ├─ CSS variables (colors, spacing, shadows)                   │
│  ├─ Glass card effects (backdrop-filter blur)                  │
│  ├─ Responsive breakpoints (mobile/tablet/desktop)             │
│  └─ Animations (fade, slide, shimmer)                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ FETCH
                   ┌──────────┴──────────┐
                   │ HTTP Requests/       │
                   │ Responses (JSON)     │
                   └──────────┬──────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER (Express Backend)                       │
│                      Port 3030                                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  app.js (Express App Configuration)                      │   │
│  │  ├─ Middleware: CORS, Morgan logging, bodyParser        │   │
│  │  ├─ Routes: /api/tasks (mapped to controllers)           │   │
│  │  └─ Error handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Route Handlers (taskController.js)                     │    │
│  │  ├─ POST /api/tasks → createTask()                      │    │
│  │  ├─ GET /api/tasks → getAllTasks()                      │    │
│  │  ├─ GET /api/tasks/:id → getTask()                      │    │
│  │  ├─ PUT /api/tasks/:id → updateTask()                   │    │
│  │  └─ DELETE /api/tasks/:id → deleteTask()                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Validation Middleware (validation.js)                  │    │
│  │  ├─ Validate title (required, 1-255 chars)              │    │
│  │  ├─ Validate category (enum)                            │    │
│  │  ├─ Validate status (0-100)                             │    │
│  │  └─ Validate dueDate (ISO or null)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Task Model (models/Task.js)                            │    │
│  │  ├─ create(taskData)                                    │    │
│  │  ├─ getAll() / getById(id)                              │    │
│  │  ├─ update(id, updates)                                 │    │
│  │  ├─ delete(id)                                          │    │
│  │  └─ DB query methods                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SQLite Database (packages/backend/data/tasks.db)       │    │
│  │  └─ Table: tasks                                        │    │
│  │     ├─ id (PK, UUID)                                    │    │
│  │     ├─ title (TEXT, NOT NULL)                           │    │
│  │     ├─ description, dueDate, category, status           │    │
│  │     ├─ parentTaskId, subTasks (JSON array)              │    │
│  │     ├─ createdAt, updatedAt (ISO timestamps)            │    │
│  │     └─ Indices: parentTaskId, category, status          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Create Task

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION: Click "Add Task" in QuickAdd form                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND: QuickAdd.jsx calls onAddTask(title)                 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. HOOK: useTasks.addTask() is called                            │
│    ├─ Create task object: TaskManager.createTask(title)          │
│    │  └─ Generates UUID, timestamps, sets defaults              │
│    ├─ Call backend: fetch POST /api/tasks {task data}            │
│    └─ Update state: setAllTasks([...allTasks, newTask])          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. BACKEND: POST /api/tasks request arrives                      │
│    ├─ Middleware: validation.js validates body                   │
│    ├─ Controller: taskController.createTask()                    │
│    ├─ Model: TaskModel.create(taskData)                          │
│    │  └─ INSERT INTO tasks (SQL query)                           │
│    └─ Response: 201 Created {task object}                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. FRONTEND: Parse response, update state                        │
│    ├─ Task state updated: allTasks = [..., newTask]              │
│    ├─ Component re-renders: TaskList shows new task              │
│    └─ localStorage updated: TaskManager.saveTasks(allTasks)      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. UI: New task appears in TaskList view                         │
│    └─ Triggers filter/sort: getFilteredAndSortedTasks()          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Update Task Status

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION: Click progress button or drag slider in TaskItem │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND: TaskItem.jsx calls onUpdate(taskId, {status: 75})   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. HOOK: useTasks.updateTask(taskId, updates) is called          │
│    ├─ Find task in allTasks by ID                                │
│    ├─ Merge updates into task                                    │
│    ├─ Call backend: fetch PUT /api/tasks/:id {updates}           │
│    └─ Update state: setAllTasks([...updated tasks])              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. BACKEND: PUT /api/tasks/:id request arrives                   │
│    ├─ Controller: taskController.updateTask()                    │
│    ├─ Model: TaskModel.update(id, {status: 75})                  │
│    │  └─ UPDATE tasks SET status=75 WHERE id=:id                 │
│    └─ Response: 200 OK {updated task object}                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. FRONTEND: Parse response, update state                        │
│    ├─ Task state updated with new status                         │
│    ├─ Component re-renders: TaskItem shows updated progress bar  │
│    ├─ localStorage updated                                       │
│    └─ If task is parent with sub-tasks: recalculate parent %     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. UI: Progress bar updates with new color/width                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
useTasks Hook (Single Source of Truth)
│
├─ allTasks: [Task, Task, Task, ...]
│  ├─ Loaded from: localStorage on mount, synced from backend
│  └─ Updated by: addTask, updateTask, deleteTask, addSubTask
│
├─ filter: {category, status, dateRange, searchQuery}
│  ├─ Default: {category: null, status: 'all', dateRange: null, searchQuery: ''}
│  └─ Updated by: user interaction with FilterBar
│
├─ sort: 'dueDate-asc' | 'dueDate-desc' | 'createdAt-asc' | ...
│  └─ Updated by: user interaction with sort selector
│
├─ getFilteredAndSortedTasks()
│  ├─ Step 1: TaskManager.filterTasks(allTasks, filter)
│  │  ├─ Filters out sub-tasks (only shows parents in main list)
│  │  ├─ Applies category filter (if set)
│  │  ├─ Applies status filter
│  │  ├─ Applies date range filter
│  │  └─ Applies search query
│  │
│  └─ Step 2: TaskManager.sortTasks(filtered, sort)
│     └─ Sorts by chosen field
│
└─ Return to TaskList component for rendering
   ├─ Map over tasks
   └─ Render TaskItem for each
```

---

## Component Communication

```
App.jsx
├─ Props down: tasks, handlers
├─ Callbacks up: onAddTask, onUpdateTask, onDeleteTask
│
├─ QuickAdd.jsx
│  └─ onAddTask(title, options) → calls App → calls useTasks.addTask()
│
├─ FilterBar.jsx
│  └─ onFilterChange, onSortChange → updates hook state
│
├─ TaskList.jsx
│  ├─ Props: tasks, handlers
│  │
│  └─ TaskItem.jsx[] (for each task)
│     ├─ onClick → opens TaskDetail modal
│     ├─ onStatusChange → calls onUpdateTask
│     ├─ onDelete → calls onDeleteTask
│     ├─ onExpandSubTasks → local state toggle
│     │
│     └─ TaskItem.jsx[] (sub-tasks, nested)
│        └─ Same handlers as parent
│
└─ TaskDetail.jsx (Modal overlay)
   ├─ Props: task, handlers
   ├─ onUpdate → calls onUpdateTask
   ├─ onDelete → calls onDeleteTask
   ├─ onAddSubTask → calls onAddSubTask
   └─ onClose → closes modal
```

---

## localStorage Persistence

```
Browser localStorage
│
└─ Key: 'todoapp_tasks'
   └─ Value: JSON stringified array of all tasks
      [
        {id, title, description, dueDate, category, status, ...},
        {id, title, description, dueDate, category, status, ...},
        ...
      ]

Flow:
├─ On app mount:
│  └─ useEffect → TaskManager.loadTasks() → setAllTasks(tasks from localStorage)
│
├─ On every change to allTasks:
│  └─ useEffect → TaskManager.saveTasks(allTasks) → JSON.stringify → localStorage.setItem()
│
└─ Sync with backend:
   ├─ Backend is source of truth for persistence
   ├─ localStorage is cache for fast offline access
   └─ Both stay in sync via fetch calls
```

---

## Database Schema (SQLite)

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,              -- UUID
  title TEXT NOT NULL,              -- 1-255 chars
  description TEXT DEFAULT '',      -- 0-1000 chars
  dueDate TEXT,                     -- ISO date or NULL
  category TEXT DEFAULT 'Other',    -- enum: Work, Personal, Shopping, ...
  status INTEGER DEFAULT 0,         -- 0-100 representing %
  parentTaskId TEXT,                -- FK to tasks(id) or NULL
  subTasks TEXT DEFAULT '[]',       -- JSON array of UUIDs
  createdAt TEXT NOT NULL,          -- ISO timestamp
  updatedAt TEXT NOT NULL,          -- ISO timestamp
  FOREIGN KEY(parentTaskId) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_parentTaskId ON tasks(parentTaskId);
CREATE INDEX idx_category ON tasks(category);
CREATE INDEX idx_status ON tasks(status);
```

---

## Component Lifecycle

```
Page Load:
├─ App component mounts
├─ useTasks hook initializes
│  ├─ State created: allTasks=[], filter={...}, sort='dueDate-asc'
│  ├─ useEffect: Load from localStorage
│  │  └─ setAllTasks(loaded tasks)
│  └─ Fetch from backend /api/tasks (optional, for sync)
│
└─ Components render
   ├─ App → QuickAdd + FilterBar + TaskList
   └─ TaskList → TaskItem[] (mapped from filtered/sorted tasks)

User Creates Task:
├─ Type title in QuickAdd
├─ Press Enter or click Add
├─ onAddTask() called
├─ useTasks.addTask() executed
│  ├─ Create task object
│  ├─ Fetch POST /api/tasks
│  ├─ setAllTasks (trigger re-render)
│  └─ useEffect saves to localStorage
├─ App re-renders with new task
└─ TaskList updates (applies filter/sort)

User Filters Tasks:
├─ Click filter option in FilterBar
├─ onFilterChange() updates filter state
├─ getFilteredAndSortedTasks() recalculated
├─ TaskList re-renders with filtered tasks
└─ Sorting applied automatically

User Updates Task:
├─ Click task → TaskDetail opens
├─ Edit field and blur
├─ onUpdateTask() called
├─ useTasks.updateTask() executed
│  ├─ Fetch PUT /api/tasks/:id
│  ├─ setAllTasks (trigger re-render)
│  └─ useEffect saves to localStorage
├─ TaskDetail shows updated values
└─ TaskItem in list updates progress bar
```

---

## Testing Strategy: Unit vs Integration

```
Unit Tests (Isolated)
├─ TaskManager.filterTasks() → test with mock tasks array
├─ TaskManager.sortTasks() → test sorting logic
├─ dateUtils.getRelativeDateLabel() → test date formatting
├─ dateUtils.matchesDateRange() → test date range logic
└─ Component snapshots (TaskItem, TaskDetail, etc.)

Integration Tests (How pieces work together)
├─ useTasks hook → mock fetch, test full flow
├─ App component → renders with tasks from hook
├─ TaskList + TaskItem → render task, click opens detail
├─ QuickAdd → type, submit, appears in list
├─ Filter + Sort → apply filters, verify list updates
└─ localStorage persistence → add task, refresh page, task still there

End-to-End Tests (Full user flows)
├─ Create task → verify in list → update status → verify progress bar
├─ Filter by category → verify only category tasks shown
├─ Search by title → verify search results
├─ Delete task → verify removed from list
└─ Sub-task operations → create, expand, collapse, delete parent
```

---

**Last Updated**: November 4, 2025  
**Reference**: Use this diagram when implementing components and understanding data flow.
