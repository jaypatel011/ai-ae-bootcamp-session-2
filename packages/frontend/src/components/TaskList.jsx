/**
 * TaskList Component
 * Displays a list of filtered/sorted tasks
 */

import TaskItem from './TaskItem';

export const TaskList = ({
  tasks,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  onAddSubTask,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="task-list" style={{padding: '2rem 0'}}>
        <div className="no-tasks">
          <p>No tasks found</p>
          <p className="no-tasks-hint">Create a new task or adjust your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list" style={{gap: '2rem', padding: '2rem 0'}}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          allTasks={allTasks}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          onAddSubTask={onAddSubTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
