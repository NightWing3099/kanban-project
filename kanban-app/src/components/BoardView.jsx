import { useKanban } from '../context/KanbanContext';

export default function BoardView() {
  const { currentBoard, openModal } = useKanban();

  // Empty state — no boards at all
  if (!currentBoard) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center">
        <p className="text-lg font-bold text-kanban-text-secondary max-w-[400px]">
          No boards yet. Create a new board to get started.
        </p>
        <button
          onClick={() => openModal('board')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-3xl text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          + Create New Board
        </button>
      </div>
    );
  }

  // Empty board — no columns
  if (!currentBoard.columns || currentBoard.columns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center">
        <p className="text-lg font-bold text-kanban-text-secondary max-w-[400px]">
          This board is empty. Create a new column to get started.
        </p>
        <button
          onClick={() => openModal('board', { edit: true })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-3xl text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          + Add New Column
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 max-md:p-4 max-sm:p-3">
      <div className="flex gap-6 h-full min-h-0 max-md:gap-4">
        {currentBoard.columns.map((column, colIdx) => (
          <Column key={colIdx} column={column} colIdx={colIdx} />
        ))}
        <NewColumnButton />
      </div>
    </div>
  );
}

function Column({ column, colIdx }) {
  const { COLORS, moveTask, currentBoardIndex } = useKanban();
  const color = COLORS[colIdx % COLORS.length];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-primary/5', 'rounded-lg');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-primary/5', 'rounded-lg');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/5', 'rounded-lg');
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    const [bIdx, fromColIdx, fromTaskIdx] = raw.split('-').map(Number);
    if (bIdx !== currentBoardIndex) return;

    if (fromColIdx === colIdx) {
      // Reorder within same column
      const targetCard = e.target.closest('[data-task-idx]');
      if (targetCard) {
        const dropIdx = parseInt(targetCard.dataset.taskIdx, 10);
        moveTask({ fromColIdx, fromTaskIdx, toColIdx: colIdx, dropIndex: dropIdx });
      }
    } else {
      moveTask({ fromColIdx, fromTaskIdx, toColIdx: colIdx });
    }
  };

  return (
    <div className="min-w-column max-w-column flex-shrink-0 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-[15px] h-[15px] rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-heading-sm text-kanban-text-secondary uppercase">
          {column.name}
        </span>
        <span className="text-heading-sm text-kanban-text-secondary">
          ({column.tasks.length})
        </span>
      </div>

      <div
        className="flex flex-col gap-5 overflow-y-auto flex-1 pb-6 min-h-[100px] transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {column.tasks.map((task, taskIdx) => (
          <TaskCard key={taskIdx} task={task} colIdx={colIdx} taskIdx={taskIdx} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, colIdx, taskIdx }) {
  const { currentBoardIndex, openModal } = useKanban();
  const completed = task.subtasks.filter(s => s.isCompleted).length;
  const total = task.subtasks.length;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', `${currentBoardIndex}-${colIdx}-${taskIdx}`);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  return (
    <div
      data-task-idx={taskIdx}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => openModal('viewTask', { colIdx, taskIdx })}
      className="bg-white dark:bg-[#2B2C37] rounded-lg p-4 shadow-task hover:shadow-task-hover cursor-pointer transition-shadow"
    >
      <h3 className="text-heading-md text-kanban-text-primary dark:text-white mb-2 transition-colors group-hover:text-primary">
        {task.title}
      </h3>
      {total > 0 && (
        <p className="text-xs font-bold text-kanban-text-secondary">
          {completed} of {total} subtasks
        </p>
      )}
    </div>
  );
}

function NewColumnButton() {
  const { openModal } = useKanban();
  return (
    <div className="min-w-column max-w-column flex items-center justify-center mt-10">
      <button
        onClick={() => openModal('board', { edit: true })}
        className="w-full min-h-[200px] rounded-md flex items-center justify-center text-2xl font-bold text-kanban-text-secondary hover:text-primary transition-colors bg-gradient-to-b from-[rgba(233,239,250,0.5)] to-[rgba(233,239,250,0.1)] dark:from-[rgba(43,44,55,0.5)] dark:to-[rgba(43,44,55,0.1)]"
      >
        + New Column
      </button>
    </div>
  );
}