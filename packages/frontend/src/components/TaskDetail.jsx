/**
 * TaskDetail Component
 * Detailed task view with inline editing
 */

import { useState } from 'react';
import { formatDateForInput, getRelativeDateLabel } from '../utils/date-utils';
import { TaskManager } from '../utils/task-manager';
import CategoryBadge from './CategoryBadge';

export const TaskDetail = ({
  task,
  allTasks,
  subTasks = [],
  onUpdate,
  onDelete,
  onAddSubTask,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState({});
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskCategory, setNewSubTaskCategory] = useState('Other');

  const handleFieldChange = (field, value) => {
    onUpdate(task.id, { [field]: value });
  };

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;

    try {
      await onAddSubTask(task.id, newSubTaskTitle, { category: newSubTaskCategory });
      setNewSubTaskTitle('');
      setNewSubTaskCategory('Other');
    } catch (error) {
      console.error('Failed to add sub-task:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task and all its sub-tasks?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const dueLabel = getRelativeDateLabel(task.dueDate);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Task Details</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close task details">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div className="detail-field">
            <label>Title</label>
            {isEditing.title ? (
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                onBlur={() => setIsEditing({ ...isEditing, title: false })}
                autoFocus
                className="detail-input"
              />
            ) : (
              <p onClick={() => setIsEditing({ ...isEditing, title: true })} className="detail-value editable">
                {task.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="detail-field">
            <label>Description</label>
            {isEditing.description ? (
              <textarea
                value={task.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => setIsEditing({ ...isEditing, description: false })}
                autoFocus
                className="detail-textarea"
                placeholder="Add a description..."
              />
            ) : (
              <p
                onClick={() => setIsEditing({ ...isEditing, description: true })}
                className="detail-value editable"
              >
                {task.description || '(click to add description)'}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="detail-field">
            <label>Category</label>
            <select
              value={task.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className="detail-select"
            >
              {TaskManager.CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="detail-field">
            <label>Due Date</label>
            <input
              type="date"
              value={formatDateForInput(task.dueDate)}
              onChange={(e) => handleFieldChange('dueDate', e.target.value || null)}
              className="detail-input"
            />
            {dueLabel && <p className="detail-help">{dueLabel}</p>}
          </div>

          {/* Status */}
          <div className="detail-field">
            <label>Completion Status</label>
            <div className="status-buttons">
              {TaskManager.PREDEFINED_STATUS.map((status) => (
                <button
                  key={status}
                  onClick={() => handleFieldChange('status', status)}
                  className={`status-button ${task.status === status ? 'active' : ''}`}
                  aria-pressed={task.status === status}
                >
                  {status}%
                </button>
              ))}
            </div>
            <div className="status-slider">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={task.status}
                onChange={(e) => handleFieldChange('status', parseInt(e.target.value))}
                className="detail-range"
                aria-label="Task completion percentage"
              />
            </div>
          </div>

          {/* Timestamps */}
          <div className="detail-field">
            <label>Timestamps</label>
            <p className="detail-help">Created: {new Date(task.createdAt).toLocaleString()}</p>
            <p className="detail-help">Updated: {new Date(task.updatedAt).toLocaleString()}</p>
          </div>

          {/* Sub-tasks */}
          {subTasks.length > 0 && (
            <div className="detail-field">
              <label>Sub-tasks ({subTasks.length})</label>
              <div className="sub-tasks-list">
                {subTasks.map((subTask) => (
                  <div key={subTask.id} className="sub-task-item">
                    <input
                      type="checkbox"
                      checked={subTask.status === 100}
                      onChange={(e) =>
                        onUpdate(subTask.id, { status: e.target.checked ? 100 : 0 })
                      }
                      aria-label={`Mark ${subTask.title} as ${subTask.status === 100 ? 'incomplete' : 'complete'}`}
                    />
                    <span className={subTask.status === 100 ? 'completed' : ''}>{subTask.title}</span>
                    <span className="sub-task-status">{subTask.status}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Sub-task */}
          <div className="detail-field">
            <label>Add Sub-task</label>
            <form onSubmit={handleAddSubTask} className="add-sub-task-form">
              <input
                type="text"
                placeholder="Sub-task title..."
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                className="detail-input"
              />
              <select
                value={newSubTaskCategory}
                onChange={(e) => setNewSubTaskCategory(e.target.value)}
                className="detail-select"
              >
                {TaskManager.CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button type="submit" className="add-sub-task-button" disabled={!newSubTaskTitle.trim()}>
                Add
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleDelete} className="delete-button" aria-label="Delete task">
            Delete Task
          </button>
          <button onClick={onClose} className="cancel-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
