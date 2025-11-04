/**
 * TaskManager utility tests
 */

import { TaskManager } from '../../utils/task-manager';

describe('TaskManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('createTask', () => {
    test('creates a task with required fields', () => {
      const task = TaskManager.createTask('Test Task');
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe(0);
      expect(task.category).toBe('Other');
      expect(task.id).toBeTruthy();
      expect(task.createdAt).toBeTruthy();
      expect(task.updatedAt).toBeTruthy();
    });

    test('creates a task with options', () => {
      const task = TaskManager.createTask('Test Task', {
        category: 'Work',
        status: 50,
        dueDate: '2025-11-10',
      });
      expect(task.title).toBe('Test Task');
      expect(task.category).toBe('Work');
      expect(task.status).toBe(50);
      expect(task.dueDate).toBe('2025-11-10');
    });

    test('throws error when title is empty', () => {
      expect(() => TaskManager.createTask('')).toThrow('Task title is required');
      expect(() => TaskManager.createTask('   ')).toThrow('Task title is required');
    });

    test('throws error when title is too long', () => {
      const longTitle = 'a'.repeat(256);
      expect(() => TaskManager.createTask(longTitle)).toThrow('Task title must be 255 characters or less');
    });
  });

  describe('validateTask', () => {
    test('validates a correct task', () => {
      const task = TaskManager.createTask('Valid Task');
      expect(TaskManager.validateTask(task)).toBeNull();
    });

    test('returns error for empty title', () => {
      const task = { ...TaskManager.createTask('Test'), title: '' };
      expect(TaskManager.validateTask(task)).toBeTruthy();
    });

    test('returns error for invalid category', () => {
      const task = { ...TaskManager.createTask('Test'), category: 'Invalid' };
      expect(TaskManager.validateTask(task)).toBeTruthy();
    });

    test('returns error for invalid status', () => {
      const task = { ...TaskManager.createTask('Test'), status: 150 };
      expect(TaskManager.validateTask(task)).toBeTruthy();
    });
  });

  describe('localStorage operations', () => {
    test('saves and loads tasks', () => {
      const tasks = [TaskManager.createTask('Task 1'), TaskManager.createTask('Task 2')];
      TaskManager.saveTasks(tasks);

      const loaded = TaskManager.loadTasks();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].title).toBe('Task 1');
      expect(loaded[1].title).toBe('Task 2');
    });

    test('loads empty array when no tasks stored', () => {
      const loaded = TaskManager.loadTasks();
      expect(loaded).toEqual([]);
    });
  });

  describe('filterTasks', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        TaskManager.createTask('Work Task', { category: 'Work', status: 100 }),
        TaskManager.createTask('Personal Task', { category: 'Personal', status: 50 }),
        TaskManager.createTask('Shopping Task', { category: 'Shopping', status: 0 }),
      ];
      // Add sub-task
      tasks.push(TaskManager.createTask('Sub Task', { parentTaskId: tasks[0].id }));
    });

    test('filters by category', () => {
      const filtered = TaskManager.filterTasks(tasks, { category: 'Work' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('Work');
    });

    test('filters out sub-tasks from main list', () => {
      const filtered = TaskManager.filterTasks(tasks, {});
      expect(filtered).toHaveLength(3); // Only parent tasks
      expect(filtered.every((t) => !t.parentTaskId)).toBe(true);
    });

    test('filters by status', () => {
      const completed = TaskManager.filterTasks(tasks, { status: 'completed' });
      expect(completed).toHaveLength(1);
      expect(completed[0].status).toBe(100);

      const incomplete = TaskManager.filterTasks(tasks, { status: 'incomplete' });
      expect(incomplete).toHaveLength(2);
    });

    test('filters by search query', () => {
      const filtered = TaskManager.filterTasks(tasks, { searchQuery: 'Work' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Work Task');
    });
  });

  describe('sortTasks', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        TaskManager.createTask('Zebra Task', {
          dueDate: '2025-11-20',
          createdAt: new Date(2025, 10, 4, 10).toISOString(),
        }),
        TaskManager.createTask('Apple Task', {
          dueDate: '2025-11-10',
          createdAt: new Date(2025, 10, 4, 11).toISOString(),
        }),
        TaskManager.createTask('Banana Task', {
          dueDate: '2025-11-15',
          createdAt: new Date(2025, 10, 4, 9).toISOString(),
        }),
      ];
    });

    test('sorts by due date ascending', () => {
      const sorted = TaskManager.sortTasks(tasks, 'dueDate-asc');
      expect(sorted[0].title).toBe('Apple Task');
      expect(sorted[1].title).toBe('Banana Task');
      expect(sorted[2].title).toBe('Zebra Task');
    });

    test('sorts by title ascending', () => {
      const sorted = TaskManager.sortTasks(tasks, 'title-asc');
      expect(sorted[0].title).toBe('Apple Task');
      expect(sorted[1].title).toBe('Banana Task');
      expect(sorted[2].title).toBe('Zebra Task');
    });

    test('sorts by creation date descending', () => {
      const sorted = TaskManager.sortTasks(tasks, 'createdAt-desc');
      expect(sorted[0].title).toBe('Apple Task');
      expect(sorted[1].title).toBe('Zebra Task');
      expect(sorted[2].title).toBe('Banana Task');
    });
  });

  describe('sub-task operations', () => {
    let parentTask, subTask1, subTask2;

    beforeEach(() => {
      parentTask = TaskManager.createTask('Parent Task');
      subTask1 = TaskManager.createTask('Sub Task 1', { parentTaskId: parentTask.id, status: 100 });
      subTask2 = TaskManager.createTask('Sub Task 2', { parentTaskId: parentTask.id, status: 50 });
    });

    test('gets sub-tasks for a parent', () => {
      const allTasks = [parentTask, subTask1, subTask2];
      const subTasks = TaskManager.getSubTasks(allTasks, parentTask.id);
      expect(subTasks).toHaveLength(2);
      expect(subTasks.every((t) => t.parentTaskId === parentTask.id)).toBe(true);
    });

    test('calculates parent task status', () => {
      const allTasks = [parentTask, subTask1, subTask2];
      const status = TaskManager.calculateParentTaskStatus(allTasks, parentTask.id);
      expect(status).toBe(75); // Average of 100 and 50
    });

    test('returns null when no sub-tasks', () => {
      const allTasks = [parentTask];
      const status = TaskManager.calculateParentTaskStatus(allTasks, parentTask.id);
      expect(status).toBeNull();
    });
  });

  describe('utility methods', () => {
    test('checks if task is completed', () => {
      const completed = TaskManager.createTask('Task', { status: 100 });
      const incomplete = TaskManager.createTask('Task', { status: 50 });
      expect(TaskManager.isCompleted(completed)).toBe(true);
      expect(TaskManager.isCompleted(incomplete)).toBe(false);
    });

    test('gets status label', () => {
      expect(TaskManager.getStatusLabel(0)).toBe('Not Started');
      expect(TaskManager.getStatusLabel(25)).toBe('In Progress');
      expect(TaskManager.getStatusLabel(50)).toBe('Half Done');
      expect(TaskManager.getStatusLabel(75)).toBe('Almost Done');
      expect(TaskManager.getStatusLabel(100)).toBe('Complete');
      expect(TaskManager.getStatusLabel(33)).toBe('33%');
    });

    test('validates task with missing title', () => {
      const taskWithoutTitle = { title: '' };
      expect(TaskManager.validateTask(taskWithoutTitle)).toBe('Task title is required');
    });

    test('validates task with very long title', () => {
      const taskWithLongTitle = { title: 'a'.repeat(300) };
      expect(TaskManager.validateTask(taskWithLongTitle)).toContain('255 characters');
    });

    test('validates task with long description', () => {
      const taskWithLongDesc = { title: 'Test', description: 'a'.repeat(1500) };
      expect(TaskManager.validateTask(taskWithLongDesc)).toContain('1000 characters');
    });

    test('validates task with invalid category', () => {
      const taskWithInvalidCat = { title: 'Test', category: 'InvalidCategory' };
      expect(TaskManager.validateTask(taskWithInvalidCat)).toContain('Category must be one of');
    });

    test('validates task with invalid status value', () => {
      const taskWithInvalidStatus = { title: 'Test', category: 'Work', status: 150 };
      expect(TaskManager.validateTask(taskWithInvalidStatus)).toContain('0 and 100');

      const taskWithNegativeStatus = { title: 'Test', category: 'Work', status: -10 };
      expect(TaskManager.validateTask(taskWithNegativeStatus)).toContain('0 and 100');
    });

    test('validates task with invalid due date format', () => {
      const taskWithInvalidDate = { title: 'Test', category: 'Work', status: 50, dueDate: '11-10-2025' };
      expect(TaskManager.validateTask(taskWithInvalidDate)).toContain('YYYY-MM-DD');
    });

    test('validates task with valid inputs', () => {
      const validTask = {
        title: 'Test Task',
        description: 'Valid description',
        dueDate: '2025-12-15',
        category: 'Work',
        status: 50
      };
      expect(TaskManager.validateTask(validTask)).toBeNull();
    });

    test('handles getSubTasks with no sub-tasks', () => {
      const task = TaskManager.createTask('Parent Task');
      const subTasks = TaskManager.getSubTasks([task], task.id);
      expect(subTasks).toEqual([]);
    });

    test('calculates correct parent task status from sub-tasks', () => {
      const parentTask = TaskManager.createTask('Parent', { status: 0 });
      const subTask1 = TaskManager.createTask('Sub 1', { status: 50, parentTaskId: parentTask.id });
      const subTask2 = TaskManager.createTask('Sub 2', { status: 100, parentTaskId: parentTask.id });
      
      const avgStatus = TaskManager.calculateParentTaskStatus([parentTask, subTask1, subTask2], parentTask.id);
      expect(avgStatus).toBe(75); // (50 + 100) / 2 = 75
    });

    test('gets correct status label for all percentages', () => {
      expect(TaskManager.getStatusLabel(0)).toBe('Not Started');
      expect(TaskManager.getStatusLabel(25)).toBe('In Progress');
      expect(TaskManager.getStatusLabel(50)).toBe('Half Done');
      expect(TaskManager.getStatusLabel(75)).toBe('Almost Done');
      expect(TaskManager.getStatusLabel(100)).toBe('Complete');
      expect(TaskManager.getStatusLabel(99)).toBe('99%');
    });
  });
});
