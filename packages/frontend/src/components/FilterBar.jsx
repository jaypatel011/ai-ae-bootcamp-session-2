/**
 * FilterBar Component
 * Filtering and sorting interface
 */

import { TaskManager } from '../utils/task-manager';

export const FilterBar = ({ filter, setFilter, sort, setSort }) => {
  const handleCategoryChange = (e) => {
    setFilter({ ...filter, category: e.target.value || null });
  };

  const handleStatusChange = (e) => {
    setFilter({ ...filter, status: e.target.value });
  };

  const handleDateRangeChange = (e) => {
    setFilter({ ...filter, dateRange: e.target.value || null });
  };

  const handleSearchChange = (e) => {
    setFilter({ ...filter, searchQuery: e.target.value });
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleClearFilters = () => {
    setFilter({
      category: null,
      status: 'all',
      dateRange: null,
      searchQuery: '',
    });
    setSort('dueDate-asc');
  };

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filter.searchQuery}
          onChange={handleSearchChange}
          className="filter-input"
          aria-label="Search tasks"
        />
      </div>

      <div className="filter-row">
        <select
          value={filter.category || ''}
          onChange={handleCategoryChange}
          className="filter-select"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {TaskManager.CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={filter.status}
          onChange={handleStatusChange}
          className="filter-select"
          aria-label="Filter by status"
        >
          <option value="all">All Tasks</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
          <option value="in-progress">In Progress</option>
        </select>

        <select
          value={filter.dateRange || ''}
          onChange={handleDateRangeChange}
          className="filter-select"
          aria-label="Filter by due date"
        >
          <option value="">All Dates</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due Today</option>
          <option value="tomorrow">Due Tomorrow</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="no-due-date">No Due Date</option>
        </select>

        <select
          value={sort}
          onChange={handleSortChange}
          className="filter-select"
          aria-label="Sort tasks"
        >
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="category-asc">Category</option>
          <option value="status-desc">Completion (High First)</option>
          <option value="status-asc">Completion (Low First)</option>
        </select>

        <button
          onClick={handleClearFilters}
          className="filter-button"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
