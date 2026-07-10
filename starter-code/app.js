/* ============ DATA ============ */
let data = null;
let currentBoardIndex = 0;
let editingTask = null; // { boardIndex, columnIndex, taskIndex }
let editingBoard = false;
let deleteTarget = null; // { type: 'board' | 'task', boardIndex?, columnIndex?, taskIndex? }

const COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#EA5555', '#A8A4FF', '#FF9898', '#FFC700'];

// Load data
async function loadData() {
  let stored;
  try {
    stored = localStorage.getItem('kanban-data');
  } catch (e) {
    // localStorage unavailable (private browsing, storage quota exceeded)
    console.warn('localStorage not available:', e);
  }
  if (stored) {
    try {
      data = JSON.parse(stored);
    } catch (e) {
      // Corrupted data — reset to seed
      stored = null;
    }
  }
  if (!stored) {
    try {
      const res = await fetch('data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
      saveData();
    } catch (e) {
      console.error('Failed to load data:', e);
      data = { boards: [] };
    }
  }
}

function saveData() {
  try {
    localStorage.setItem('kanban-data', JSON.stringify(data));
  } catch (e) {
    // Storage full or unavailable — silently degrade
    console.warn('Failed to save data:', e);
  }
}

/* ============ DOM REFS ============ */
const $ = (id) => document.getElementById(id);

const sidebar = $('sidebar');
const sidebarOverlay = $('sidebarOverlay');
const boardList = $('boardList');
const boardCount = $('boardCount');
const createBoardBtn = $('createBoardBtn');
const hideSidebarBtn = $('hideSidebarBtn');
const showSidebarBtn = $('showSidebarBtn');
const themeToggle = $('themeToggle');
const headerBoardName = $('headerBoardName');
const headerBoardNameMobile = $('headerBoardNameMobile');
const columnsContainer = $('columnsContainer');
const boardView = $('boardView');
const emptyBoard = $('emptyBoard');
const addTaskBtn = $('addTaskBtn');
const addColumnBtn = $('addColumnBtn');
const headerMenuBtn = $('headerMenuBtn');
const headerDropdown = $('headerDropdown');
const editBoardBtn = $('editBoardBtn');
const deleteBoardBtn = $('deleteBoardBtn');
const mobileMenuBtn = $('mobileMenuBtn');
const mobileDrawer = $('mobileDrawer');
const mobileBoardList = $('mobileBoardList');
const mobileBoardCount = $('mobileBoardCount');
const mobileCreateBoardBtn = $('mobileCreateBoardBtn');

// Task Modal
const taskModal = $('taskModal');
const taskModalTitle = $('taskModalTitle');
const taskForm = $('taskForm');
const taskTitle = $('taskTitle');
const taskTitleError = $('taskTitleError');
const taskDescription = $('taskDescription');
const subtasksList = $('subtasksList');
const addSubtaskBtn = $('addSubtaskBtn');
const taskStatus = $('taskStatus');
const taskStatusTrigger = $('taskStatusTrigger');
const taskStatusText = $('taskStatusText');
const taskStatusOptions = $('taskStatusOptions');
const taskSubmitBtn = $('taskSubmitBtn');

// View Task Modal
const viewTaskModal = $('viewTaskModal');
const viewTaskTitle = $('viewTaskTitle');
const viewTaskDescription = $('viewTaskDescription');
const viewSubtasksLabel = $('viewSubtasksLabel');
const subtasksCheckList = $('subtasksCheckList');
const viewTaskMenuBtn = $('viewTaskMenuBtn');
const viewTaskDropdown = $('viewTaskDropdown');
const editTaskBtn = $('editTaskBtn');
const deleteTaskBtn = $('deleteTaskBtn');
const viewTaskStatusTrigger = $('viewTaskStatusTrigger');
const viewTaskStatusText = $('viewTaskStatusText');
const viewTaskStatusOptions = $('viewTaskStatusOptions');

// Board Modal
const boardModal = $('boardModal');
const boardModalTitle = $('boardModalTitle');
const boardForm = $('boardForm');
const boardName = $('boardName');
const boardNameError = $('boardNameError');
const columnsList = $('columnsList');
const addColumnFieldBtn = $('addColumnFieldBtn');
const boardSubmitBtn = $('boardSubmitBtn');

// Delete Modal
const deleteModal = $('deleteModal');
const deleteModalTitle = $('deleteModalTitle');
const deleteModalText = $('deleteModalText');
const deleteConfirmBtn = $('deleteConfirmBtn');
const deleteCancelBtn = $('deleteCancelBtn');

/* ============ THEME ============ */
function getTheme() {
  try {
    return localStorage.getItem('kanban-theme') || 'light';
  } catch {
    return 'light';
  }
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    themeToggle.checked = true;
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeToggle.checked = false;
  }
  try {
    localStorage.setItem('kanban-theme', theme);
  } catch (e) {
    console.warn('Failed to save theme:', e);
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  setTheme(isDark ? 'light' : 'dark');
}

themeToggle.addEventListener('change', toggleTheme);

/* ============ SIDEBAR ============ */
function toggleSidebar(show) {
  if (show === undefined) {
    sidebar.classList.toggle('hidden');
  } else if (show) {
    sidebar.classList.remove('hidden');
    showSidebarBtn.classList.remove('visible');
  } else {
    sidebar.classList.add('hidden');
    showSidebarBtn.classList.add('visible');
  }
  try {
    localStorage.setItem('kanban-sidebar', sidebar.classList.contains('hidden') ? 'hidden' : 'visible');
  } catch (e) {
    console.warn('Failed to save sidebar state:', e);
  }
}

function initSidebar() {
  let state;
  try {
    state = localStorage.getItem('kanban-sidebar');
  } catch {
    state = null;
  }
  if (state === 'hidden') {
    toggleSidebar(false);
  }
}

hideSidebarBtn.addEventListener('click', () => toggleSidebar(false));
showSidebarBtn.addEventListener('click', () => toggleSidebar(true));

/* ============ MOBILE DRAWER ============ */
mobileMenuBtn.addEventListener('click', () => {
  mobileDrawer.classList.toggle('open');
  sidebarOverlay.classList.toggle('open');
});

sidebarOverlay.addEventListener('click', () => {
  mobileDrawer.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  closeAllDropdowns();
});

/* ============ DROPDOWNS ============ */
function closeAllDropdowns() {
  headerDropdown.classList.remove('open');
  viewTaskDropdown.classList.remove('open');
  taskStatusOptions.classList.remove('open');
  viewTaskStatusOptions.classList.remove('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.header-menu-container')) {
    headerDropdown.classList.remove('open');
    viewTaskDropdown.classList.remove('open');
  }
  if (!e.target.closest('.custom-select')) {
    taskStatusOptions.classList.remove('open');
    viewTaskStatusOptions.classList.remove('open');
  }
});

headerMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  headerDropdown.classList.toggle('open');
  viewTaskDropdown.classList.remove('open');
});

viewTaskMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  viewTaskDropdown.classList.toggle('open');
  headerDropdown.classList.remove('open');
});

/* ============ CUSTOM SELECT ============ */
function setupCustomSelect(trigger, optionsEl, hiddenInput, textEl, onChange) {
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = optionsEl.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      optionsEl.classList.add('open');
    }
  });

  optionsEl.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const value = li.dataset.value;
    const text = li.textContent;
    hiddenInput.value = value;
    textEl.textContent = text;
    optionsEl.querySelectorAll('li').forEach(l => l.classList.remove('selected'));
    li.classList.add('selected');
    optionsEl.classList.remove('open');
    if (onChange) onChange(value);
  });
}

/* ============ RENDER BOARDS ============ */
function render() {
  if (!data || !data.boards.length) {
    headerBoardName.textContent = 'No boards';
    headerBoardNameMobile.textContent = 'No boards';
    boardView.classList.remove('visible');
    emptyBoard.classList.add('visible');
    addTaskBtn.disabled = true;
    renderBoardList();
    return;
  }

  const board = data.boards[currentBoardIndex];
  if (!board) {
    currentBoardIndex = 0;
    render();
    return;
  }

  headerBoardName.textContent = board.name;
  headerBoardNameMobile.textContent = board.name;
  boardCount.textContent = `All Boards (${data.boards.length})`;
  mobileBoardCount.textContent = `All Boards (${data.boards.length})`;

  // Add task enabled only if there are columns
  addTaskBtn.disabled = !board.columns || board.columns.length === 0;

  renderBoardList();

  if (!board.columns || board.columns.length === 0) {
    boardView.classList.remove('visible');
    emptyBoard.classList.add('visible');
    return;
  }

  boardView.classList.add('visible');
  emptyBoard.classList.remove('visible');

  columnsContainer.innerHTML = '';
  board.columns.forEach((column, colIdx) => {
    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.dataset.columnIndex = colIdx;

    const color = COLORS[colIdx % COLORS.length];

    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `
      <span class="column-dot" style="background: ${color}"></span>
      <span>${column.name}</span>
      <span class="column-count">(${column.tasks.length})</span>
    `;
    colEl.appendChild(header);

    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'column-tasks';
    tasksContainer.dataset.columnIndex = colIdx;

    // Drag and drop events
    tasksContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      tasksContainer.classList.add('drag-over');
    });

    tasksContainer.addEventListener('dragleave', () => {
      tasksContainer.classList.remove('drag-over');
    });

    tasksContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      tasksContainer.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;
      const [bIdx, cIdx, tIdx] = taskId.split('-').map(Number);
      if (bIdx !== currentBoardIndex) return;
      if (bIdx === currentBoardIndex && cIdx === colIdx) {
        // Re-order within the same column
        const dropTarget = e.target.closest('.task-card');
        if (dropTarget) {
          const dropIdx = Array.from(tasksContainer.children).indexOf(dropTarget);
          if (dropIdx !== -1 && dropIdx !== tIdx) {
            reorderTask(colIdx, tIdx, dropIdx);
          }
        }
        return;
      }
      if (bIdx !== undefined && cIdx !== undefined && tIdx !== undefined) {
        moveTask(bIdx, cIdx, tIdx, colIdx);
      }
    });

    column.tasks.forEach((task, taskIdx) => {
      const card = createTaskCard(task, colIdx, taskIdx);
      tasksContainer.appendChild(card);
    });

    colEl.appendChild(tasksContainer);
    columnsContainer.appendChild(colEl);
  });

  // Add column placeholder
  const addCol = document.createElement('div');
  addCol.className = 'add-column';
  const addColBtn = document.createElement('button');
  addColBtn.className = 'add-column-btn';
  addColBtn.textContent = '+ New Column';
  addColBtn.addEventListener('click', () => {
    openBoardModal(true);
  });
  addCol.appendChild(addColBtn);
  columnsContainer.appendChild(addCol);
}

function createTaskCard(task, colIdx, taskIdx) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;

  const completed = task.subtasks.filter(s => s.isCompleted).length;
  const total = task.subtasks.length;

  card.innerHTML = `
    <h3>${escapeHtml(task.title)}</h3>
    <p class="subtask-count">${completed} of ${total} subtasks</p>
  `;

  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', `${currentBoardIndex}-${colIdx}-${taskIdx}`);
    card.classList.add('dragging');
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });

  card.addEventListener('click', () => {
    openViewTaskModal(colIdx, taskIdx);
  });

  return card;
}

function renderBoardList() {
  const renderList = (listEl, countEl, clickHandler) => {
    listEl.innerHTML = '';
    if (!data) return;
    data.boards.forEach((board, idx) => {
      const item = document.createElement('div');
      item.className = 'board-item' + (idx === currentBoardIndex ? ' active' : '');
      item.innerHTML = `<img src="assets/icon-board.svg" alt="" aria-hidden="true"><span>${escapeHtml(board.name)}</span>`;
      item.addEventListener('click', () => clickHandler(idx));
      listEl.appendChild(item);
    });
  };

  const switchBoard = (idx) => {
    currentBoardIndex = idx;
    mobileDrawer.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    render();
  };

  renderList(boardList, boardCount, switchBoard);
  renderList(mobileBoardList, mobileBoardCount, switchBoard);
}

/* ============ ESCAPE HTML ============ */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ============ TASK MODAL ============ */
function openTaskModal(editColIdx, editTaskIdx) {
  editingTask = null;
  taskModalTitle.textContent = 'Add New Task';
  taskSubmitBtn.textContent = 'Create Task';
  taskForm.reset();
  taskTitle.classList.remove('error');
  taskTitleError.style.display = 'none';

  // Reset subtasks
  subtasksList.innerHTML = '';
  addSubtaskField('', false);

  // Populate status options
  const board = data.boards[currentBoardIndex];
  populateTaskStatusOptions(board);

  if (editColIdx !== undefined && editTaskIdx !== undefined) {
    // Edit mode
    editingTask = { boardIndex: currentBoardIndex, columnIndex: editColIdx, taskIndex: editTaskIdx };
    const task = board.columns[editColIdx].tasks[editTaskIdx];
    taskModalTitle.textContent = 'Edit Task';
    taskSubmitBtn.textContent = 'Save Changes';
    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskStatus.value = task.status;
    taskStatusText.textContent = task.status;

    subtasksList.innerHTML = '';
    task.subtasks.forEach(st => addSubtaskField(st.title, true));
    if (task.subtasks.length === 0) addSubtaskField('', false);

    // Select the correct status option
    taskStatusOptions.querySelectorAll('li').forEach(li => {
      li.classList.toggle('selected', li.dataset.value === task.status);
    });
  }

  taskModal.classList.add('open');
}

function populateTaskStatusOptions(board) {
  taskStatusOptions.innerHTML = '';
  board.columns.forEach(col => {
    const li = document.createElement('li');
    li.dataset.value = col.name;
    li.textContent = col.name;
    taskStatusOptions.appendChild(li);
  });
  // Set first column as default
  if (board.columns.length > 0) {
    taskStatus.value = board.columns[0].name;
    taskStatusText.textContent = board.columns[0].name;
    taskStatusOptions.querySelector('li').classList.add('selected');
  }
}

function addSubtaskField(value = '', focus = true) {
  const field = document.createElement('div');
  field.className = 'subtask-field';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'e.g. Make coffee';
  input.value = value;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-field-btn';
  removeBtn.innerHTML = `<img src="assets/icon-cross.svg" alt="Remove">`;
  removeBtn.addEventListener('click', () => {
    field.remove();
  });

  field.appendChild(input);
  field.appendChild(removeBtn);
  subtasksList.appendChild(field);
  if (focus) input.focus();
}

addSubtaskBtn.addEventListener('click', () => addSubtaskField('', true));

// Task form submission
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Validate title
  if (!taskTitle.value.trim()) {
    taskTitle.classList.add('error');
    taskTitleError.style.display = 'block';
    return;
  }
  taskTitle.classList.remove('error');
  taskTitleError.style.display = 'none';

  const board = data.boards[currentBoardIndex];
  const subtaskInputs = subtasksList.querySelectorAll('input[type="text"]');
  const subtasks = [];
  subtaskInputs.forEach(inp => {
    if (inp.value.trim()) {
      subtasks.push({ title: inp.value.trim(), isCompleted: false });
    }
  });

  const taskData = {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    status: taskStatus.value,
    subtasks
  };

  if (editingTask) {
    // Update existing task
    const { columnIndex, taskIndex } = editingTask;
    const oldStatus = board.columns[columnIndex].tasks[taskIndex].status;
    const newStatus = taskStatus.value;

    // Preserve completion data for subtasks that still exist
    const oldTask = board.columns[columnIndex].tasks[taskIndex];
    taskData.subtasks = taskData.subtasks.map(st => {
      const old = oldTask.subtasks.find(o => o.title === st.title);
      return { ...st, isCompleted: old ? old.isCompleted : false };
    });

    if (oldStatus === newStatus) {
      board.columns[columnIndex].tasks[taskIndex] = taskData;
    } else {
      // Remove from old column, add to new
      board.columns[columnIndex].tasks.splice(taskIndex, 1);
      const newColIdx = board.columns.findIndex(c => c.name === newStatus);
      if (newColIdx !== -1) {
        board.columns[newColIdx].tasks.push(taskData);
      }
    }
  } else {
    // Add new task
    const colIdx = board.columns.findIndex(c => c.name === taskStatus.value);
    if (colIdx !== -1) {
      board.columns[colIdx].tasks.push(taskData);
    }
  }

  saveData();
  closeModal(taskModal);
  render();
});

/* ============ VIEW TASK MODAL ============ */
let viewTaskColIdx = 0;
let viewTaskIdx = 0;

function openViewTaskModal(colIdx, taskIdx) {
  viewTaskColIdx = colIdx;
  viewTaskIdx = taskIdx;
  const board = data.boards[currentBoardIndex];
  const task = board.columns[colIdx].tasks[taskIdx];
  if (!task) return;

  viewTaskTitle.textContent = task.title;
  viewTaskDescription.textContent = task.description || 'No description';
  viewTaskDropdown.classList.remove('open');

  // Subtasks
  const completed = task.subtasks.filter(s => s.isCompleted).length;
  viewSubtasksLabel.textContent = `Subtasks (${completed} of ${task.subtasks.length})`;
  subtasksCheckList.innerHTML = '';

  task.subtasks.forEach((st, stIdx) => {
    const item = document.createElement('div');
    item.className = 'subtask-check-item' + (st.isCompleted ? ' completed' : '');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = st.isCompleted;
    cb.id = `subtask-${stIdx}`;
    cb.addEventListener('change', () => {
      task.subtasks[stIdx].isCompleted = cb.checked;
      saveData();
      render();
      // update view
      const newCompleted = task.subtasks.filter(s => s.isCompleted).length;
      viewSubtasksLabel.textContent = `Subtasks (${newCompleted} of ${task.subtasks.length})`;
      item.classList.toggle('completed', cb.checked);
    });
    const label = document.createElement('label');
    label.htmlFor = `subtask-${stIdx}`;
    label.textContent = st.title;

    item.appendChild(cb);
    item.appendChild(label);
    subtasksCheckList.appendChild(item);
  });

  // Status options
  viewTaskStatusOptions.innerHTML = '';
  board.columns.forEach(col => {
    const li = document.createElement('li');
    li.dataset.value = col.name;
    li.textContent = col.name;
    if (col.name === task.status) li.classList.add('selected');
    viewTaskStatusOptions.appendChild(li);
  });
  viewTaskStatusText.textContent = task.status;

  viewTaskModal.classList.add('open');
}

// Edit task from view modal
editTaskBtn.addEventListener('click', () => {
  closeModal(viewTaskModal);
  openTaskModal(viewTaskColIdx, viewTaskIdx);
});

// Delete task from view modal
deleteTaskBtn.addEventListener('click', () => {
  closeModal(viewTaskModal);
  const board = data.boards[currentBoardIndex];
  const task = board.columns[viewTaskColIdx].tasks[viewTaskIdx];
  openDeleteModal('task', task.title, () => {
    board.columns[viewTaskColIdx].tasks.splice(viewTaskIdx, 1);
    saveData();
    render();
  });
});

/* ============ BOARD MODAL ============ */
function openBoardModal(edit = false) {
  editingBoard = edit;
  const board = data.boards[currentBoardIndex];

  if (edit && board) {
    boardModalTitle.textContent = 'Edit Board';
    boardSubmitBtn.textContent = 'Save Changes';
    boardName.value = board.name;
    boardName.classList.remove('error');
    boardNameError.style.display = 'none';

    columnsList.innerHTML = '';
    board.columns.forEach(col => {
      addColumnField(col.name);
    });
  } else {
    boardModalTitle.textContent = 'Add New Board';
    boardSubmitBtn.textContent = 'Create New Board';
    boardName.value = '';
    boardName.classList.remove('error');
    boardNameError.style.display = 'none';

    columnsList.innerHTML = '';
    addColumnField('Todo');
    addColumnField('Doing');
    addColumnField('Done');
  }

  closeAllDropdowns();
  boardModal.classList.add('open');
}

function addColumnField(value = '') {
  const field = document.createElement('div');
  field.className = 'column-field';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'e.g. In Progress';
  input.value = value;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-field-btn';
  removeBtn.innerHTML = `<img src="assets/icon-cross.svg" alt="Remove">`;
  removeBtn.addEventListener('click', () => {
    field.remove();
  });

  field.appendChild(input);
  field.appendChild(removeBtn);
  columnsList.appendChild(field);
}

addColumnFieldBtn.addEventListener('click', () => addColumnField(''));

// Board form submission
boardForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!boardName.value.trim()) {
    boardName.classList.add('error');
    boardNameError.style.display = 'block';
    return;
  }
  boardName.classList.remove('error');
  boardNameError.style.display = 'none';

  const colInputs = columnsList.querySelectorAll('input[type="text"]');
  const columns = [];
  colInputs.forEach(inp => {
    if (inp.value.trim()) {
      columns.push({ name: inp.value.trim(), tasks: [] });
    }
  });

  if (columns.length === 0) return;

  if (editingBoard) {
    const board = data.boards[currentBoardIndex];

    // Preserve tasks for columns that still exist
    const newColumns = columns.map(col => {
      const existing = board.columns.find(c => c.name === col.name);
      return existing || col;
    });

    // Move tasks from removed columns to first available column (or discard)
    const removedTasks = [];
    board.columns.forEach(col => {
      if (!columns.find(c => c.name === col.name)) {
        removedTasks.push(...col.tasks);
      }
    });
    if (removedTasks.length > 0 && newColumns.length > 0) {
      newColumns[0].tasks.push(...removedTasks);
    }

    board.name = boardName.value.trim();
    board.columns = newColumns;
  } else {
    data.boards.push({
      name: boardName.value.trim(),
      columns
    });
    currentBoardIndex = data.boards.length - 1;
  }

  saveData();
  closeModal(boardModal);
  render();
});

/* ============ DELETE MODAL ============ */
function openDeleteModal(type, name, onConfirm) {
  deleteTarget = { type, onConfirm };
  if (type === 'board') {
    deleteModalTitle.textContent = 'Delete this board?';
    deleteModalText.textContent = `Are you sure you want to delete the '${name}' board? This action will remove all columns and tasks and cannot be reversed.`;
  } else {
    deleteModalTitle.textContent = 'Delete this task?';
    deleteModalText.textContent = `Are you sure you want to delete the '${name}' task? This action cannot be reversed.`;
  }
  deleteModal.classList.add('open');
}

deleteConfirmBtn.addEventListener('click', () => {
  if (!deleteTarget) return;
  deleteTarget.onConfirm();
  closeModal(deleteModal);
  deleteTarget = null;
});

deleteCancelBtn.addEventListener('click', () => {
  closeModal(deleteModal);
  deleteTarget = null;
});

/* ============ BOARD HEADER ACTIONS ============ */
editBoardBtn.addEventListener('click', () => {
  headerDropdown.classList.remove('open');
  openBoardModal(true);
});

deleteBoardBtn.addEventListener('click', () => {
  headerDropdown.classList.remove('open');
  if (!data.boards[currentBoardIndex]) return;
  openDeleteModal('board', data.boards[currentBoardIndex].name, () => {
    data.boards.splice(currentBoardIndex, 1);
    if (currentBoardIndex >= data.boards.length) {
      currentBoardIndex = Math.max(0, data.boards.length - 1);
    }
    saveData();
    render();
  });
});

/* ============ ADD TASK / COLUMN ============ */
addTaskBtn.addEventListener('click', () => openTaskModal());

addColumnBtn.addEventListener('click', () => {
  openBoardModal(true);
});

createBoardBtn.addEventListener('click', () => {
  openBoardModal(false);
});

mobileCreateBoardBtn.addEventListener('click', () => {
  mobileDrawer.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  openBoardModal(false);
});

/* ============ MODAL HELPERS ============ */
function closeModal(modal) {
  modal.classList.remove('open');
  headerDropdown.classList.remove('open');
  viewTaskDropdown.classList.remove('open');
  taskStatusOptions.classList.remove('open');
  viewTaskStatusOptions.classList.remove('open');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay);
    }
  });
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m));
    mobileDrawer.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    closeAllDropdowns();
  }
});

/* ============ MOVE TASK (DRAG & DROP) ============ */
function moveTask(fromBoardIdx, fromColIdx, fromTaskIdx, toColIdx) {
  if (fromBoardIdx !== currentBoardIndex) return;
  const board = data.boards[currentBoardIndex];
  const task = board.columns[fromColIdx].tasks[fromTaskIdx];
  if (!task) return;

  task.status = board.columns[toColIdx].name;
  board.columns[fromColIdx].tasks.splice(fromTaskIdx, 1);
  board.columns[toColIdx].tasks.push(task);

  saveData();
  render();
}

function reorderTask(colIdx, fromIdx, toIdx) {
  const board = data.boards[currentBoardIndex];
  const tasks = board.columns[colIdx].tasks;
  const [task] = tasks.splice(fromIdx, 1);
  // When fromIdx < toIdx, the array shifts left after removal,
  // so the correct insertion point is toIdx - 1
  const adjustedTo = fromIdx < toIdx ? toIdx - 1 : toIdx;
  tasks.splice(adjustedTo, 0, task);
  saveData();
  render();
}

/* ============ SETUP CUSTOM SELECTS ============ */
setupCustomSelect(taskStatusTrigger, taskStatusOptions, taskStatus, taskStatusText);

// Setup view task status select (once, not on every modal open)
setupCustomSelect(viewTaskStatusTrigger, viewTaskStatusOptions, { value: '' }, viewTaskStatusText, (value) => {
  const board = data.boards[currentBoardIndex];
  if (!board) return;
  const task = board.columns[viewTaskColIdx]?.tasks[viewTaskIdx];
  if (!task) return;

  const oldStatus = task.status;
  if (oldStatus === value) return;

  task.status = value;
  const taskData = board.columns[viewTaskColIdx].tasks.splice(viewTaskIdx, 1)[0];
  const newColIdx = board.columns.findIndex(c => c.name === value);
  if (newColIdx !== -1) {
    board.columns[newColIdx].tasks.push(taskData);
  }

  saveData();
  render();
  // Re-open view modal for the task in its new position
  const newTaskIdx = board.columns[newColIdx].tasks.length - 1;
  openViewTaskModal(newColIdx, newTaskIdx);
});

/* ============ INIT ============ */
async function init() {
  setTheme(getTheme());
  await loadData();
  initSidebar();
  render();
}

init();
