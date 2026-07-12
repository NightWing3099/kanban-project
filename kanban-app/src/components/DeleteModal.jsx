import { useKanban } from '../context/KanbanContext';

export default function DeleteModal() {
  const { activeModal, modalData, closeModal, currentBoard, deleteBoard, deleteTask } = useKanban();

  if (activeModal !== 'deleteBoard' && activeModal !== 'deleteTask') return null;

  const handleDelete = () => {
    if (activeModal === 'deleteBoard') {
      deleteBoard();
    } else if (activeModal === 'deleteTask') {
      const { colIdx, taskIdx } = modalData || {};
      deleteTask({ colIdx, taskIdx });
    }
    closeModal();
  };

  const isBoard = activeModal === 'deleteBoard';
  const boardName = currentBoard?.name || '';
  const taskTitle = (() => {
    if (!isBoard && modalData) {
      const { colIdx, taskIdx } = modalData;
      return currentBoard?.columns[colIdx]?.tasks[taskIdx]?.title || '';
    }
    return '';
  })();

  return (
    <div
      className="fixed inset-0 bg-kanban-overlay z-[1000] flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-[#2B2C37] rounded-lg p-8 w-full max-w-[480px] shadow-modal transition-colors max-md:p-6 max-md:mx-2"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-heading-lg text-danger mb-6">
          {isBoard ? 'Delete this board?' : 'Delete this task?'}
        </h2>
        <p className="text-[13px] font-medium text-kanban-text-secondary leading-relaxed mb-6">
          {isBoard
            ? `Are you sure you want to delete the '${boardName}' board? This action will remove all columns and tasks and cannot be reversed.`
            : `Are you sure you want to delete the '${taskTitle}' task? This action cannot be reversed.`
          }
        </p>
        <div className="flex gap-4 max-md:flex-col">
          <button
            onClick={handleDelete}
            className="flex-1 py-3 rounded-3xl text-[13px] font-bold bg-danger text-white hover:bg-danger-hover transition-colors"
          >
            Delete
          </button>
          <button
            onClick={closeModal}
            className="flex-1 py-3 rounded-3xl text-[13px] font-bold text-primary bg-primary-light hover:bg-primary-light-hover transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}