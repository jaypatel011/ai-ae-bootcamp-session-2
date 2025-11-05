/**
 * TaskList component tests
 */

import { render, screen } from '@testing-library/react';
import TaskList from '../../components/TaskList';

describe('TaskList Component', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    category: 'Work',
    status: 50,
    dueDate: null,
    description: '',
    parentTaskId: null,
    subTasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockHandlers = {
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onAddSubTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task list container', () => {
    const { container } = render(
      <TaskList
        tasks={[]}
        allTasks={[]}
        {...mockHandlers}
      />
    );
    expect(container.querySelector('.task-list')).toBeInTheDocument();
  });

  test('renders no tasks message when empty', () => {
    render(
      <TaskList
        tasks={[]}
        allTasks={[]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  test('renders task items', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders multiple task items', () => {
    const task2 = { ...mockTask, id: '2', title: 'Second Task' };
    render(
      <TaskList
        tasks={[mockTask, task2]}
        allTasks={[mockTask, task2]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
  });

  test('passes handlers to task items', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('displays task categories', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  test('displays task progress', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('handles different task statuses', () => {
    const completedTask = { ...mockTask, status: 100 };
    const { container } = render(
      <TaskList
        tasks={[completedTask]}
        allTasks={[completedTask]}
        {...mockHandlers}
      />
    );
    expect(container.querySelector('.task-item.completed')).toBeInTheDocument();
  });

  test('renders tasks with different categories', () => {
    const task2 = { ...mockTask, id: '2', category: 'Personal', title: 'Personal Task' };
    render(
      <TaskList
        tasks={[mockTask, task2]}
        allTasks={[mockTask, task2]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  test('renders task list with many items', () => {
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      ...mockTask,
      id: `${i}`,
      title: `Task ${i}`,
    }));

    const { container } = render(
      <TaskList
        tasks={tasks}
        allTasks={tasks}
        {...mockHandlers}
      />
    );

    expect(container.querySelectorAll('.task-item').length).toBe(10);
  });

  test('renders filtered task list', () => {
    const task2 = { ...mockTask, id: '2', title: 'Another Task' };
    const filteredTasks = [mockTask]; // Only show first task

    render(
      <TaskList
        tasks={filteredTasks}
        allTasks={[mockTask, task2]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Another Task')).not.toBeInTheDocument();
  });
});

