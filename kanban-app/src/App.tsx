import { KanbanProvider, useKanban } from './context/KanbanContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BoardView from './components/BoardView';
import MobileDrawer from './components/MobileDrawer';
import TaskModal from './components/TaskModal';
import ViewTaskModal from './components/ViewTaskModal';
import BoardModal from './components/BoardModal';
import DeleteModal from './components/DeleteModal';

function ShowSidebarButton() {
  const { sidebarHidden, toggleSidebar } = useKanban();
  if (!sidebarHidden) return null;
  return (
    <button
      onClick={() => toggleSidebar(false)}
      className="fixed bottom-8 left-0 w-[56px] h-12 bg-primary hover:bg-primary-hover rounded-r-pill flex items-center justify-center z-50 transition-colors"
    >
      <img src="/assets/icon-show-sidebar.svg" alt="Show sidebar" />
    </button>
  );
}

export default function App() {
  return (
    <KanbanProvider>
      <div className="flex h-screen overflow-hidden bg-kanban-bg dark:bg-[#20212C] text-kanban-text-primary dark:text-white transition-colors font-sans text-[13px]">
        <Sidebar />
        <ShowSidebarButton />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header />
          <BoardView />
        </main>
        <MobileDrawer />
        <TaskModal />
        <ViewTaskModal />
        <BoardModal />
        <DeleteModal />
      </div>
    </KanbanProvider>
  );
}