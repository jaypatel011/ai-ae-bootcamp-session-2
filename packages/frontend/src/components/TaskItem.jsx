/**
 * TaskItem Component
 * Displays a single task in the task list
 */

import { useState } from 'react';
import { getRelativeDateLabel } from '../utils/date-utils';
import { TaskManager } from '../utils/task-manager';
import CategoryBadge from './CategoryBadge';
import TaskDetail from './TaskDetail';

const getStatusColor = (status) => {
  if (status >= 75) return '#10b981';
  if (status >= 50) return '#eab308';
  if (status >= 25) return '#f59e0b';
  return '#ef4444';
};

export const TaskItem = ({ task, allTasks, onUpdate, onDelete, onAddSubTask }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const subTasks = allTasks.filter((t) => t.parentTaskId === task.id) || [];
  const dueLabel = getRelativeDateLabel(task.dueDate);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status < 100;

  return (
    <>
      <div
        className={`task-item ${TaskManager.isCompleted(task) ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
        onClick={() => setShowDetail(true)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && setShowDetail(true)}
      >
        <div className="task-content">
          <div className="task-header">
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={TaskManager.isCompleted(task)}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate(task.id, { status: TaskManager.isCompleted(task) ? 0 : 100 });
                }}
                aria-label={`Mark ${task.title} as ${TaskManager.isCompleted(task) ? 'incomplete' : 'complete'}`}
              />
            </div>
            <span className="task-title">{task.title}</span>
            <CategoryBadge category={task.category} />
          </div>

          <div className="task-meta">
            {dueLabel && (
              <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
                📅 {dueLabel}
              </span>
            )}
          </div>

          <div className="task-progress-container">
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar"
                style={{
                  width: `${task.status}%`,
                  backgroundColor: getStatusColor(task.status),
                }}
                role="progressbar"
                aria-valuenow={task.status}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span className="progress-text">{task.status}%</span>
          </div>
        </div>

        {subTasks.length > 0 && (
          <button
            className="expand-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${subTasks.length} sub-tasks`}
          >
            {isExpanded ? '▼' : '▶'} {subTasks.length} sub-task{subTasks.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {isExpanded && subTasks.length > 0 && (
        <div className="sub-tasks">
          {subTasks.map((subTask) => (
            <TaskItem
              key={subTask.id}
              task={subTask}
              allTasks={allTasks}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddSubTask={onAddSubTask}
            />
          ))}
        </div>
      )}

      {showDetail && (
        <TaskDetail
          task={task}
          allTasks={allTasks}
          subTasks={subTasks}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddSubTask={onAddSubTask}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default TaskItem;
