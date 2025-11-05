/**
 * CompletionIndicator Component
 * Modern animated completion indicator with glassmorphism design
 * Replaces traditional checkbox with a more elegant visual
 */

import './CompletionIndicator.css';

const CompletionIndicator = ({ isCompleted, onChange, taskTitle }) => {
  return (
    <button
      className={`completion-indicator ${isCompleted ? 'completed' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      aria-label={`Mark ${taskTitle} as ${isCompleted ? 'incomplete' : 'complete'}`}
      role="checkbox"
      aria-checked={isCompleted}
      type="button"
    >
      <div className="indicator-circle">
        {isCompleted && (
          <svg
            className="checkmark"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </button>
  );
};

export default CompletionIndicator;
