import { useKanban } from '../context/KanbanContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useKanban();

  return (
    <div className={`flex items-center justify-center gap-5 bg-kanban-bg dark:bg-[#20212C] p-3.5 rounded-md transition-colors ${className}`}>
      <img src="/assets/icon-light-theme.svg" alt="" />
      <button
        role="switch"
        aria-checked={theme === 'dark'}
        onClick={toggleTheme}
        className="relative inline-block w-10 h-5 cursor-pointer"
      >
        <span className="absolute inset-0 rounded-[20px] bg-primary">
          <span className={`absolute h-3.5 w-3.5 left-[3px] bottom-[3px] bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
        </span>
      </button>
      <img src="/assets/icon-dark-theme.svg" alt="" />
    </div>
  );
}