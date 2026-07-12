import { useState, useRef, useEffect } from 'react';
import { useKanban } from '../context/KanbanContext';

export default function TaskModal() {
  const { activeModal, modalData, closeModal, currentBoard, addTask, updateTask } = useKanban();

  if (activeModal !== 'task') return null;

  const isEdit = modalData?.edit && modalData?.colIdx !== undefined;
  const colIdx = modalData?.colIdx;
  const taskIdx = modalData?.taskIdx;
  const existingTask = isEdit ? currentBoard?.columns[colIdx]?.tasks[taskIdx] : null;

  return (
    <div className="fixed inset-0 bg-kanban-overlay z-[1000] flex items-center justify-center p-4 overflow-y-auto" onClick={closeModal}>
      <TaskModalContent
        closeModal={closeModal}
        currentBoard={currentBoard}
        existingTask={existingTask}
        colIdx={colIdx}
        taskIdx={taskIdx}
        addTask={addTask}
        updateTask={updateTask}
      />
    </div>
  );
}

function TaskModalContent({ closeModal, currentBoard, existingTask, colIdx, taskIdx, addTask, updateTask }) {
  const isEdit = !!existingTask;
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [status, setStatus] = useState(existingTask?.status || currentBoard?.columns[0]?.name || '');
  const [subtasks, setSubtasks] = useState(
    existingTask ? existingTask.subtasks.map(s => ({ title: s.title, isCompleted: s.isCompleted }))
      : [{ title: '', isCompleted: false }]
  );
  const [selectOpen, setSelectOpen] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setSelectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addSubtaskField = () => {
    setSubtasks([...subtasks, { title: '', isCompleted: false }]);
  };

  const removeSubtaskField = (idx) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const updateSubtask = (idx, value) => {
    const updated = [...subtasks];
    updated[idx] = { ...updated[idx], title: value };
    setSubtasks(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);

    const validSubtasks = subtasks.filter(s => s.title.trim());

    const task = {
      title: title.trim(),
      description: description.trim(),
      status,
      subtasks: validSubtasks.map(s => ({ title: s.title.trim(), isCompleted: s.isCompleted })),
    };

    if (isEdit) {
      updateTask({
        columnIndex: existingTask.index?.colIdx ?? colIdx,
        taskIndex: existingTask.index?.taskIdx ?? taskIdx,
        task,
        newStatus: status !== existingTask.status ? status : undefined,
      });
    } else {
      addTask({ status, task });
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
          {isEdit ? 'Edit Task' : 'Add New Task'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="mb-6 relative">
          <label className="block text-heading-sm text-kanban-text-secondary mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setTitleError(false); }}
            placeholder="e.g. Take coffee break"
            className={`w-full px-4 py-2.5 bg-white dark:bg-[#2B2C37] border rounded text-[13px] text-kanban-text-primary dark:text-white outline-none transition-colors placeholder:text-kanban-text-secondary/40 ${
              titleError ? 'border-danger' : 'border-kanban-input-border focus:border-primary'
            }`}
          />
          {titleError && (
            <span className="absolute right-4 top-1/2 translate-y-[-0%] text-[13px] text-danger">
              Can't be empty
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-heading-sm text-kanban-text-secondary mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
            className="w-full px-4 py-2.5 bg-white dark:bg-[#2B2C37] border border-kanban-input-border rounded text-[13px] text-kanban-text-primary dark:text-white outline-none focus:border-primary transition-colors resize-y min-h-[80px] placeholder:text-kanban-text-secondary/40"
          />
        </div>

        {/* Subtasks */}
        <div className="mb-6">
          <label className="block text-heading-sm text-kanban-text-secondary mb-2">
            Subtasks
          </label>
          <div className="mb-3">
            {subtasks.map((st, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={st.title}
                  onChange={e => updateSubtask(idx, e.target.value)}
                  placeholder="e.g. Make coffee"
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-[#2B2C37] border border-kanban-input-border rounded text-[13px] text-kanban-text-primary dark:text-white outline-none focus:border-primary transition-colors placeholder:text-kanban-text-secondary/40"
                />
                <button
                  type="button"
                  onClick={() => removeSubtaskField(idx)}
                  className="flex items-center justify-center w-6 h-6 hover:opacity-60 transition-opacity"
                >
                  <img src="/assets/icon-cross.svg" alt="Remove" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSubtaskField}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-3xl text-[13px] font-bold text-primary bg-primary-light hover:bg-primary-light-hover transition-colors"
          >
            + Add New Subtask
          </button>
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-heading-sm text-kanban-text-secondary mb-2">
            Status
          </label>
          <div className="relative" ref={selectRef}>
            <button
              type="button"
              onClick={() => setSelectOpen(!selectOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 border border-kanban-input-border rounded text-[13px] text-kanban-text-primary dark:text-white bg-white dark:bg-[#2B2C37] cursor-pointer hover:border-primary transition-colors"
            >
              <span>{status}</span>
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
                    onClick={() => { setStatus(col.name); setSelectOpen(false); }}
                    className={`px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                      status === col.name
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

        <button
          type="submit"
          className="w-full py-3 rounded-3xl text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          {isEdit ? 'Save Changes' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}