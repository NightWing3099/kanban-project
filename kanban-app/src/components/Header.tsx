import { useState, useRef } from 'react';
import { useKanban } from '../context/KanbanContext';
import { useClickOutside } from '../hooks';

export default function Header() {
  const { currentBoard, openModal } = useKanban();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  const boardName = currentBoard?.name || 'No boards';
  const hasColumns = currentBoard && currentBoard.columns.length > 0;

  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white dark:bg-[#2B2C37] border-b border-kanban-border dark:border-[#3E3F4E] transition-colors min-h-[97px] max-md:min-h-16 max-md:px-5 max-sm:min-h-14 max-sm:px-4">
      <div className="flex items-center gap-6 w-full justify-between">
        {/* Mobile Menu Trigger */}
        <button
          onClick={() => openModal('mobileDrawer')}
          className="hidden max-md:flex items-center gap-2 p-1"
        >
          <span className="flex items-center">
            <img src="/assets/logo-mobile.svg" alt="organizeME" />
          </span>
          <span className="flex items-center gap-2 text-lg font-bold text-kanban-text-primary dark:text-white">
            {boardName}
            <img src="/assets/icon-chevron-down.svg" alt="" />
          </span>
        </button>

        <h1 className="text-heading-xl text-kanban-text-primary dark:text-white transition-colors max-md:hidden">
          {boardName}
        </h1>

        <div className="flex items-center gap-4 max-md:gap-2">
          <button
            onClick={() => openModal('task')}
            disabled={!hasColumns}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-3xl text-[13px] font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-25 disabled:cursor-not-allowed transition-colors max-md:px-4"
          >
            <img src="/assets/icon-add-task-mobile.svg" alt="" className="md:hidden" />
            <span className="max-md:hidden">+ Add New Task</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-kanban-text-secondary/10 transition-colors"
            >
              <img src="/assets/icon-vertical-ellipsis.svg" alt="Board options" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-kanban-dropdown-bg dark:bg-[#20212C] rounded-lg shadow-dropdown py-2 min-w-[192px] z-[200] transition-colors">
                <button
                  onClick={() => { setDropdownOpen(false); openModal('board', { edit: true }); }}
                  className="block w-full px-4 py-2.5 text-left text-[13px] font-medium text-kanban-text-secondary hover:bg-kanban-text-secondary/10 transition-colors"
                >
                  Edit Board
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); openModal('deleteBoard'); }}
                  className="block w-full px-4 py-2.5 text-left text-[13px] font-medium text-danger hover:bg-kanban-text-secondary/10 transition-colors"
                >
                  Delete Board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}