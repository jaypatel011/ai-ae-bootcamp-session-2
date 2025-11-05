/**
 * App Component
 * Main application component with state management and layout
 */

import { useTasks } from './hooks/useTasks';
import QuickAdd from './components/QuickAdd';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const { tasks, allTasks, loading, error, setError, filter, setFilter, sort, setSort, addTask, updateTask, deleteTask, addSubTask } =
    useTasks();

  return (
    <div className="app">
      <header className="app-header">
        <h1>✨ FlowTask</h1>
        <p className="app-subtitle">Organize your life, amplify your productivity</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message" role="alert">
            <button onClick={() => setError(null)} className="error-close" aria-label="Close error">
              ✕
            </button>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <>
            <QuickAdd onAddTask={addTask} />
            <FilterBar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} />
            <TaskList
              tasks={tasks}
              allTasks={allTasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddSubTask={addSubTask}
            />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 FlowTask. Built with passion for productivity.</p>
      </footer>
    </div>
  );
}

export default App;
