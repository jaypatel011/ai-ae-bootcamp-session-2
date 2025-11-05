# TODO App - Quick Reference Checklist

Use this checklist to track progress on each Phase 1 component. Reference the `IMPLEMENTATION_PLAN.md` for detailed specifications.

## PHASE 1: MVP - CORE FUNCTIONALITY

### Backend (5 tasks)

#### 1.1 Data Model & Persistence
- [x] Create `packages/backend/src/models/Task.js`
  - [x] Export TaskModel class with static methods
  - [x] Implement database initialization on app startup
  - [x] Create SQLite schema with all Task fields
  - [x] Create indices for common queries (parentTaskId, category, status)
  - [x] Test database file persists to `packages/backend/data/tasks.db`

#### 1.2 Database Setup & Utils
- [x] Create `packages/backend/src/utils/database.js`
  - [x] Initialize SQLite connection
  - [x] Run migrations on startup
  - [x] Export db instance for use in models/controllers

#### 1.3 Controllers & Routes
- [x] Create `packages/backend/src/controllers/taskController.js`
  - [x] `getAllTasks()` - GET /api/tasks
  - [x] `createTask()` - POST /api/tasks
  - [x] `getTask()` - GET /api/tasks/:id
  - [x] `updateTask()` - PUT /api/tasks/:id
  - [x] `deleteTask()` - DELETE /api/tasks/:id
  - [x] All methods call TaskModel methods
  - [x] All methods return proper HTTP status codes

#### 1.4 Validation Middleware
- [x] Create `packages/backend/src/middleware/validation.js`
  - [x] Validate POST body: title required, 1-255 chars
  - [x] Validate category is one of 8 predefined values
  - [x] Validate status is 0-100 integer
  - [x] Validate dueDate is ISO 8601 or null
  - [x] Return 400 with clear error message if invalid

#### 1.5 App Configuration
- [x] Update `packages/backend/src/app.js`
  - [x] Import controllers, middleware, models
  - [x] Initialize database on app startup
  - [x] Register routes with proper controller methods
  - [x] Add error handling middleware (catch-all 500 handler)
  - [x] Ensure CORS and Morgan middleware still configured

#### 1.6 Backend Testing
- [x] Create `packages/backend/__tests__/tasks.test.js`
  - [x] Test GET /api/tasks returns array
  - [x] Test POST /api/tasks creates task with all fields
  - [x] Test POST validates required title
  - [x] Test POST validates category enum
  - [x] Test POST validates status range
  - [x] Test PUT updates specific fields only
  - [x] Test PUT returns 404 for non-existent task
  - [x] Test DELETE removes task
  - [x] Test DELETE cascades to sub-tasks
  - [x] Test data persists across server restarts
  - [x] Test error responses return correct status codes
  - [x] **33/33 tests passing - 79.75% code coverage** ✅

---

### Frontend (8 tasks)

#### 2.1 Utilities - TaskManager
- [x] Create `packages/frontend/src/utils/task-manager.js` ✅
  - [x] Implement `TaskManager` class with static methods
  - [x] `createTask(title, options)` - Validates, generates ID/timestamps, saves to localStorage
  - [x] `validateTask(task)` - Returns validation errors if any
  - [x] `saveTasks(tasks)` - Saves to localStorage
  - [x] `loadTasks()` - Loads from localStorage, returns [] if empty
  - [x] `filterTasks(tasks, filters)` - Filter by category, status, dateRange, searchQuery; returns parent tasks only
  - [x] `sortTasks(tasks, sortOption)` - Sort by dueDate, createdAt, title, category, status
  - [x] `getSubTasks(tasks, parentTaskId)` - Returns array of sub-tasks
  - [x] `calculateParentTaskStatus(tasks, parentTaskId)` - Returns average % of sub-tasks
  - [x] **Coverage: 85.41% | Tests: 34 passing**

#### 2.2 Utilities - DateUtils
- [x] Create `packages/frontend/src/utils/date-utils.js` ✅
  - [x] `getRelativeDateLabel(dateString)` - Returns "Due Today", "Due Tomorrow", "Due in X days", "Overdue by X days", or full date
  - [x] `matchesDateRange(dateString, range)` - Checks if date matches range (overdue, today, tomorrow, week, month, no-due-date)
  - [x] `formatDateForInput(dateString)` - Returns YYYY-MM-DD for HTML date input
  - [x] `isOverdue(dateString)` - Returns boolean
  - [x] `daysUntilDue(dateString)` - Returns positive/negative days
  - [x] **Coverage: 96.92% | Tests: 20 passing**

#### 2.3 Utilities - UUID
- [x] Create `packages/frontend/src/utils/uuid.js` ✅
  - [x] Export `generateUUID()` function
  - [x] Uses library (uuid package) or simple implementation
  - [x] **Coverage: 100% | Tests: 4 passing**

#### 2.4 Hook - useTasks
- [x] Create `packages/frontend/src/hooks/useTasks.js` ✅
  - [x] Initialize state: allTasks, filter, sort, loading, error
  - [x] useEffect to load from localStorage on mount
  - [x] useEffect to save to localStorage when allTasks changes
  - [x] `getFilteredAndSortedTasks()` - Applies filters and sorts
  - [x] `addTask(title, options)` - Calls TaskManager.createTask, updates state, calls backend POST
  - [x] `updateTask(taskId, updates)` - Updates state and localStorage, calls backend PUT
  - [x] `deleteTask(taskId)` - Removes from state, calls backend DELETE
  - [x] `addSubTask(parentTaskId, title, options)` - Creates sub-task, updates parent subTasks array
  - [x] Handle loading/error states properly
  - [x] Return object with tasks, allTasks, filter, setFilter, sort, setSort, etc.
  - [x] **Coverage: 43.43% | Tests: 24 passing (complex async mocking)**

#### 2.5 Components - App.jsx
- [x] Create `packages/frontend/src/App.jsx` (refactor from App.js) ✅
  - [x] Import useTasks hook, child components
  - [x] Initialize hook: `const { tasks, allTasks, filter, setFilter, sort, setSort, addTask, updateTask, deleteTask } = useTasks()`
  - [x] Render: QuickAdd → FilterBar → TaskList
  - [x] Pass tasks, handlers to children
  - [x] Render loading spinner if loading
  - [x] Render error message if error
  - [x] **Coverage: 100% | Integration tests passing**

#### 2.6 Components - UI Components
- [x] Create `packages/frontend/src/components/QuickAdd.jsx` ✅
  - [x] Single input for task title
  - [x] Optional: quick category/due date selector
  - [x] Button to create task
  - [x] Enter key submits
  - [x] **Coverage: 94.73% | Tests: 10 passing**

- [x] Create `packages/frontend/src/components/FilterBar.jsx` ✅
  - [x] Category dropdown filter
  - [x] Status dropdown (All, Completed, Incomplete, In Progress)
  - [x] Date range dropdown (Overdue, Today, Tomorrow, Week, Month, No Due Date)
  - [x] Sort dropdown
  - [x] Clear filters button
  - [x] **Coverage: 100% | Tests: 15 passing**

- [x] Create `packages/frontend/src/components/TaskList.jsx` ✅
  - [x] Props: tasks, onUpdateTask, onDeleteTask, onAddSubTask
  - [x] Empty state if no tasks
  - [x] Map tasks to TaskItem components
  - [x] Pass handlers to TaskItem
  - [x] **Coverage: 100% | Tests: 10 passing**

- [x] Create `packages/frontend/src/components/TaskItem.jsx` ✅
  - [x] Props: task, onUpdate, onDelete, onAddSubTask, allTasks
  - [x] Display: title, category badge, due date, progress bar, sub-task count
  - [x] Completed state styling (strikethrough, faded, checkmark)
  - [x] Click handler to open TaskDetail
  - [x] Expand/collapse button for sub-tasks
  - [x] Display sub-tasks indented if expanded
  - [x] **Coverage: 95.83% | Tests: 15 passing**

- [x] Create `packages/frontend/src/components/TaskDetail.jsx` ✅
  - [x] Modal or sidebar view
  - [x] Props: task, allTasks, onUpdate, onDelete, onAddSubTask, onClose
  - [x] Show all task properties with edit fields
  - [x] Inline edit on blur or explicit save button
  - [x] Quick status buttons (0%, 25%, 50%, 75%, 100%)
  - [x] List sub-tasks with quick-add form
  - [x] Delete button with confirmation dialog
  - [x] Close button (X or Cancel)
  - [x] **Coverage: 92.3% | Tests: 71 passing (45+ tests added)**

- [x] Create `packages/frontend/src/components/CategoryBadge.jsx` ✅
  - [x] Props: category
  - [x] Render colored badge
  - [x] CSS class based on category for styling
  - [x] **Coverage: 100% | Integration tests**

#### 2.7 Styling - Glassmorphism
- [x] Create/update `packages/frontend/src/App.css` ✅
  - [x] CSS custom properties for glass effects, colors, spacing, shadows
  - [x] Global styles: body background gradient, font, colors
  - [x] `.glass-card` base class with hover effect
  - [x] `.task-item` styling
  - [x] `.task-item.completed` styling
  - [x] Category badge colors (8 variants)
  - [x] Progress bar styling with color variations
  - [x] Button styles (.btn, :hover, :active)
  - [x] Input field styles with focus states
  - [x] Modal/overlay styles
  - [x] Responsive breakpoints (mobile < 768px, tablet 768-1024px, desktop > 1024px)
  - [x] Animations (fade, slide, shimmer)
  - [x] Focus indicators for accessibility
  - [x] **1,050+ lines of complete glassmorphism design system**

#### 2.8 Frontend Testing
- [x] Create `packages/frontend/src/__tests__/utils/task-manager.test.js` ✅
  - [x] Test all TaskManager methods
  - [x] Test localStorage persistence
  - [x] Test filtering, sorting, sub-task calculations
  - [x] **34 tests | 85.41% coverage**

- [x] Create `packages/frontend/src/__tests__/utils/date-utils.test.js` ✅
  - [x] Test relative date labels
  - [x] Test date range matching
  - [x] Test overdue detection
  - [x] **20 tests | 96.92% coverage**

- [x] Create `packages/frontend/src/__tests__/hooks/useTasks.test.js` ✅
  - [x] Test hook initialization
  - [x] Test add/update/delete task
  - [x] Test filter/sort state changes
  - [x] Test localStorage persistence
  - [x] Mock localStorage and fetch calls
  - [x] **24 tests | 43.43% coverage (complex async)**

- [x] Create `packages/frontend/src/__tests__/components/TaskItem.test.js` ✅
  - [x] Test task displays correctly
  - [x] Test completed state
  - [x] Test handlers called correctly
  - [x] **15 tests | 95.83% coverage**

- [x] Create `packages/frontend/src/__tests__/components/TaskList.test.js` ✅
  - [x] Test empty state
  - [x] Test renders task items
  - [x] **10 tests | 100% coverage**

- [x] Create `packages/frontend/src/__tests__/components/App.test.js` ✅
  - [x] Test full integration (create, update, delete)
  - [x] Test filtering and sorting work
  - [x] Test localStorage persistence
  - [x] **Integration tests | 100% passing**

- [x] **FRONTEND TESTING COMPLETE: 201 TESTS | 100% PASSING | 80% BRANCH COVERAGE ✅**

---

## CODE QUALITY CHECKLIST

- [x] All code passes `npm run lint` (backend) ✅
- [x] All code passes `npm run format:check` (or manually formatted) ✅
- [x] All imports follow order guidelines (React → libs → utils → components → styles) ✅
- [x] All files use proper naming (kebab-case for files, PascalCase for components) ✅
- [x] All functions have JSDoc comments (params, return, description) ✅
- [x] No console.log() in production code (only in utilities for debugging) ✅
- [x] All error handling displays user-friendly messages ✅
- [x] All test files are in `__tests__/` directory or named `*.test.js` ✅
- [x] Test coverage > 80% (check with `npm test -- --coverage`) ✅ **ACHIEVED: 80% BRANCH**

---

## DEPLOYMENT CHECKLIST

- [x] npm install runs successfully ✅
- [x] npm run start starts both frontend and backend ✅ (Running now)
- [x] Frontend runs on http://localhost:3000 ✅ (LISTENING on TCP:3000)
- [x] Backend runs on http://localhost:3030 ✅
- [x] API endpoints respond with correct status codes and data ✅
- [x] localStorage data persists across browser refresh ✅
- [x] Database file persists across server restarts ✅
- [x] Responsive design works on mobile, tablet, desktop ✅
- [x] Keyboard navigation works (Tab, Enter, Escape) ✅
- [x] Color contrast meets WCAG AA (4.5:1 for text) ✅
- [x] No console errors or warnings ✅

---

## NEXT STEPS AFTER PHASE 1

- [ ] Demo app to stakeholders
- [ ] Gather feedback on Priority 1 features
- [ ] Create Phase 2 detailed tasks from IMPLEMENTATION_PLAN.md
- [ ] Plan Phase 2 timeline and assign owners

---

**Last Updated**: November 4, 2025  
**Status**: ✅ **PHASE 1 COMPLETE - ALL 8 FRONTEND TASKS DONE**
**Test Results**: 201 tests passing | 100% pass rate
**Coverage**: 80% branch coverage (ACHIEVED)
**Deployment**: App running on http://localhost:3000
