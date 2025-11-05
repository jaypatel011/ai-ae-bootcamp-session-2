/**
 * QuickAdd Component
 * Quick task creation interface
 */

import { useState } from 'react';
import { TaskManager } from '../utils/task-manager';

export const QuickAdd = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onAddTask(title, { category });
      setTitle('');
      setCategory('Other');
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-add">
      <form onSubmit={handleSubmit} className="quick-add-form">
        <input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="quick-add-input"
          aria-label="Task title"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="quick-add-select"
          aria-label="Task category"
        >
          {TaskManager.CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="quick-add-button"
          aria-label="Create task"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
};

export default QuickAdd;
