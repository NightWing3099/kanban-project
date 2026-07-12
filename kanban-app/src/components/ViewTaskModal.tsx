import { useState, useRef } from 'react';
import { useKanban } from '../context/KanbanContext';
import { useClickOutside } from '../hooks';
import type { Board, Task, ModalName, ModalData } from '../types';

interface ViewTaskContentProps {
  task: Task;
  colIdx: number;
  taskIdx: number;
  completed: number;
  total: number;
  closeModal: () => void;
  currentBoard: Board | null;
  toggleSubtask: (p: { colIdx: number; taskIdx: number; subtaskIdx: number }) => void;
  updateTask: (p: { columnIndex: number; taskIndex: number; task: Task; newStatus?: string }) => void;
  openModal: (name: ModalName, data?: ModalData | null) => void;
}

export default function ViewTaskModal() {
  const { activeModal, modalData, closeModal, currentBoard, toggleSubtask, updateTask, openModal } = useKanban();

  if (activeModal !== 'viewTask') return null;

  const { colIdx, taskIdx } = modalData || {};
  const task = currentBoard?.columns[colIdx!]?.tasks[taskIdx!];
  if (!task) return null;

  const completed = task.subtasks.filter(s => s.isCompleted).length;
  const total = task.subtasks.length;

  return (
    <div
      className="fixed inset-0 bg-kanban-overlay z-[1000] flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeModal}
    >
      <ViewTaskContent
        task={task}
        colIdx={colIdx!}
        taskIdx={taskIdx!}
        completed={completed}
        total={total}
        closeModal={closeModal}
        currentBoard={currentBoard}
        toggleSubtask={toggleSubtask}
        updateTask={updateTask}
        openModal={openModal}
      />
    </div>
  );
}

function ViewTaskContent({ task, colIdx, taskIdx, completed, total, closeModal, currentBoard, toggleSubtask, updateTask, openModal }: ViewTaskContentProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setDropdownOpen(false));
  useClickOutside(selectRef, () => setSelectOpen(false));

  const handleStatusChange = (newStatus: string) => {
    setSelectOpen(false);
    if (newStatus === task.status) return;
    updateTask({
      columnIndex: colIdx,
      taskIndex: taskIdx,
      task,
      newStatus,
    });
    // Re-open the view for the moved task
    setTimeout(() => {
      const newColIdx = currentBoard!.columns.findIndex(c => c.name === newStatus);
      if (newColIdx !== -1) {
        const newTaskIdx = currentBoard!.columns[newColIdx].tasks.length - 1;
        closeModal();
        setTimeout(() => {
          openModal('viewTask', { colIdx: newColIdx, taskIdx: newTaskIdx });
        }, 0);
      }
    }, 0);
  };

  return (
    <div
      className="bg-white dark:bg-[#2B2C37] rounded-lg p-8 w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-modal transition-colors max-md:p-6 max-md:mx-2"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-heading-lg text-kanban-text-primary dark:text-white pr-4">
          {task.title}
        </h2>
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-kanban-text-secondary/10 transition-colors"
          >
            <img src="/assets/icon-vertical-ellipsis.svg" alt="Task options" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-kanban-dropdown-bg dark:bg-[#20212C] rounded-lg shadow-dropdown py-2 min-w-[192px] z-[200] transition-colors">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  closeModal();
                  setTimeout(() => openModal('task', { edit: true, colIdx, taskIdx }), 0);
                }}
                className="block w-full px-4 py-2.5 text-left text-[13px] font-medium text-kanban-text-secondary hover:bg-kanban-text-secondary/10 transition-colors"
              >
                Edit Task
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  closeModal();
                  setTimeout(() => openModal('deleteTask', { colIdx, taskIdx }), 0);
                }}
                className="block w-full px-4 py-2.5 text-left text-[13px] font-medium text-danger hover:bg-kanban-text-secondary/10 transition-colors"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] font-medium text-kanban-text-secondary leading-relaxed mb-6">
        {task.description || 'No description'}
      </p>

      {/* Subtasks */}
      <div className="mb-6">
        <label className="block text-heading-sm text-kanban-text-secondary mb-3">
          Subtasks ({completed} of {total})
        </label>
        <div>
          {task.subtasks.map((st, stIdx) => (
            <div
              key={stIdx}
              className={`flex items-center gap-4 p-3 bg-kanban-subtask-bg dark:bg-[#20212C] rounded mb-2 cursor-pointer hover:bg-primary-light-hover transition-colors ${st.isCompleted ? 'completed' : ''}`}
              onClick={() => toggleSubtask({ colIdx, taskIdx, subtaskIdx: stIdx })}
            >
              <input
                type="checkbox"
                checked={st.isCompleted}
                onChange={() => toggleSubtask({ colIdx, taskIdx, subtaskIdx: stIdx })}
                className="appearance-none w-4 h-4 border border-kanban-checkbox-border dark:border-kanban-input-border rounded-sm bg-white dark:bg-[#20212C] checked:bg-primary checked:border-primary cursor-pointer flex-shrink-0 relative transition-colors after:content-[''] after:absolute after:left-[4px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:hidden checked:after:block"
              />
              <span className={`text-xs font-bold text-kanban-text-primary dark:text-white transition-colors ${
                st.isCompleted ? 'line-through text-kanban-text-secondary opacity-50' : ''
              }`}>
                {st.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block text-heading-sm text-kanban-text-secondary mb-2">
          Current Status
        </label>
        <div className="relative" ref={selectRef}>
          <button
            type="button"
            onClick={() => setSelectOpen(!selectOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 border border-kanban-input-border rounded text-[13px] text-kanban-text-primary dark:text-white bg-white dark:bg-[#2B2C37] cursor-pointer hover:border-primary transition-colors"
          >
            <span>{task.status}</span>
            <img
              src="/assets/icon-chevron-down.svg"
              alt=""
              className={`transition-transform ${selectOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {selectOpen && (
            <ul className="absolute top-full left-0 right-0 mt-2 bg-kanban-dropdown-bg dark:bg-[#20212C] rounded-lg shadow-dropdown py-2 z-10 transition-colors">
              {currentBoard?.columns?.map(col => (
                <li
                  key={col.name}
                  onClick={() => handleStatusChange(col.name)}
                  className={`px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                    task.status === col.name
                      ? 'text-primary'
                      : 'text-kanban-text-secondary hover:bg-primary-light hover:text-primary'
                  }`}
                >
                  {col.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}