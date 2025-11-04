# TODO List App - Core Functional Requirements

## Overview
This document defines the core functional requirements for the TODO List application organized by feature area.

---

## 1. TASK MANAGEMENT

### 1.1 Create Task
- [ ] User can create a new task with a title
- [ ] Task title is mandatory and non-empty
- [ ] New tasks default to 0% completion status
- [ ] New tasks default to "Other" category (if not specified)
- [ ] New tasks default to no due date (optional)
- [ ] Created timestamp is automatically set
- [ ] Task is assigned a unique ID

### 1.2 Read/View Tasks
- [ ] User can view all tasks in a list format
- [ ] User can view full task details in expanded/detail view
- [ ] User can see task title, category, due date, and completion %
- [ ] Task details show description, created date, and last modified date

### 1.3 Edit Task
- [ ] User can edit task title
- [ ] User can edit task description
- [ ] User can edit task due date (add, modify, or clear)
- [ ] User can change task category
- [ ] User can update task completion percentage
- [ ] Updated timestamp is automatically set
- [ ] Changes are saved immediately in UI and data store

### 1.4 Delete Task
- [ ] User can delete a task
- [ ] Confirmation dialog appears before deletion
- [ ] Deleting a parent task also deletes all its sub-tasks
- [ ] Deleted tasks are permanently removed (no undo in MVP)

---

## 2. DUE DATE MANAGEMENT

### 2.1 Add/Set Due Date
- [ ] User can set a due date when creating a task
- [ ] User can add due date to an existing task
- [ ] User can modify an existing due date
- [ ] User can clear/remove a due date
- [ ] Due date is stored in ISO 8601 format (YYYY-MM-DD)
- [ ] Date picker UI is user-friendly

### 2.2 Due Date Display
- [ ] Due dates are shown on task list items
- [ ] Due dates use human-readable format:
  - [ ] "Due Today"
  - [ ] "Due Tomorrow"
  - [ ] "Due in X days"
  - [ ] "Overdue by X days" (for past due dates)
  - [ ] Full date format as fallback (Nov 10, 2025)

### 2.3 Overdue Handling
- [ ] Tasks with past due dates are visually marked as "Overdue"
- [ ] Overdue tasks can be highlighted or color-coded
- [ ] User can filter to view only overdue tasks

---

## 3. TASK CATEGORIZATION

### 3.1 Category Assignment
- [ ] Each task can be assigned to exactly one category
- [ ] Predefined categories are available:
  - [ ] Work
  - [ ] Personal
  - [ ] Shopping
  - [ ] Health
  - [ ] Finance
  - [ ] Education
  - [ ] Home
  - [ ] Other
- [ ] Category can be set at task creation
- [ ] Category can be changed at any time
- [ ] Each category has a unique color/badge for visual distinction

### 3.2 Category Display
- [ ] Category is displayed as a colored badge/label on task items
- [ ] Category name is clear and readable
- [ ] Category color is consistent throughout the app

### 3.3 Category Filtering
- [ ] User can filter tasks to show only tasks from a specific category
- [ ] User can select multiple categories to filter
- [ ] "Show All" option displays tasks from all categories
- [ ] Filter selection is persisted in the current session

---

## 4. TASK STATUS & PROGRESS TRACKING

### 4.1 Status Levels
- [ ] Tasks have a completion percentage from 0% to 100%
- [ ] Predefined status levels are available:
  - [ ] 0% = "Not Started"
  - [ ] 25% = "In Progress"
  - [ ] 50% = "Half Done"
  - [ ] 75% = "Almost Done"
  - [ ] 100% = "Complete"

### 4.2 Set/Update Status
- [ ] User can set a custom percentage (0-100) for a task
- [ ] User can use quick-select buttons for predefined status levels
- [ ] Status can be updated at any time
- [ ] Status changes are saved immediately

### 4.3 Status Display
- [ ] Task list shows completion percentage as a visual progress bar or text
- [ ] Completed tasks (100%) are visually distinguished:
  - [ ] Strikethrough text (optional)
  - [ ] Faded appearance (optional)
  - [ ] Checkmark icon
- [ ] Progress bar color changes based on completion level (e.g., red → yellow → green)

### 4.4 Completion Tracking
- [ ] `isCompleted` flag is true when status = 100%
- [ ] `isCompleted` flag is false when status < 100%
- [ ] Completed tasks can be toggled back to incomplete status

---

## 5. SUB-TASKS / TASK HIERARCHY

### 5.1 Create Sub-Tasks
- [ ] User can add sub-tasks to an existing task
- [ ] Sub-tasks have the same properties as parent tasks (title, due date, category, status)
- [ ] Sub-tasks are created with 0% completion by default
- [ ] A task can have unlimited sub-tasks
- [ ] Sub-task creation is accessible from task detail view

### 5.2 Sub-Task Display
- [ ] Sub-tasks are visually indented under parent task
- [ ] Sub-tasks can be collapsed/expanded (show/hide)
- [ ] Parent task indicates number of sub-tasks or expand/collapse button
- [ ] Sub-task hierarchy is preserved in all views

### 5.3 Sub-Task Management
- [ ] User can edit individual sub-tasks
- [ ] User can delete individual sub-tasks
- [ ] User can delete parent task (which also deletes all sub-tasks with confirmation)
- [ ] User can promote sub-task to parent task (optional for MVP)
- [ ] User can add sub-tasks to sub-tasks (up to configurable depth)

### 5.4 Sub-Task Inheritance & Rollup
- [ ] Sub-tasks inherit parent category by default (can be overridden)
- [ ] Parent task completion % is calculated as average of all sub-task percentages
- [ ] If parent has both sub-tasks and direct completion %, sub-task percentages take priority
- [ ] Parent task status updates automatically when any sub-task is modified

### 5.5 Sub-Task Constraints
- [ ] Sub-tasks cannot exist without a parent task
- [ ] Deleting parent task deletes all sub-tasks

---

## 6. TASK SORTING

### 6.1 Sort Options Available
- [ ] Sort by due date (earliest first / latest first)
- [ ] Sort by creation date (newest first / oldest first)
- [ ] Sort by alphabetical order (A-Z / Z-A)
- [ ] Sort by category (alphabetical by category name)
- [ ] Sort by completion status (highest % first / lowest % first)

### 6.2 Default Sort Order
- [ ] Default: By due date (earliest first), then by creation date (newest first)
- [ ] Overdue tasks appear at the top (before other due date sorting)

### 6.3 Sort Persistence
- [ ] User's selected sort preference is remembered in current session
- [ ] Sort preference is restored on page refresh (using local storage)
- [ ] Sort option selector clearly shows current sort order

---

## 7. TASK FILTERING

### 7.1 Filter Options
- [ ] Filter by category (single or multiple categories)
- [ ] Filter by status (show: completed only, incomplete only, in-progress, all)
- [ ] Filter by due date range:
  - [ ] Overdue
  - [ ] Due Today
  - [ ] Due Tomorrow
  - [ ] Due This Week
  - [ ] Due This Month
  - [ ] No Due Date
  - [ ] Custom date range

### 7.2 Filter Behavior
- [ ] Multiple filters combine with AND logic (must match all criteria)
- [ ] User can apply and unapply individual filters
- [ ] "Clear All Filters" button resets to default view
- [ ] Filter state is shown clearly in UI

### 7.3 Filter Persistence
- [ ] Filter preferences are remembered in current session
- [ ] Filters are persisted in local storage (optional)

---

## 8. TASK SEARCH

### 8.1 Search Functionality
- [ ] User can search tasks by title
- [ ] User can search tasks by description (if description exists)
- [ ] Search is real-time (updates as user types)
- [ ] Search is case-insensitive
- [ ] Search matches partial strings (substring matching)

### 8.2 Search Results
- [ ] Search results are displayed in the task list
- [ ] Matching text is highlighted in search results
- [ ] Search results respect current filter/sort settings
- [ ] Clear search button resets to full task list

---

## 9. USER INTERFACE

### 9.1 Task List View
- [ ] Task list displays all tasks or filtered subset
- [ ] Each task item shows:
  - [ ] Task title
  - [ ] Category badge (color-coded)
  - [ ] Due date (relative format)
  - [ ] Completion percentage (progress bar or text)
  - [ ] Sub-task count or expand/collapse indicator
- [ ] Tasks are visually organized by sort order
- [ ] Hover/click actions are clearly indicated

### 9.2 Task Detail View
- [ ] Detail view can be accessed by clicking on a task
- [ ] Detail view shows all task properties:
  - [ ] Full title
  - [ ] Description (if exists)
  - [ ] Due date
  - [ ] Category
  - [ ] Completion percentage
  - [ ] Created and modified timestamps
- [ ] Detail view allows editing of all properties
- [ ] Detail view shows list of sub-tasks with quick-add option
- [ ] Detail view can be closed to return to list

### 9.3 Quick Add Interface
- [ ] Quick add input field is easily accessible (top of list or floating button)
- [ ] User can quickly add a task with just a title
- [ ] Optional due date and category selection in quick add
- [ ] Quick add clears after task is created
- [ ] Enter key submits the quick add form

### 9.4 Responsive Design
- [ ] App is usable on mobile devices (< 768px width)
- [ ] App is usable on tablets (768px - 1024px width)
- [ ] App is usable on desktop (> 1024px width)
- [ ] Touch-friendly buttons and inputs on mobile

### 9.5 Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] ARIA labels for important elements
- [ ] Color is not the only way to convey information
- [ ] Sufficient color contrast (WCAG AA compliant)
- [ ] Focus indicators are visible

---

## 10. DATA PERSISTENCE

### 10.1 Local Storage
- [ ] Tasks are saved to browser local storage
- [ ] Data persists across browser sessions
- [ ] Auto-save functionality (save on every change)
- [ ] Data is retrieved from local storage on app load

### 10.2 Data Validation
- [ ] Task title must be non-empty and 1-255 characters
- [ ] Category must be one of the predefined categories
- [ ] Status must be an integer between 0-100
- [ ] Due date must be a valid ISO date or null
- [ ] IDs must be unique and non-empty

### 10.3 Data Model
Tasks are stored with the following structure:
```javascript
{
  id: "string (UUID)",
  title: "string (1-255 chars)",
  description: "string (0-1000 chars, optional)",
  dueDate: "string (ISO 8601 format, nullable)",
  category: "string (enum: Work|Personal|Shopping|Health|Finance|Education|Home|Other)",
  status: "number (0-100)",
  parentTaskId: "string (nullable, references parent task ID)",
  subTasks: "array of task IDs",
  createdAt: "string (ISO 8601 timestamp)",
  updatedAt: "string (ISO 8601 timestamp)",
  isCompleted: "boolean (derived from status === 100)"
}
```

---

## 11. ERROR HANDLING

### 11.1 User Feedback
- [ ] Invalid inputs show clear error messages
- [ ] Operations that fail show error notifications
- [ ] Success messages confirm task operations
- [ ] Network errors (if applicable) show user-friendly messages

### 11.2 Data Integrity
- [ ] Prevent duplicate task IDs
- [ ] Prevent orphaned sub-tasks
- [ ] Validate all data before saving
- [ ] Handle concurrent edits gracefully (if applicable)

---

## Summary of Core Features

**Priority 1 (MVP - Must Have):**
- ✅ Create, Read, Edit, Delete tasks
- ✅ Add and display due dates
- ✅ Categorize tasks
- ✅ Track task completion percentage
- ✅ Sort tasks by due date
- ✅ Filter tasks by category

**Priority 2 (Should Have):**
- ✅ Sub-tasks/Task hierarchy
- ✅ Advanced sorting options
- ✅ Advanced filtering options
- ✅ Search functionality
- ✅ Task descriptions

**Priority 3 (Nice to Have):**
- ⭐ Drag-and-drop reordering
- ⭐ Task reminders/notifications
- ⭐ Priority levels
- ⭐ Recurring tasks
- ⭐ Export/Import functionality

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Ready for Implementation
