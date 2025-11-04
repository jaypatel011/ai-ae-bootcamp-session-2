/**
 * TaskItem Component
 * Displays a single task in the task list
 */

import { useState } from 'react';
import { getRelativeDateLabel } from '../utils/date-utils';
import { TaskManager } from '../utils/task-manager';
import CategoryBadge from './CategoryBadge';
import TaskDetail from './TaskDetail';
import CompletionIndicator from './CompletionIndicator';

const getStatusColor = (status) => {
  if (status >= 75) return 'var(--status-100)';
  if (status >= 50) return 'var(--status-75)';
  if (status >= 25) return 'var(--status-50)';
  if (status > 0) return 'var(--status-25)';
  return 'var(--status-0)';
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
        style={{
          boxShadow: '0 12px 40px 0 rgba(31,38,135,0.12)',
          borderRadius: '20px',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          marginBottom: '1.5rem',
          background: 'var(--glass-white)',
          backdropFilter: 'blur(24px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.22)',
        }}
      >
        <div className="task-content" style={{gap: '1.5rem'}}>
          <div className="task-header" style={{gap: '1rem'}}>
            <CompletionIndicator
              isCompleted={TaskManager.isCompleted(task)}
              onChange={() => {
                onUpdate(task.id, { status: TaskManager.isCompleted(task) ? 0 : 100 });
              }}
              taskTitle={task.title}
            />
            <span className="task-title" style={{fontWeight: 600, fontSize: '1.15rem'}}>{task.title}</span>
            <CategoryBadge category={task.category} />
          </div>

          <div className="task-meta" style={{gap: '1rem'}}>
            {dueLabel && (
              <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`} style={{fontWeight: 500, padding: '6px 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                <span style={{fontSize: '1rem'}}>{isOverdue ? '⚠️' : '📆'}</span>
                <span>{dueLabel}</span>
              </span>
            )}
          </div>

          <div className="task-progress-container" style={{gap: '1rem'}}>
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar"
                style={{
                  width: `${task.status}%`,
                  background: `linear-gradient(90deg, ${getStatusColor(task.status)} 0%, #fff 100%)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}
                role="progressbar"
                aria-valuenow={task.status}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span className="progress-text" style={{fontWeight: 600, fontSize: '1rem'}}>{task.status}%</span>
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
            style={{marginTop: '1rem', fontWeight: 500, fontSize: '0.95rem'}}
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

}

export default TaskItem;
