import { useKanban } from '../context/KanbanContext';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const { data, currentBoardIndex, sidebarHidden, selectBoard, addBoard, toggleSidebar } = useKanban();

  if (sidebarHidden) return null;

  return (
    <aside className="w-sidebar min-w-sidebar bg-kanban-bg-sidebar dark:bg-[#2B2C37] border-r border-kanban-border dark:border-[#3E3F4E] flex flex-col h-screen transition-colors z-100 max-md:hidden">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-kanban-border dark:border-[#3E3F4E] transition-colors">
        <img src="/assets/logo-light.svg" alt="organizeME" className="logo-light h-[26px]" />
        <img src="/assets/logo-dark.svg" alt="organizeME" className="logo-dark h-[26px]" />
      </div>

      {/* Board List */}
      <div className="flex-1 overflow-y-auto py-4">
        <p className="text-heading-sm text-kanban-text-secondary px-6 mb-2 uppercase tracking-[2.4px]">
          All Boards ({data?.boards?.length || 0})
        </p>
        <nav className="flex flex-col">
          {data?.boards?.map((board, idx) => (
            <button
              key={idx}
              onClick={() => selectBoard(idx)}
              className={`board-item flex items-center gap-3 py-3.5 px-6 text-[15px] font-semibold cursor-pointer transition-colors mr-6 rounded-r-pill ${
                idx === currentBoardIndex
                  ? 'bg-primary text-white'
                  : 'text-kanban-text-secondary hover:bg-primary-light hover:text-primary'
              }`}
            >
              <img src="/assets/icon-board.svg" alt="" className="w-4 h-4" />
              <span>{board.name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => addBoard({ name: '', columns: [{ name: 'Todo', tasks: [] }, { name: 'Doing', tasks: [] }, { name: 'Done', tasks: [] }] })}
          className="flex items-center gap-3 py-3.5 px-6 text-[15px] font-semibold text-primary hover:opacity-80 transition-opacity w-full text-left"
        >
          <img src="/assets/icon-board.svg" alt="" className="w-4 h-4" />
          <span>+ Create New Board</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 px-6 pb-8 border-t border-kanban-border dark:border-[#3E3F4E] transition-colors">
        <ThemeToggle className="mb-2" />

        <button
          onClick={() => toggleSidebar(true)}
          className="flex items-center gap-3 py-3.5 text-[15px] font-semibold text-kanban-text-secondary hover:text-primary transition-colors w-full text-left rounded-r-pill"
        >
          <img src="/assets/icon-hide-sidebar.svg" alt="" className="opacity-70" />
          <span>Hide Sidebar</span>
        </button>
      </div>
    </aside>
  );
}