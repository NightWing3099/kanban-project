import { useState, type FormEvent } from 'react';
import { useKanban } from '../context/KanbanContext';
import type { Board, Column } from '../types';

interface BoardModalContentProps {
  closeModal: () => void;
  isEdit: boolean;
  currentBoard: Board | null;
  addBoard: (b: Board) => void;
  updateBoard: (b: Partial<Board> & { columns?: Column[] }) => void;
}

export default function BoardModal() {
  const { activeModal, modalData, closeModal, currentBoard, addBoard, updateBoard } = useKanban();

  if (activeModal !== 'board') return null;

  const isEdit = !!(modalData?.edit && currentBoard);

  return (
    <div
      className="fixed inset-0 bg-kanban-overlay z-[1000] flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeModal}
    >
      <BoardModalContent
        closeModal={closeModal}
        isEdit={isEdit}
        currentBoard={currentBoard}
        addBoard={addBoard}
        updateBoard={updateBoard}
      />
    </div>
  );
}

function BoardModalContent({ closeModal, isEdit, currentBoard, addBoard, updateBoard }: BoardModalContentProps) {
  const [name, setName] = useState(currentBoard?.name || '');
  const [columns, setColumns] = useState<string[]>(
    isEdit && currentBoard?.columns
      ? currentBoard.columns.map(c => c.name)
      : ['Todo', 'Doing', 'Done']
  );
  const [nameError, setNameError] = useState(false);

  const addColumn = () => {
    setColumns([...columns, '']);
  };

  const removeColumn = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const updateColumn = (idx: number, value: string) => {
    const updated = [...columns];
    updated[idx] = value;
    setColumns(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const validColumns = columns.filter(c => c.trim());
    if (validColumns.length === 0) return;

    if (isEdit) {
      // Preserve tasks for columns that still exist
      const newColumns: Column[] = validColumns.map(colName => {
        const existing = currentBoard!.columns.find(c => c.name === colName);
        return existing || { name: colName, tasks: [] };
      });

      // Move tasks from removed columns to first column
      const removedTasks: typeof newColumns[0]['tasks'] = [];
      currentBoard!.columns.forEach(col => {
        if (!validColumns.includes(col.name)) {
          removedTasks.push(...col.tasks);
        }
      });
      if (removedTasks.length > 0 && newColumns.length > 0) {
        newColumns[0].tasks.push(...removedTasks);
      }

      updateBoard({ name: name.trim(), columns: newColumns });
    } else {
      addBoard({
        name: name.trim(),
        columns: validColumns.map(c => ({ name: c, tasks: [] })),
      });
    }

    closeModal();
  };

  return (
    <div
      className="bg-white dark:bg-[#2B2C37] rounded-lg p-8 w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-modal transition-colors max-md:p-6 max-md:mx-2"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-lg text-kanban-text-primary dark:text-white">
          {isEdit ? 'Edit Board' : 'Add New Board'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Board Name */}
        <div className="mb-6 relative">
          <label className="block text-heading-sm text-kanban-text-secondary mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError(false); }}
            placeholder="e.g. Web Design"
            className={`w-full px-4 py-2.5 bg-white dark:bg-[#2B2C37] border rounded text-[13px] text-kanban-text-primary dark:text-white outline-none transition-colors placeholder:text-kanban-text-secondary/40 ${
              nameError ? 'border-danger' : 'border-kanban-input-border focus:border-primary'
            }`}
          />
          {nameError && (
            <span className="absolute right-4 top-1/2 translate-y-[-0%] text-[13px] text-danger">
              Can't be empty
            </span>
          )}
        </div>

        {/* Columns */}
        <div className="mb-6">
          <label className="block text-heading-sm text-kanban-text-secondary mb-2">
            Columns
          </label>
          <div className="mb-3">
            {columns.map((col, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={col}
                  onChange={e => updateColumn(idx, e.target.value)}
                  placeholder="e.g. In Progress"
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-[#2B2C37] border border-kanban-input-border rounded text-[13px] text-kanban-text-primary dark:text-white outline-none focus:border-primary transition-colors placeholder:text-kanban-text-secondary/40"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(idx)}
                  className="flex items-center justify-center w-6 h-6 hover:opacity-60 transition-opacity"
                >
                  <img src="/assets/icon-cross.svg" alt="Remove" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addColumn}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-3xl text-[13px] font-bold text-primary bg-primary-light hover:bg-primary-light-hover transition-colors"
          >
            + Add New Column
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-3xl text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          {isEdit ? 'Save Changes' : 'Create New Board'}
        </button>
      </form>
    </div>
  );
}