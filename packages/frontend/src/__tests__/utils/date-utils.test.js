/**
 * Date utilities tests
 */

import {
  getRelativeDateLabel,
  matchesDateRange,
  formatDateForInput,
  isOverdue,
  daysUntilDue,
} from '../../utils/date-utils';

describe('dateUtils', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const twoWeeksFromNow = new Date(today);
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

  describe('getRelativeDateLabel', () => {
    test('returns null for null date', () => {
      expect(getRelativeDateLabel(null)).toBeNull();
    });

    test('returns "Due Today" for today', () => {
      const dateStr = today.toISOString().split('T')[0];
      expect(getRelativeDateLabel(dateStr)).toBe('Due Today');
    });

    test('returns "Due Tomorrow" for tomorrow', () => {
      const dateStr = tomorrow.toISOString().split('T')[0];
      expect(getRelativeDateLabel(dateStr)).toBe('Due Tomorrow');
    });

    test('returns relative label for dates this week', () => {
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const dateStr = threeDaysFromNow.toISOString().split('T')[0];
      expect(getRelativeDateLabel(dateStr)).toContain('Due in');
      expect(getRelativeDateLabel(dateStr)).toContain('days');
    });

    test('returns full date for dates beyond this week', () => {
      const dateStr = twoWeeksFromNow.toISOString().split('T')[0];
      const label = getRelativeDateLabel(dateStr);
      expect(label).not.toContain('Due in');
      expect(label).toBeTruthy();
    });

    test('returns "Overdue by" for past dates', () => {
      const dateStr = yesterday.toISOString().split('T')[0];
      expect(getRelativeDateLabel(dateStr)).toContain('Overdue by');
    });
  });

  describe('matchesDateRange', () => {
    test('matches "today" correctly', () => {
      const todayStr = today.toISOString().split('T')[0];
      expect(matchesDateRange(todayStr, 'today')).toBe(true);

      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(matchesDateRange(tomorrowStr, 'today')).toBe(false);
    });

    test('matches "tomorrow" correctly', () => {
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(matchesDateRange(tomorrowStr, 'tomorrow')).toBe(true);

      const todayStr = today.toISOString().split('T')[0];
      expect(matchesDateRange(todayStr, 'tomorrow')).toBe(false);
    });

    test('matches "overdue" correctly', () => {
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      expect(matchesDateRange(yesterdayStr, 'overdue')).toBe(true);

      const todayStr = today.toISOString().split('T')[0];
      expect(matchesDateRange(todayStr, 'overdue')).toBe(false);
    });

    test('matches "week" correctly', () => {
      const fourDaysFromNow = new Date(today);
      fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);
      const dateStr = fourDaysFromNow.toISOString().split('T')[0];
      expect(matchesDateRange(dateStr, 'week')).toBe(true);

      expect(matchesDateRange(twoWeeksFromNow.toISOString().split('T')[0], 'week')).toBe(false);
    });

    test('matches "month" correctly', () => {
      const fifteenDaysFromNow = new Date(today);
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
      const dateStr = fifteenDaysFromNow.toISOString().split('T')[0];
      expect(matchesDateRange(dateStr, 'month')).toBe(true);

      // Much further in future should not match month range
      const twoMonthsFromNow = new Date(today);
      twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
      const farDateStr = twoMonthsFromNow.toISOString().split('T')[0];
      expect(matchesDateRange(farDateStr, 'month')).toBe(false);
    });

    test('returns true for unknown date range', () => {
      const dateStr = today.toISOString().split('T')[0];
      expect(matchesDateRange(dateStr, 'unknown-range')).toBe(true);
    });
  });

  describe('formatDateForInput', () => {
    test('formats date correctly for input', () => {
      const isoDate = '2025-11-10T10:30:00Z';
      expect(formatDateForInput(isoDate)).toBe('2025-11-10');
    });

    test('returns empty string for null', () => {
      expect(formatDateForInput(null)).toBe('');
    });

    test('handles already-formatted dates', () => {
      expect(formatDateForInput('2025-11-10')).toBe('2025-11-10');
    });
  });

  describe('isOverdue', () => {
    test('returns true for past dates', () => {
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      expect(isOverdue(yesterdayStr)).toBe(true);
    });

    test('returns false for today or future dates', () => {
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(isOverdue(todayStr)).toBe(false);
      expect(isOverdue(tomorrowStr)).toBe(false);
    });

    test('returns false for null', () => {
      expect(isOverdue(null)).toBe(false);
    });
  });

  describe('daysUntilDue', () => {
    test('calculates days correctly', () => {
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(daysUntilDue(tomorrowStr)).toBe(1);

      const fiveDaysFromNow = new Date(today);
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      expect(daysUntilDue(fiveDaysFromNow.toISOString().split('T')[0])).toBe(5);
    });

    test('returns negative for past dates', () => {
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      expect(daysUntilDue(yesterdayStr)).toBeLessThan(0);
    });

    test('returns null for null date', () => {
      expect(daysUntilDue(null)).toBeNull();
    });
  });

  describe('formatDateForInput', () => {
    test('returns empty string for null date', () => {
      expect(formatDateForInput(null)).toBe('');
    });

    test('returns YYYY-MM-DD format for valid date', () => {
      expect(formatDateForInput('2025-12-15T10:30:00Z')).toBe('2025-12-15');
    });

    test('handles date strings without time component', () => {
      expect(formatDateForInput('2025-12-15')).toBe('2025-12-15');
    });
  });
});
