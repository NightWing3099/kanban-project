export interface Subtask {
  title: string;
  isCompleted: boolean;
}

export interface Task {
  title: string;
  description: string;
  status: string;
  subtasks: Subtask[];
}

export interface Column {
  name: string;
  tasks: Task[];
}

export interface Board {
  name: string;
  columns: Column[];
}

export interface KanbanData {
  boards: Board[];
}

export type ModalName = 'mobileDrawer' | 'task' | 'viewTask' | 'board' | 'deleteBoard' | 'deleteTask';

export interface ModalData {
  edit?: boolean;
  colIdx?: number;
  taskIdx?: number;
  taskTitle?: string;
}

export interface KanbanState {
  data: KanbanData;
  currentBoardIndex: number;
  theme: 'light' | 'dark';
  sidebarHidden: boolean;
  activeModal: ModalName | null;
  modalData: ModalData | null;
  currentBoard: Board | null;
  COLORS: string[];
  toggleTheme: () => void;
  toggleSidebar: (v?: boolean) => void;
  selectBoard: (i: number) => void;
  addBoard: (b: Board) => void;
  updateBoard: (b: Partial<Board> & { columns?: Column[] }) => void;
  deleteBoard: (i?: number) => void;
  addTask: (t: { status: string; task: Task }) => void;
  updateTask: (p: {
    columnIndex: number;
    taskIndex: number;
    task: Task;
    newStatus?: string;
  }) => void;
  deleteTask: (p: { colIdx: number; taskIdx: number }) => void;
  moveTask: (p: {
    fromColIdx: number;
    fromTaskIdx: number;
    toColIdx: number;
    dropIndex?: number;
  }) => void;
  toggleSubtask: (p: { colIdx: number; taskIdx: number; subtaskIdx: number }) => void;
  openModal: (name: ModalName, data?: ModalData | null) => void;
  closeModal: () => void;
}

export type KanbanAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR'; payload?: boolean }
  | { type: 'SELECT_BOARD'; payload: number }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Partial<Board> & { columns?: Column[] } }
  | { type: 'DELETE_BOARD'; payload?: number }
  | { type: 'ADD_TASK'; payload: { status: string; task: Task } }
  | {
      type: 'UPDATE_TASK';
      payload: {
        columnIndex: number;
        taskIndex: number;
        task: Task;
        newStatus?: string;
      };
    }
  | { type: 'DELETE_TASK'; payload: { colIdx: number; taskIdx: number } }
  | {
      type: 'MOVE_TASK';
      payload: {
        fromColIdx: number;
        fromTaskIdx: number;
        toColIdx: number;
        dropIndex?: number;
      };
    }
  | { type: 'TOGGLE_SUBTASK'; payload: { colIdx: number; taskIdx: number; subtaskIdx: number } }
  | { type: 'OPEN_MODAL'; payload: { name: ModalName; data?: ModalData | null } }
  | { type: 'CLOSE_MODAL' };