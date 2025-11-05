/**
 * Date Utilities
 * Handles date formatting, relative labels, and range matching
 */

/**
 * Helper: Parse ISO date string handling timezone correctly
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {Date} Date object in local timezone at midnight
 */
const parseISODate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date;
};

/**
 * Gets a human-readable relative date label
 * @param {string|null} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string|null} Relative date label or full date
 */
export const getRelativeDateLabel = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const taskDate = parseISODate(dateString);

  if (taskDate < today) {
    const daysOverdue = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
    if (daysOverdue === 1) return 'Yesterday';
    return `${daysOverdue}d overdue`;
  }

  if (taskDate.getTime() === today.getTime()) return 'Today';
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (taskDate < nextWeek) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[taskDate.getDay()];
  }

  const isThisYear = date.getFullYear() === new Date().getFullYear();
  
  if (isThisYear) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Checks if a date matches a given date range filter
 * @param {string|null} dateString - ISO date string (YYYY-MM-DD)
 * @param {string} range - Range filter (overdue, today, tomorrow, week, month, no-due-date)
 * @returns {boolean} Whether the date matches the range
 */
export const matchesDateRange = (dateString, range) => {
  if (!dateString) return range === 'no-due-date';

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = parseISODate(dateString);

  switch (range) {
    case 'overdue':
      return taskDate < today;
    case 'today':
      return taskDate.getTime() === today.getTime();
    case 'tomorrow': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return taskDate.getTime() === tomorrow.getTime();
    }
    case 'week': {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return taskDate >= today && taskDate <= weekFromNow;
    }
    case 'month': {
      const monthFromNow = new Date(today);
      monthFromNow.setMonth(monthFromNow.getMonth() + 1);
      return taskDate >= today && taskDate <= monthFromNow;
    }
    case 'no-due-date':
      return !dateString;
    default:
      return true;
  }
};

/**
 * Formats a date string for HTML input (type="date")
 * @param {string|null} dateString - ISO date string
 * @returns {string} YYYY-MM-DD format or empty string
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

/**
 * Checks if a date is overdue
 * @param {string|null} dateString - ISO date string
 * @returns {boolean} Whether the date is in the past
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;

  const taskDate = parseISODate(dateString);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return taskDate < today;
};

/**
 * Calculates days until due date (positive = future, negative = past)
 * @param {string|null} dateString - ISO date string
 * @returns {number|null} Days until due or null if no date
 */
export const daysUntilDue = (dateString) => {
  if (!dateString) return null;

  const taskDate = parseISODate(dateString);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
};
