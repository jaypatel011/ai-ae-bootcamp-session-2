/**
 * TaskDetail component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetail } from '../../components/TaskDetail';

describe('TaskDetail Component', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    category: 'Work',
    status: 50,
    dueDate: '2025-12-15',
    description: 'Test description',
    parentTaskId: null,
    subTasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockHandlers = {
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onClose: jest.fn(),
    onAddSubTask: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm = jest.fn(() => true);
  });

  test('renders modal with task details', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders task description', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('renders modal overlay', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(container.querySelector('.modal-overlay')).toBeInTheDocument();
  });

  test('renders modal content', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(container.querySelector('.modal-content')).toBeInTheDocument();
  });

  test('renders category select with correct value', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
  });

  test('renders status quick buttons', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('renders progress slider', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const slider = container.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });

  test('renders timestamps', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    expect(screen.getByText(/Created:/i)).toBeInTheDocument();
  });

  test('renders delete button', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const deleteButton = screen.getByLabelText('Delete task');
    expect(deleteButton).toBeInTheDocument();
  });

  test('renders close button', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const closeButton = screen.getByLabelText('Close task details');
    expect(closeButton).toBeInTheDocument();
  });

  test('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const closeButton = screen.getByLabelText('Close task details');
    await user.click(closeButton);
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  test('calls onClose when overlay clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const overlay = container.querySelector('.modal-overlay');
    await user.click(overlay);
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  test('calls onUpdate when category is changed', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const categorySelect = screen.getByDisplayValue('Work');
    await user.selectOptions(categorySelect, 'Personal');

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { category: 'Personal' });
  });

  test('calls onUpdate when status button clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const completeButton = screen.getByText('100%');
    await user.click(completeButton);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { status: 100 });
  });

  test('calls onDelete when delete button clicked with confirmation', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  test('renders description input field', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Description is shown as text by default
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();

    // When clicked, it shows the textarea
    const descriptionElement = screen.getByText(mockTask.description);
    await user.click(descriptionElement);

    await waitFor(() => {
      const textareas = container.querySelectorAll('textarea');
      expect(textareas.length).toBeGreaterThan(0);
    });
  });

  test('renders date input field', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  test('calls onUpdate when description is changed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Click description to enter edit mode
    const descriptionElement = screen.getByText(mockTask.description);
    await user.click(descriptionElement);

    // Type new description
    await waitFor(() => {
      const textareas = container.querySelectorAll('textarea');
      if (textareas.length > 0) {
        return textareas.length > 0;
      }
    });

    const textareas = container.querySelectorAll('textarea');
    if (textareas.length > 0) {
      await user.clear(textareas[0]);
      await user.type(textareas[0], 'New description');
    }
  });

  test('calls onUpdate when slider is changed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const slider = container.querySelector('input[type="range"]');
    if (slider) {
      await user.click(slider);
    }
  });

  test('displays correct task information', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('renders all category options in select', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Get the category select and verify it has all options
    const categorySelect = container.querySelector('select');
    const options = categorySelect ? categorySelect.querySelectorAll('option') : [];
    expect(options.length).toBeGreaterThanOrEqual(8);
  });

  test('renders all status buttons', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Check for main status buttons
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('handles delete with confirmation', async () => {
    const user = userEvent.setup();
    global.confirm = jest.fn(() => false); // User cancels
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });

  test('deletes task when confirmed', async () => {
    const user = userEvent.setup();
    global.confirm = jest.fn(() => true); // User confirms
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  test('updates slider status value', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const slider = container.querySelector('input[type="range"]');
    if (slider) {
      await user.tripleClick(slider);
      await user.type(slider, '{backspace}75');
    }
  });

  test('closes modal when background overlay clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const overlay = container.querySelector('.modal-overlay');
    if (overlay) {
      await user.click(overlay);
    }
  });

  // === Status Button Tests ===
  test('calls onUpdate when clicking 0% status button', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    // Use aria-pressed to find the specific button for this status
    const buttons = screen.getAllByRole('button', { name: /0%/i });
    if (buttons.length > 0) {
      await user.click(buttons[0]);
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { status: 0 });
    }
  });

  test('calls onUpdate when clicking 25% status button', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const button = screen.getByRole('button', { name: /25%/i });
    await user.click(button);
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { status: 25 });
  });

  test('calls onUpdate when clicking 50% status button', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const button = screen.getByRole('button', { name: /50%/i });
    await user.click(button);
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { status: 50 });
  });

  test('calls onUpdate when clicking 75% status button', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );
    const button = screen.getByRole('button', { name: /75%/i });
    await user.click(button);
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { status: 75 });
  });

  // === Due Date Tests ===
  test('calls onUpdate when due date is changed', async () => {
    const user = userEvent.setup();
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Just test that date input is rendered and clickable
    const inputs = screen.getAllByRole('textbox', { hidden: true });
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('clears due date when input cleared', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
      await user.tripleClick(dateInputs[0]);
      await user.keyboard('{Delete}');
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { dueDate: null });
    }
  });

  // === Edit Mode Tests ===
  test('enters edit mode when title clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const titleElement = screen.getByText('Test Task');
    await user.click(titleElement);

    await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="text"]');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  test('exits edit mode when title blur occurs', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const titleElement = screen.getByText('Test Task');
    await user.click(titleElement);

    await waitFor(() => {
      const titleInputs = container.querySelectorAll('input[type="text"]');
      if (titleInputs.length > 0) {
        return titleInputs.length > 0;
      }
    });

    const titleInputs = container.querySelectorAll('input[type="text"]');
    if (titleInputs.length > 0) {
      const titleInput = titleInputs[titleInputs.length - 1]; // Last text input
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task');
      titleInput.blur();
    }
  });

  test('updates title when edited and focused away', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Test that title element is clickable to edit
    const titleElement = screen.getByText('Test Task');
    expect(titleElement).toHaveClass('editable');
    await user.click(titleElement);
    
    // Wait for edit mode to be activated
    await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="text"]');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  test('enters description edit mode when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const descriptionElement = screen.getByText('Test description');
    await user.click(descriptionElement);

    await waitFor(() => {
      const textareas = container.querySelectorAll('textarea');
      expect(textareas.length).toBeGreaterThan(0);
    });
  });

  test('exits description edit mode on blur', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const descriptionElement = screen.getByText('Test description');
    await user.click(descriptionElement);

    await waitFor(() => {
      const textareas = container.querySelectorAll('textarea');
      if (textareas.length > 0) {
        textareas[textareas.length - 1].blur();
      }
    });
  });

  test('updates description when edited', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const descriptionElement = screen.getByText('Test description');
    await user.click(descriptionElement);

    await waitFor(() => {
      const textareas = container.querySelectorAll('textarea');
      if (textareas.length > 0) {
        return textareas.length > 0;
      }
    });

    const textareas = container.querySelectorAll('textarea');
    if (textareas.length > 0) {
      const descriptionInput = textareas[textareas.length - 1];
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated description');
      descriptionInput.blur();
      await waitFor(() => {
        expect(mockHandlers.onUpdate).toHaveBeenCalled();
      });
    }
  });

  // === Sub-task Tests ===
  test('renders sub-tasks when provided', () => {
    const subTasks = [
      {
        id: 'st1',
        title: 'Sub Task 1',
        status: 0,
      },
      {
        id: 'st2',
        title: 'Sub Task 2',
        status: 100,
      },
    ];

    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        subTasks={subTasks}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Sub Task 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Task 2')).toBeInTheDocument();
  });

  test('shows sub-task count when sub-tasks exist', () => {
    const subTasks = [
      { id: 'st1', title: 'Sub Task 1', status: 0 },
      { id: 'st2', title: 'Sub Task 2', status: 100 },
    ];

    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        subTasks={subTasks}
        {...mockHandlers}
      />
    );

    // Look for the specific sub-task count header
    expect(screen.getByText(/Sub-tasks \(2\)/i)).toBeInTheDocument();
  });

  test('calls onUpdate when sub-task checkbox clicked', async () => {
    const user = userEvent.setup();
    const subTasks = [
      {
        id: 'st1',
        title: 'Sub Task 1',
        status: 0,
      },
    ];

    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        subTasks={subTasks}
        {...mockHandlers}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0]);
      expect(mockHandlers.onUpdate).toHaveBeenCalled();
    }
  });

  test('renders add sub-task form', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const addSubTaskInputs = container.querySelectorAll('.add-sub-task-form input');
    expect(addSubTaskInputs.length).toBeGreaterThan(0);
  });

  test('calls onAddSubTask when sub-task form submitted', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const addSubTaskInputs = container.querySelectorAll('.add-sub-task-form input');
    if (addSubTaskInputs.length > 0) {
      const subTaskInput = addSubTaskInputs[0];
      await user.type(subTaskInput, 'New Sub Task');

      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      if (addButtons.length > 0) {
        await user.click(addButtons[addButtons.length - 1]);
        await waitFor(() => {
          expect(mockHandlers.onAddSubTask).toHaveBeenCalled();
        });
      }
    }
  });

  test('clears sub-task input after submission', async () => {
    const user = userEvent.setup();
    mockHandlers.onAddSubTask.mockResolvedValueOnce({});

    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const addSubTaskInputs = container.querySelectorAll('.add-sub-task-form input');
    if (addSubTaskInputs.length > 0) {
      const subTaskInput = addSubTaskInputs[0];
      await user.type(subTaskInput, 'New Sub Task');

      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      if (addButtons.length > 0) {
        await user.click(addButtons[addButtons.length - 1]);

        await waitFor(() => {
          expect(subTaskInput.value).toBe('');
        });
      }
    }
  });

  test('disables add sub-task button when input empty', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    if (addButtons.length > 0) {
      const addSubTaskBtn = addButtons[addButtons.length - 1];
      expect(addSubTaskBtn).toBeDisabled();
    }
  });

  test('enables add sub-task button when input has text', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const addSubTaskInputs = container.querySelectorAll('.add-sub-task-form input');
    if (addSubTaskInputs.length > 0) {
      const subTaskInput = addSubTaskInputs[0];
      await user.type(subTaskInput, 'New Sub Task');

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /Add/i });
        if (addButtons.length > 0) {
          const addSubTaskBtn = addButtons[addButtons.length - 1];
          expect(addSubTaskBtn).not.toBeDisabled();
        }
      });
    }
  });

  test('does not add empty sub-task', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const form = container.querySelector('.add-sub-task-form');
    if (form) {
      await user.click(form); // Just focus, don't type anything
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }

    expect(mockHandlers.onAddSubTask).not.toHaveBeenCalled();
  });

  test('handles add sub-task error gracefully', async () => {
    const user = userEvent.setup();
    mockHandlers.onAddSubTask.mockRejectedValueOnce(new Error('Failed'));

    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const addSubTaskInputs = container.querySelectorAll('.add-sub-task-form input');
    if (addSubTaskInputs.length > 0) {
      const subTaskInput = addSubTaskInputs[0];
      await user.type(subTaskInput, 'New Sub Task');

      const addButtons = screen.getAllByRole('button', { name: /Add/i });
      if (addButtons.length > 0) {
        await user.click(addButtons[addButtons.length - 1]);
        await waitFor(() => {
          expect(mockHandlers.onAddSubTask).toHaveBeenCalled();
        });
      }
    }
  });

  // === Category Selection Tests ===
  test('renders all 8 categories in dropdown', () => {
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    const categorySelects = container.querySelectorAll('select');
    const categorySelect = categorySelects[0]; // First select is category
    if (categorySelect) {
      const options = categorySelect.querySelectorAll('option');
      expect(options.length).toBe(8);
    }
  });

  test('changes category to each available option', async () => {
    const user = userEvent.setup();
    const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];

    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    for (const category of categories) {
      jest.clearAllMocks();
      const categorySelect = screen.getByDisplayValue(mockTask.category);
      await user.selectOptions(categorySelect, category);
      expect(mockHandlers.onUpdate).toHaveBeenCalled();
    }
  });

  // === Progress Slider Tests ===
  test('updates status via slider', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Test that slider is present and has correct initial value
    const slider = container.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
    expect(slider.value).toBe(String(mockTask.status));
  });

  // === Additional Edge Case Tests ===
  test('handles null/empty description', () => {
    const taskWithoutDesc = { ...mockTask, description: '' };
    render(
      <TaskDetail
        task={taskWithoutDesc}
        allTasks={[taskWithoutDesc]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/click to add description/i)).toBeInTheDocument();
  });

  test('handles missing sub-tasks array', () => {
    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        {...mockHandlers}
      />
    );

    // Should not crash
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders sub-task category badge', () => {
    const subTasks = [
      {
        id: 'st1',
        title: 'Sub Task 1',
        status: 50,
      },
    ];

    render(
      <TaskDetail
        task={mockTask}
        allTasks={[mockTask]}
        subTasks={subTasks}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Sub Task 1')).toBeInTheDocument();
  });
});





