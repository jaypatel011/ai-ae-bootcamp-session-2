# TODO List Application - AI Bootcamp Session 2

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

A full-featured TODO list application built with React and Express.js, designed as a learning project for the GitHub Copilot AI Coding Assistant Enablement Bootcamp.

## 🎯 Project Overview

This project expands a basic item-management app into a **production-ready TODO list application** with Priority 1 and Priority 2 features split across phases.

**Current Status**: Phase 1 (MVP) - Core TODO functionality  
**Tech Stack**: React 18 + Express.js + SQLite + Jest

## 📚 Documentation & Planning

### For Developers

- **[DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md)** - 5-minute onboarding, tech stack overview, common commands
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Comprehensive technical roadmap with detailed specifications for Phase 1 and Phase 2
- **[PHASE_1_CHECKLIST.md](./PHASE_1_CHECKLIST.md)** - Task-by-task checklist for Phase 1 implementation (13 tasks across backend & frontend)

### Project Documentation

- **[docs/project-overview.md](./docs/project-overview.md)** - Project architecture and technology stack
- **[docs/functional-requirements.md](./docs/functional-requirements.md)** - Complete feature requirements organized by priority
- **[docs/todo-app-prd.md](./docs/todo-app-prd.md)** - Product requirements document with user stories
- **[docs/implementation-guide.md](./docs/implementation-guide.md)** - Technical implementation details and code examples
- **[docs/ui-guidelines.md](./docs/ui-guidelines.md)** - Glassmorphism design system and component specs
- **[docs/coding-guidelines.md](./docs/coding-guidelines.md)** - Code standards (indentation, naming, testing, error handling)
- **[docs/testing-guidelines.md](./docs/testing-guidelines.md)** - Testing principles and requirements

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ and npm v7+

### Installation
```bash
# Install dependencies for all packages (monorepo)
npm install

# Start both frontend and backend
npm run start

# Frontend will be at: http://localhost:3000
# Backend will be at: http://localhost:3030
```

### Development Commands
```bash
# Run tests
npm test

# Format code (if Prettier configured)
npm run format

# Check code quality (if ESLint configured)
npm run lint
```

## 📋 Phase 1 Implementation Roadmap

**Phase 1 (MVP)** focuses on Priority 1 features—core TODO functionality needed to reach MVP status:

### Backend (Tasks 1.1-1.6)
- ✅ SQLite data model with persistent storage
- ✅ Task CRUD REST API endpoints
- ✅ Input validation middleware
- ✅ Database schema with full Task fields
- ✅ Comprehensive API testing

### Frontend (Tasks 2.1-2.8)
- ✅ TaskManager utility (filtering, sorting, CRUD)
- ✅ Custom useTasks React hook (state management)
- ✅ UI components (TaskList, TaskItem, TaskDetail, QuickAdd, FilterBar)
- ✅ Glassmorphism styling with CSS variables
- ✅ Component and integration testing
- ✅ localStorage persistence

**Estimated Timeline**: 2-3 weeks for Phase 1 MVP  
**Success Criteria**: All Priority 1 features working, >80% test coverage, responsive design, WCAG AA accessibility

See [PHASE_1_CHECKLIST.md](./PHASE_1_CHECKLIST.md) for detailed task breakdown.

## 📦 Phase 2 Features (Priority 2)

To be implemented after Phase 1:
- Advanced sorting (by creation date, alphabetically, by category)
- Advanced filtering (date ranges: overdue, week, month)
- Real-time search (title and description)
- Sub-tasks with hierarchy and completion rollup
- Task descriptions

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for Phase 2 specifications.

## 🎨 Technology & Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend | React 18 | Component-based UI, hooks for state management |
| State | Custom Hook (useTasks) | Simple, focused state management for MVP |
| Persistence | localStorage + SQLite | Client caching + server data sync |
| Backend | Express.js | Lightweight, familiar Node.js framework |
| Database | SQLite | Persistent file-based storage, no server needed |
| Testing | Jest + React Testing Library | Comprehensive testing for both frontend and backend |
| Styling | CSS + Glassmorphism | Modern design system with glass effects and accessibility |

## 📝 Data Model

Each task has:
```javascript
{
  id: "uuid",
  title: "string (required, 1-255 chars)",
  description: "string (optional, 0-1000 chars)",
  dueDate: "ISO date or null",
  category: "Work|Personal|Shopping|Health|Finance|Education|Home|Other",
  status: "number (0-100, representing % complete)",
  parentTaskId: "uuid or null (for sub-tasks)",
  subTasks: "array of task IDs",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp",
  isCompleted: "boolean (derived from status === 100)"
}
```

## 🛠️ Code Standards

All code follows the standards defined in [docs/coding-guidelines.md](./docs/coding-guidelines.md):

- **Indentation**: 2 spaces (never tabs)
- **Naming**: camelCase for variables/functions, PascalCase for components, UPPER_SNAKE_CASE for constants
- **Files**: kebab-case for utilities, PascalCase for components
- **Testing**: Comprehensive tests required; Jest for both frontend and backend
- **Comments**: Explain "why", not "what"; use JSDoc for complex functions
- **Error Handling**: User-friendly error messages; proper HTTP status codes

## 👥 Getting Started as a Developer

1. **Read** [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) (5 minutes)
2. **Review** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed specs
3. **Pick a task** from [PHASE_1_CHECKLIST.md](./PHASE_1_CHECKLIST.md)
4. **Follow** [docs/coding-guidelines.md](./docs/coding-guidelines.md) for code standards
5. **Write tests** per [docs/testing-guidelines.md](./docs/testing-guidelines.md)
6. **Submit PR** with clear commit messages and task references

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific package tests
cd packages/frontend && npm test
cd packages/backend && npm test
```

**Target Coverage**: >80% for Phase 1

## 📁 Project Structure

```
ai-ae-bootcamp-session-2/
├── IMPLEMENTATION_PLAN.md        ← Phase 1 & 2 technical specs
├── PHASE_1_CHECKLIST.md          ← Task checklist for Phase 1
├── DEVELOPER_QUICK_START.md      ← 5-min onboarding guide
├── docs/
│   ├── project-overview.md
│   ├── functional-requirements.md
│   ├── implementation-guide.md
│   ├── ui-guidelines.md
│   ├── coding-guidelines.md
│   └── testing-guidelines.md
└── packages/
    ├── frontend/                 ← React app (port 3000)
    │   ├── src/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── utils/
    │   │   └── __tests__/
    │   └── package.json
    └── backend/                  ← Express API (port 3030)
        ├── src/
        │   ├── models/
        │   ├── controllers/
        │   ├── middleware/
        │   └── utils/
        ├── __tests__/
        ├── data/                 ← SQLite database storage
        └── package.json
```

## 🎓 Learning Objectives

This bootcamp exercise teaches:
- Full-stack JavaScript application development
- Monorepo structure with npm workspaces
- React hooks and component design patterns
- RESTful API design with Express
- Database design and persistence with SQLite
- Comprehensive testing (unit, integration, component tests)
- Glassmorphism design system and accessibility (WCAG AA)
- Git workflow and PR collaboration

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Jest Testing](https://jestjs.io)
- [MDN Web Docs](https://developer.mozilla.org)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/task-name`
2. Follow [docs/coding-guidelines.md](./docs/coding-guidelines.md)
3. Write comprehensive tests
4. Commit with clear messages: `git commit -m "feat: implement task CRUD"`
5. Push and create a PR referencing this plan

## 📄 License

MIT License &copy; 2025 GitHub

---

**Start Here**: Read [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) to get started in 5 minutes!

