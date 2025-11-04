# Coding Guidelines

This document outlines the coding standards and best practices for the TODO List application. All contributors should follow these guidelines to maintain code quality, consistency, and readability across the monorepo.

---

## 1. General Formatting

### Indentation & Spacing
- Use **2 spaces** for indentation (not tabs)
- Use **4 spaces** for continuation lines in logical expressions
- Add one blank line between functions/methods
- Add two blank lines between class definitions or major sections
- Remove trailing whitespace

### Naming Conventions

#### Variables & Functions
- Use **camelCase** for variables and functions: `taskTitle`, `calculateStatus()`, `isCompleted`
- Use **PascalCase** for classes and React components: `TaskManager`, `TaskItem`, `App`
- Use **UPPER_SNAKE_CASE** for constants: `MAX_TITLE_LENGTH`, `API_BASE_URL`, `STORAGE_KEY`
- Use descriptive names that clearly indicate purpose: `getUserTasks()` not `getU()`, `taskDueDate` not `td`
- Avoid single-letter variable names except for loop counters (`i`, `j`) in short loops

#### Files & Directories
- Use **kebab-case** for file names: `task-manager.js`, `task-item.jsx`, `date-utils.js`
- Use **kebab-case** for directory names: `src/utils/`, `src/components/`
- Component files should match component name: `TaskItem.jsx` for component `TaskItem`
- Test files should follow pattern: `component.test.js` or `__tests__/component.test.js`

### File Organization
- Keep files focused on a single responsibility
- Group related functions/classes in the same file
- Place imports at the top
- Place exports at the bottom or inline with declarations
- Add file-level comments for complex files (purpose, main exports)

Example file structure:
```javascript
// imports
import React from 'react';
import { getRelativeDateLabel } from '../utils/dateUtils';

// constants
const PREDEFINED_STATUS = [0, 25, 50, 75, 100];

// component/function
const TaskItem = ({ task, onUpdate }) => {
  // implementation
};

// exports
export default TaskItem;
```

---

## 2. Import Organization

### Frontend (ES6 Modules)

Use ES6 `import`/`export` syntax throughout the frontend:

```javascript
// 1. React and third-party libraries first
import React, { useState, useEffect } from 'react';
import { getRelativeDateLabel } from 'date-fns';

// 2. Internal utilities and hooks
import { TaskManager } from '../utils/taskManager';
import { useTasks } from '../hooks/useTasks';

// 3. Components
import TaskList from './TaskList';
import FilterBar from './FilterBar';

// 4. Styles (last)
import './App.css';
```

Export patterns:
```javascript
// Named exports for utilities
export const calculateTaskStatus = (tasks) => { /* ... */ };
export const filterTasks = (tasks, filters) => { /* ... */ };

// Default export for components
const TaskItem = ({ task }) => { /* ... */ };
export default TaskItem;
```

### Backend (CommonJS)

Use CommonJS `require`/`module.exports` syntax for backend (Node.js):

```javascript
// 1. Built-in Node modules first
const express = require('express');
const cors = require('cors');

// 2. Third-party dependencies
const morgan = require('morgan');
const Database = require('better-sqlite3');

// 3. Local modules
const taskController = require('./controllers/taskController');
const { validateTask } = require('./middleware/validation');

// 4. Create/configure exports
const app = express();
app.use(cors());

module.exports = app;
```

### Import Best Practices
- Avoid circular dependencies: organize code hierarchically (utils → hooks/controllers → components/routes)
- Use destructuring for cleaner syntax: `const { createTask, deleteTask } = TaskManager;`
- Import only what you need: `import { useState } from 'react';` not `import * as React`
- Use absolute imports for better readability (configure in `jsconfig.json` or `tsconfig.json`)

---

## 3. Linting & Formatting

### Current Setup

**Frontend:** ESLint via `react-scripts` (extends `react-app` and `react-app/jest`)
**Backend:** No ESLint configured (recommended: add `eslint:recommended`)

### Configuring ESLint (Backend)

1. **Install ESLint and recommended config:**
   ```bash
   cd packages/backend
   npm install --save-dev eslint eslint-config-recommended
   ```

2. **Create `.eslintrc.json` in `packages/backend/`:**
   ```json
   {
     "env": {
       "node": true,
       "es2021": true,
       "jest": true
     },
     "extends": "eslint:recommended",
     "parserOptions": {
       "ecmaVersion": "latest",
       "sourceType": "module"
     },
     "rules": {
       "indent": ["error", 2],
       "linebreak-style": ["error", "unix"],
       "quotes": ["error", "single", { "avoidEscape": true }],
       "semi": ["error", "always"],
       "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
       "no-console": "off",
       "prefer-const": "error"
     }
   }
   ```

3. **Add lint script to `packages/backend/package.json`:**
   ```json
   "scripts": {
     "lint": "eslint src/",
     "lint:fix": "eslint src/ --fix"
   }
   ```

4. **Run linting:**
   ```bash
   npm run lint          # Check for issues
   npm run lint:fix      # Automatically fix issues
   ```

### Configuring Prettier (Code Formatter)

1. **Install Prettier:**
   ```bash
   npm install --save-dev prettier
   ```

2. **Create `.prettierrc.json` in root:**
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "es5",
     "printWidth": 100,
     "tabWidth": 2,
     "useTabs": false,
     "arrowParens": "always",
     "bracketSpacing": true
   }
   ```

3. **Create `.prettierignore` in root:**
   ```
   node_modules/
   coverage/
   dist/
   build/
   .cache/
   ```

4. **Add format scripts to root `package.json`:**
   ```json
   "scripts": {
     "format": "prettier --write .",
     "format:check": "prettier --check ."
   }
   ```

5. **Run formatter:**
   ```bash
   npm run format        # Format all files
   npm run format:check  # Check formatting without modifying
   ```

### Pre-commit Hooks (Optional)

To enforce linting and formatting before commits:

1. **Install husky and lint-staged:**
   ```bash
   npm install --save-dev husky lint-staged
   npx husky install
   ```

2. **Add to root `package.json`:**
   ```json
   "lint-staged": {
     "*.js": ["eslint --fix", "prettier --write"],
     "*.jsx": ["eslint --fix", "prettier --write"],
     "*.css": ["prettier --write"]
   }
   ```

3. **Create pre-commit hook:**
   ```bash
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

### Linting Checks (CI/CD)

Add to your CI workflow to fail builds with linting errors:

```bash
npm run lint
npm run format:check
```

---

## 4. Testing Conventions

All code must include appropriate tests. Refer to [Testing Guidelines](testing-guidelines.md) for detailed requirements.

### Frontend Testing (React Testing Library + Jest)

- Location: `src/__tests__/*.test.js` or `src/components/__tests__/ComponentName.test.js`
- Test each component and utility function in isolation
- Use Mock Service Worker (MSW) for API mocking
- Reference: [example frontend tests](../packages/frontend/src/__tests__/App.test.js)

Example pattern:
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../TaskItem';

describe('TaskItem', () => {
  it('should display task title', () => {
    const task = { id: '1', title: 'Test Task', status: 0 };
    render(<TaskItem task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should call onUpdate when status changes', async () => {
    const handleUpdate = jest.fn();
    const task = { id: '1', title: 'Test', status: 0 };
    const user = userEvent.setup();
    
    render(<TaskItem task={task} onUpdate={handleUpdate} />);
    await user.click(screen.getByRole('button', { name: /complete/i }));
    
    expect(handleUpdate).toHaveBeenCalledWith('1', { status: 100 });
  });
});
```

### Backend Testing (Jest + Supertest)

- Location: `__tests__/*.test.js`
- Test each API endpoint and controller function
- Use `supertest` for HTTP assertions
- Reference: [example backend tests](../packages/backend/__tests__/app.test.js)

Example pattern:
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Task API', () => {
  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/tasks');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'New Task' });
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Task');
    });
  });
});
```

---

## 5. Best Practices

### DRY Principle (Don't Repeat Yourself)

Extract common logic into reusable functions and components:

**Don't:**
```javascript
// Repeated in multiple files
const today = new Date();
today.setHours(0, 0, 0, 0);
const isToday = taskDate.getTime() === today.getTime();

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const isTomorrow = taskDate.getTime() === tomorrow.getTime();
```

**Do:**
```javascript
// In utils/dateUtils.js
export const isToday = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
};

export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return date.getTime() === tomorrow.getTime();
};

// Usage in components
import { isToday, isTomorrow } from '../utils/dateUtils';
```

### Error Handling

**Frontend:** Display user-friendly error messages and handle loading states:
```javascript
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

const handleCreateTask = async (title) => {
  setLoading(true);
  setError(null);
  try {
    await TaskManager.createTask(title);
  } catch (err) {
    setError('Failed to create task. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Backend:** Use meaningful HTTP status codes and descriptive error messages:
```javascript
// Good error response
res.status(400).json({ 
  error: 'Task title is required',
  code: 'INVALID_TITLE'
});

// Use appropriate status codes
200 - Success
201 - Created
400 - Bad Request (invalid input)
404 - Not Found
500 - Server Error (log details internally)
```

### Async/Await Usage

Always use `async`/`await` for asynchronous operations (avoid callback chains):

**Don't:**
```javascript
fetch('/api/tasks')
  .then(res => res.json())
  .then(data => setTasks(data))
  .catch(err => console.error(err));
```

**Do:**
```javascript
const fetchTasks = async () => {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    setTasks(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    setError(error.message);
  }
};
```

### Input Validation

Validate all inputs on both frontend and backend:

**Frontend:**
```javascript
const validateTaskTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return 'Task title is required';
  }
  if (title.length > 255) {
    return 'Task title must be 255 characters or less';
  }
  return null;
};
```

**Backend:**
```javascript
const validateTask = (req, res, next) => {
  const { title, category, status } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  if (!['Work', 'Personal', 'Shopping'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  
  if (typeof status !== 'number' || status < 0 || status > 100) {
    return res.status(400).json({ error: 'Status must be 0-100' });
  }
  
  next();
};
```

### Code Comments & Documentation

- Add comments only for **why**, not **what** (code should be self-documenting)
- Use JSDoc for functions and components with complex parameters
- Keep comments up-to-date when code changes

**Don't:**
```javascript
// Increment i
i++;
```

**Do:**
```javascript
/**
 * Calculates average completion percentage of all sub-tasks
 * @param {Array<Task>} tasks - All tasks
 * @param {string} parentTaskId - Parent task ID
 * @returns {number} Average percentage (0-100)
 */
const calculateParentTaskStatus = (tasks, parentTaskId) => {
  const subTasks = tasks.filter(t => t.parentTaskId === parentTaskId);
  if (subTasks.length === 0) return null;
  return Math.round(
    subTasks.reduce((sum, task) => sum + task.status, 0) / subTasks.length
  );
};
```

### Performance Considerations

- Use React hooks (`useMemo`, `useCallback`) to prevent unnecessary re-renders
- Avoid storing large objects in state; use refs if needed
- Debounce search and filter operations
- Lazy load components when appropriate
- Minimize bundle size by tree-shaking unused imports

### Accessibility

- Use semantic HTML: `<button>`, `<label>`, `<input>` instead of divs
- Add ARIA labels to interactive elements: `aria-label="Create task"`
- Ensure sufficient color contrast (WCAG AA: 4.5:1 for text)
- Support keyboard navigation (Tab, Enter, Escape)
- Reference: [UI Guidelines](ui-guidelines.md) for detailed accessibility requirements

---

## 6. Related Documentation

For deeper guidance on specific topics, refer to:

- **[Testing Guidelines](testing-guidelines.md)** - Comprehensive testing requirements and patterns
- **[ReactJS Instructions](../.github/instructions/reactjs.instructions.md)** - React architecture and component design patterns
- **[UI Guidelines](ui-guidelines.md)** - Design system, styling, and accessibility standards
- **[Implementation Guide](implementation-guide.md)** - Code structure and technical architecture

---

## 7. Quick Reference: Common Commands

```bash
# Linting
npm run lint          # Check for errors (backend)
npm run lint:fix      # Auto-fix linting issues (backend)

# Formatting
npm run format        # Format all code
npm run format:check  # Check formatting without modifying

# Testing
npm test              # Run all tests
npm test -- --coverage  # Run tests with coverage report

# Running the app
npm run start         # Start frontend and backend concurrently
```

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Ready for Use
