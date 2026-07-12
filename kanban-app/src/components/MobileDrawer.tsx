import { useKanban } from '../context/KanbanContext';
import ThemeToggle from './ThemeToggle';

export default function MobileDrawer() {
  const { activeModal, closeModal, data, currentBoardIndex, selectBoard, openModal } = useKanban();

  if (activeModal !== 'mobileDrawer') return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-kanban-overlay z-[90] md:hidden"
        onClick={closeModal}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 w-sidebar h-screen bg-white dark:bg-[#2B2C37] z-[200] flex flex-col border-r border-kanban-border dark:border-[#3E3F4E] translate-x-0 transition-transform duration-300 md:hidden">
        {/* Logo */}
        <div className="px-6 pt-6 pb-6 border-b border-kanban-border dark:border-[#3E3F4E]">
          <img src="/assets/logo-light.svg" alt="organizeME" className="logo-light h-[26px]" />
          <img src="/assets/logo-dark.svg" alt="organizeME" className="logo-dark h-[26px]" />
        </div>

        {/* Board list */}
        <p className="text-heading-sm text-kanban-text-secondary px-6 mt-4 mb-2 uppercase">
          All Boards ({data?.boards?.length || 0})
        </p>
        <nav className="flex-1 overflow-y-auto flex flex-col">
          {data?.boards?.map((board, idx) => (
            <button
              key={idx}
              onClick={() => { selectBoard(idx); closeModal(); }}
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

        {/* Create Board */}
        <button
          onClick={() => { closeModal(); openModal('board'); }}
          className="flex items-center gap-3 py-3.5 px-6 text-[15px] font-semibold text-primary hover:opacity-80 transition-opacity"
        >
          <img src="/assets/icon-board.svg" alt="" className="w-4 h-4" />
          <span>+ Create New Board</span>
        </button>

        {/* Theme toggle */}
        <ThemeToggle className="mx-4 mb-4" />
      </div>
    </>
  );
}