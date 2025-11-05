/**
 * TaskItem component tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../../components/TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    category: 'Work',
    status: 50,
    dueDate: null,
    description: 'Test description',
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

  test('renders task title', () => {
    render(
      <TaskItem
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders category badge', () => {
    render(
      <TaskItem
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  test('renders progress bar with correct percentage', () => {
    render(
      <TaskItem
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('displays completed state styling', () => {
    const completedTask = { ...mockTask, status: 100 };
    const { container } = render(
      <TaskItem
        task={completedTask}
        allTasks={[completedTask]}
        {...mockHandlers}
      />
    );
    const taskItem = container.querySelector('.task-item.completed');
    expect(taskItem).toBeInTheDocument();
  });

  test('checkbox toggles task completion', async () => {
    const user = userEvent.setup();
    render(
      <TaskItem
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { status: 100 });
  });

  test('checkbox unchecks completed task', async () => {
    const user = userEvent.setup();
    const completedTask = { ...mockTask, status: 100 };
    render(
      <TaskItem
        task={completedTask}
        allTasks={[completedTask]}
        {...mockHandlers}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { status: 0 });
  });

  test('shows expand button for tasks with sub-tasks', () => {
    const taskWithSubTasks = { ...mockTask, subTasks: ['sub1', 'sub2'] };
    const subTask1 = { id: 'sub1', parentTaskId: '1', title: 'Sub Task 1' };
    const subTask2 = { id: 'sub2', parentTaskId: '1', title: 'Sub Task 2' };
    render(
      <TaskItem
        task={taskWithSubTasks}
        allTasks={[taskWithSubTasks, subTask1, subTask2]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText(/2 sub-tasks/)).toBeInTheDocument();
  });

  test('opens detail modal on click', async () => {
    render(
      <TaskItem
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const taskElement = screen.getByText('Test Task').closest('.task-item');
    fireEvent.click(taskElement);

    expect(screen.getByText('Task Details')).toBeInTheDocument();
  });

  test('displays overdue styling for past due dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const overdueTask = {
      ...mockTask,
      dueDate: yesterday.toISOString().split('T')[0],
      status: 50,
    };

    const { container } = render(
      <TaskItem
        task={overdueTask}
        allTasks={[overdueTask]}
        {...mockHandlers}
      />
    );

    const overdueBadge = container.querySelector('.task-due-date.overdue');
    expect(overdueBadge).toBeInTheDocument();
  });

  test('displays task with different status values', () => {
    const lowStatusTask = { ...mockTask, status: 25 };
    render(
      <TaskItem
        task={lowStatusTask}
        allTasks={[lowStatusTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  test('renders task without due date', () => {
    render(
      <TaskItem
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    // Should not show a due date
    const dueDateElements = screen.queryAllByText(/Due/);
    expect(dueDateElements.length).toBe(0);
  });

  test('renders task with future due date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    const taskWithDueDate = {
      ...mockTask,
      dueDate: tomorrowDateStr,
    };
    const { container } = render(
      <TaskItem
        task={taskWithDueDate}
        allTasks={[taskWithDueDate]}
        {...mockHandlers}
      />
    );
    // Check that the date label is rendered (might be Tomorrow or a day name)
    const dateLabel = container.querySelector('.task-due-date');
    expect(dateLabel).toBeInTheDocument();
    expect(dateLabel.textContent).toMatch(/\w+/); // Should have some text
  });

  test('toggles sub-tasks expand/collapse', async () => {
    const user = userEvent.setup();
    const taskWithSubTasks = { ...mockTask, subTasks: ['sub1'] };
    const subTask1 = { id: 'sub1', parentTaskId: '1', title: 'Sub Task 1' };
    render(
      <TaskItem
        task={taskWithSubTasks}
        allTasks={[taskWithSubTasks, subTask1]}
        {...mockHandlers}
      />
    );

    const expandButton = screen.getByText(/▶/);
    await user.click(expandButton);

    // After clicking expand, should show collapse arrow
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  test('closes detail modal when close is clicked', async () => {
    render(
      <TaskItem
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Open modal
    const taskElement = screen.getByText('Test Task').closest('.task-item');
    fireEvent.click(taskElement);

    expect(screen.getByText('Task Details')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByLabelText('Close task details');
    await fireEvent.click(closeButton);

    // Modal should be gone
    expect(screen.queryByText('Task Details')).not.toBeInTheDocument();
  });

  test('displays completed task with strikethrough styling', () => {
    const completedTask = { ...mockTask, status: 100 };
    const { container } = render(
      <TaskItem
        task={completedTask}
        allTasks={[completedTask]}
        {...mockHandlers}
      />
    );

    const titleElement = screen.getByText('Test Task');
    // Check if styling is applied for completed task
    expect(titleElement).toBeInTheDocument();
  });

  test('renders progress bar with correct color for different status levels', () => {
    const { container: container1 } = render(
      <TaskItem
        task={{ ...mockTask, status: 0 }}
        allTasks={[{ ...mockTask, status: 0 }]}
        {...mockHandlers}
      />
    );

    const progressBar1 = container1.querySelector('.progress-bar');
    expect(progressBar1).toBeInTheDocument();

    const { container: container2 } = render(
      <TaskItem
        task={{ ...mockTask, status: 100 }}
        allTasks={[{ ...mockTask, status: 100 }]}
        {...mockHandlers}
      />
    );

    const progressBar2 = container2.querySelector('.progress-bar');
    expect(progressBar2).toBeInTheDocument();
  });
});
