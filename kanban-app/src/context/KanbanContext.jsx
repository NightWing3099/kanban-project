import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import seedData from '../data.json';

const KanbanContext = createContext(null);

const COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#EA5555', '#A8A4FF', '#FF9898', '#FFC700'];

const STORAGE_KEY = 'kanban-data';
const THEME_KEY = 'kanban-theme';
const SIDEBAR_KEY = 'kanban-sidebar';

// ============ INITIAL STATE LOADERS ============

function loadInitialData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.boards)) return parsed;
    }
  } catch { /* ignore */ }
  return seedData;
}

function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'light'; }
  catch { return 'light'; }
}

function loadSidebarState() {
  try { return localStorage.getItem(SIDEBAR_KEY) === 'hidden'; }
  catch { return false; }
}

// ============ REDUCER ============

function reducer(state, action) {
  let draft;
  switch (action.type) {
    // Theme & Sidebar
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarHidden: action.payload !== undefined ? action.payload : !state.sidebarHidden };

    // Board selection
    case 'SELECT_BOARD':
      return { ...state, currentBoardIndex: action.payload };

    // Board CRUD
    case 'ADD_BOARD':
      draft = { ...state.data };
      draft.boards.push(action.payload);
      return { ...state, data: draft, currentBoardIndex: draft.boards.length - 1 };

    case 'UPDATE_BOARD':
      draft = { ...state.data };
      draft.boards[state.currentBoardIndex] = { ...draft.boards[state.currentBoardIndex], ...action.payload };
      return { ...state, data: draft };

    case 'DELETE_BOARD': {
      const idx = action.payload ?? state.currentBoardIndex;
      draft = { ...state.data };
      draft.boards.splice(idx, 1);
      const newIdx = Math.min(idx, draft.boards.length - 1);
      return { ...state, data: draft, currentBoardIndex: newIdx };
    }

    // Task CRUD
    case 'ADD_TASK': {
      draft = JSON.parse(JSON.stringify(state.data));
      const col = draft.boards[state.currentBoardIndex].columns.find(c => c.name === action.payload.status);
      if (col) col.tasks.push(action.payload.task);
      return { ...state, data: draft };
    }

    case 'UPDATE_TASK': {
      const { columnIndex, taskIndex, task, newStatus } = action.payload;
      draft = JSON.parse(JSON.stringify(state.data));
      const board = draft.boards[state.currentBoardIndex];
      if (newStatus && task.status !== newStatus) {
        board.columns[columnIndex].tasks.splice(taskIndex, 1);
        const newCol = board.columns.find(c => c.name === newStatus);
        if (newCol) newCol.tasks.push({ ...task, status: newStatus });
      } else {
        board.columns[columnIndex].tasks[taskIndex] = { ...task };
      }
      return { ...state, data: draft };
    }

    case 'DELETE_TASK': {
      const { colIdx, taskIdx } = action.payload;
      draft = JSON.parse(JSON.stringify(state.data));
      draft.boards[state.currentBoardIndex].columns[colIdx].tasks.splice(taskIdx, 1);
      return { ...state, data: draft };
    }

    case 'MOVE_TASK': {
      const { fromColIdx, fromTaskIdx, toColIdx, dropIndex } = action.payload;
      draft = JSON.parse(JSON.stringify(state.data));
      const board = draft.boards[state.currentBoardIndex];
      const [task] = board.columns[fromColIdx].tasks.splice(fromTaskIdx, 1);
      task.status = board.columns[toColIdx].name;
      if (dropIndex !== undefined && fromColIdx === toColIdx) {
        board.columns[toColIdx].tasks.splice(dropIndex, 0, task);
      } else {
        board.columns[toColIdx].tasks.push(task);
      }
      return { ...state, data: draft };
    }

    case 'TOGGLE_SUBTASK': {
      const { colIdx, taskIdx, subtaskIdx } = action.payload;
      draft = JSON.parse(JSON.stringify(state.data));
      const subtasks = draft.boards[state.currentBoardIndex].columns[colIdx].tasks[taskIdx].subtasks;
      subtasks[subtaskIdx].isCompleted = !subtasks[subtaskIdx].isCompleted;
      return { ...state, data: draft };
    }

    // Modal management
    case 'OPEN_MODAL':
      return { ...state, activeModal: action.payload.name, modalData: action.payload.data || null };
    case 'CLOSE_MODAL':
      return { ...state, activeModal: null, modalData: null };

    default:
      return state;
  }
}

// ============ PROVIDER ============

export function KanbanProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    data: loadInitialData(),
    currentBoardIndex: 0,
    theme: loadTheme(),
    sidebarHidden: loadSidebarState(),
    activeModal: null,
    modalData: null,
  });

  // Persist data
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)); }
    catch { /* ignore */ }
  }, [state.data]);

  // Persist theme & set class
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, state.theme); }
    catch { /* ignore */ }
    const root = document.documentElement;
    root.classList.toggle('dark', state.theme === 'dark');
    root.classList.toggle('light', state.theme === 'light');
  }, [state.theme]);

  // Persist sidebar
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, state.sidebarHidden ? 'hidden' : 'visible'); }
    catch { /* ignore */ }
  }, [state.sidebarHidden]);

  const currentBoard = state.data?.boards[state.currentBoardIndex] || null;

  // Actions
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const toggleSidebar = useCallback((v) => dispatch({ type: 'TOGGLE_SIDEBAR', payload: v }), []);
  const selectBoard = useCallback((i) => dispatch({ type: 'SELECT_BOARD', payload: i }), []);
  const addBoard = useCallback((b) => dispatch({ type: 'ADD_BOARD', payload: b }), []);
  const updateBoard = useCallback((b) => dispatch({ type: 'UPDATE_BOARD', payload: b }), []);
  const deleteBoard = useCallback((i) => dispatch({ type: 'DELETE_BOARD', payload: i }), []);
  const addTask = useCallback((t) => dispatch({ type: 'ADD_TASK', payload: t }), []);
  const updateTask = useCallback((p) => dispatch({ type: 'UPDATE_TASK', payload: p }), []);
  const deleteTask = useCallback((p) => dispatch({ type: 'DELETE_TASK', payload: p }), []);
  const moveTask = useCallback((p) => dispatch({ type: 'MOVE_TASK', payload: p }), []);
  const toggleSubtask = useCallback((p) => dispatch({ type: 'TOGGLE_SUBTASK', payload: p }), []);

  const openModal = useCallback((name, data = null) =>
    dispatch({ type: 'OPEN_MODAL', payload: { name, data } }), []);
  const closeModal = useCallback(() => dispatch({ type: 'CLOSE_MODAL' }), []);

  const value = {
    ...state,
    currentBoard,
    COLORS,
    toggleTheme,
    toggleSidebar,
    selectBoard,
    addBoard,
    updateBoard,
    deleteBoard,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleSubtask,
    openModal,
    closeModal,
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error('useKanban must be used within KanbanProvider');
  return ctx;
}