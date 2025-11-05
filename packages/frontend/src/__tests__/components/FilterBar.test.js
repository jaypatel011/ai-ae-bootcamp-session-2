/**
 * FilterBar component tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../../components/FilterBar';

describe('FilterBar Component', () => {
  const mockFilter = {
    category: null,
    status: 'all',
    dateRange: null,
    searchQuery: '',
  };

  const mockSetFilter = jest.fn();
  const mockSetSort = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input', () => {
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });

  test('renders category filter', () => {
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
  });

  test('renders status filter', () => {
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );
    expect(screen.getByDisplayValue('All Tasks')).toBeInTheDocument();
  });

  test('renders date range filter', () => {
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );
    expect(screen.getByDisplayValue('All Dates')).toBeInTheDocument();
  });

  test('renders sort options', () => {
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );
    expect(screen.getByDisplayValue('Due Date (Earliest)')).toBeInTheDocument();
  });

  test('renders clear filters button', () => {
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );
    expect(screen.getByRole('button', { name: /Clear all filters/i })).toBeInTheDocument();
  });

  test('updates search query on input change', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );

    const input = screen.getByPlaceholderText('Search tasks...');
    await user.type(input, 'test');

    // Verify setFilter was called multiple times (once per character typed)
    expect(mockSetFilter).toHaveBeenCalledTimes(4); // t, te, tes, test
    // Verify the first call was for 't'
    expect(mockSetFilter.mock.calls[0][0]).toEqual(
      expect.objectContaining({ searchQuery: 't' })
    );
  });

  test('updates category filter on select change', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );

    const categorySelect = screen.getByDisplayValue('All Categories');
    await user.selectOptions(categorySelect, 'Work');

    expect(mockSetFilter).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Work' })
    );
  });

  test('updates status filter on select change', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );

    const statusSelect = screen.getByDisplayValue('All Tasks');
    await user.selectOptions(statusSelect, 'completed');

    expect(mockSetFilter).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' })
    );
  });

  test('updates sort on select change', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort="dueDate-asc"
        setSort={mockSetSort}
      />
    );

    const sortSelect = screen.getByDisplayValue('Due Date (Earliest)');
    await user.selectOptions(sortSelect, 'title-asc');

    expect(mockSetSort).toHaveBeenCalledWith('title-asc');
  });

  test('clears filters on clear button click', async () => {
    const user = userEvent.setup();
    const activeFilter = {
      category: 'Work',
      status: 'completed',
      dateRange: 'today',
      searchQuery: 'search',
    };

    render(
      <FilterBar
        filter={activeFilter}
        setFilter={mockSetFilter}
        sort="title-asc"
        setSort={mockSetSort}
      />
    );

    const clearButton = screen.getByRole('button', { name: /Clear all filters/i });
    await user.click(clearButton);

    expect(mockSetFilter).toHaveBeenCalledWith({
      category: null,
      status: 'all',
      dateRange: null,
      searchQuery: '',
    });

    expect(mockSetSort).toHaveBeenCalledWith('dueDate-asc');
  });

  test('renders all filter select options', () => {
    const { container } = render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort={'dueDate-asc'}
        setSort={mockSetSort}
      />
    );

    // Check that select elements exist for category, status, date range, and sort
    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(4);
  });

  test('renders all category options', () => {
    const { container } = render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort={'dueDate-asc'}
        setSort={mockSetSort}
      />
    );

    const options = container.querySelectorAll('option[value="Work"], option[value="Personal"], option[value="Shopping"]');
    expect(options.length).toBeGreaterThan(0);
  });

  test('resets date range filter when empty string selected', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={mockFilter}
        setFilter={mockSetFilter}
        sort={'dueDate-asc'}
        setSort={mockSetSort}
      />
    );

    // Find the date range select and clear it
    const selects = screen.getAllByRole('combobox');
    if (selects.length > 0) {
      // Date range select is usually after status
      const dateRangeSelect = selects[2]; // Third select typically
      if (dateRangeSelect) {
        await user.selectOptions(dateRangeSelect, '');
        expect(mockSetFilter).toHaveBeenCalled();
      }
    }
  });

  test('clears search query when input cleared', async () => {
    const user = userEvent.setup();
    const filterWithSearch = { ...mockFilter, searchQuery: 'test' };
    render(
      <FilterBar
        filter={filterWithSearch}
        setFilter={mockSetFilter}
        sort={'dueDate-asc'}
        setSort={mockSetSort}
      />
    );

    const searchInput = screen.getByDisplayValue('test');
    await user.clear(searchInput);
    expect(mockSetFilter).toHaveBeenCalled();
  });

  test('handles category filter with empty string', async () => {
    const user = userEvent.setup();
    const filterWithCategory = { ...mockFilter, category: 'Work' };
    render(
      <FilterBar
        filter={filterWithCategory}
        setFilter={mockSetFilter}
        sort={'dueDate-asc'}
        setSort={mockSetSort}
      />
    );

    const categorySelect = screen.getByDisplayValue('Work');
    await user.selectOptions(categorySelect, '');
    expect(mockSetFilter).toHaveBeenCalledWith(expect.objectContaining({ category: null }));
  });
});
