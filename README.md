# organizeME — Kanban Task Management

A fully responsive, production-grade kanban board application built with **React**, **TypeScript**, and **Tailwind CSS**. Drag-and-drop task management, dark/light theming, persistent local state, and a clean component architecture — designed to demonstrate modern front-end engineering practices.

## Features

- **Board-based organization** — Create and manage multiple project boards with custom columns
- **Drag-and-drop task management** — Native HTML5 drag-and-drop with cross-column status updates and in-column reordering
- **Subtasks with progress tracking** — Break tasks into subtasks with checkbox completion and live progress indicators
- **Persistent state** — All data, theme preference, and sidebar visibility survive page refreshes via `localStorage`
- **Light/dark theme** — Theme toggle with system-class-based Tailwind dark mode and persistent preference
- **Collapsible sidebar** — Hide the desktop sidebar for maximum screen real estate with a show-sidebar affordance
- **Responsive design** — Dedicated mobile drawer navigation, adaptive layouts, and touch-friendly interactions
- **Full CRUD operations** — Create, read, update, and delete boards, columns, and tasks with inline form validation
- **Accessible** — Semantic HTML, ARIA attributes (`role="switch"`, `aria-checked`), keyboard-dismissible modals

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 with functional components and hooks |
| Language | TypeScript (strict mode) |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 with custom theme tokens |
| State Management | `useReducer` + React Context API |
| Type Safety | Full TypeScript types for state, actions, and props |
| Persistence | `localStorage` with JSON seed data fallback |
| Deployment | Netlify with asset hashing and cache headers |
| Font | Plus Jakarta Sans |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/NightWing3099/kanban-project.git

# Install dependencies
cd kanban-project/kanban-app
npm install

# Start development server
npm run dev

# Production build
npm run build
npm run preview
```

The app seeds with sample data on first visit and persists all changes locally via `localStorage`.

## Project Structure

```
kanban-app/
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Root layout + modal composition
│   ├── types.ts                    # TypeScript interfaces & discriminated union types
│   ├── hooks.ts                    # Shared custom hook (useClickOutside)
│   ├── data.json                   # Seed data for first load
│   ├── index.css                   # Tailwind directives + scrollbar + theme utilities
│   ├── context/
│   │   └── KanbanContext.tsx       # Global state via useReducer + Context (234 lines)
│   └── components/
│       ├── BoardView.tsx           # Column layout + drag-and-drop + empty states
│       ├── BoardModal.tsx          # Add/Edit board form with dynamic column management
│       ├── DeleteModal.tsx         # Polymorphic delete confirmation (board or task)
│       ├── Header.tsx              # Top bar with mobile menu trigger + board actions
│       ├── MobileDrawer.tsx        # Slide-out mobile navigation with board list
│       ├── Sidebar.tsx             # Desktop board list + hide sidebar control
│       ├── TaskModal.tsx           # Add/Edit task form with subtask list + status select
│       ├── ThemeToggle.tsx         # Reusable light/dark theme switch (shared by Sidebar + MobileDrawer)
│       └── ViewTaskModal.tsx       # Task detail view with subtask toggles + status change
├── public/assets/                  # SVG icons, logos, favicon
├── index.html                      # Vite HTML entry
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind theme token customization
├── tsconfig.json                   # TypeScript strict mode configuration
└── package.json                    # Dependencies and scripts
```

## Architecture Decisions

### `useReducer` + Context over Redux/Zustand
For this scope, `useReducer` paired with React Context provides sufficient global state management without external dependencies. The reducer handles 14 discrete action types with a discriminated union, giving compile-time exhaustiveness checking. Each action handler uses `structuredClone()` for immutable deep copies — faster and more readable than `JSON.parse(JSON.stringify())`.

### Component-driven modals
Rather than a routing library, modals are controlled by a single `activeModal` state in context. Each modal component returns `null` when not active, keeping the render tree clean. This pattern avoids the complexity of React Router for what is fundamentally a single-page tool with overlay workflows.

### Custom theme tokens in Tailwind
Colors, shadows, font sizes, and spacing are defined as Tailwind theme extensions (e.g., `bg-kanban-bg`, `text-primary`, `shadow-dropdown`). This creates a single source of truth for the design system, keeping markup concise and thematically consistent.

### Shared abstractions
`ThemeToggle` and `useClickOutside` were extracted from duplicated code across the Sidebar, MobileDrawer, Header, TaskModal, and ViewTaskModal components — eliminating ~48 lines of repeated logic. The `DeleteModal` handles both board and task deletions via a polymorphic approach, avoiding two nearly-identical modal components.

### Drag-and-drop with native API
Uses the HTML5 Drag and Drop API with `draggable`, `onDragStart`, `onDragOver`, and `onDrop`. The `dataTransfer` payload carries the board index, source column index, and task index to enable both cross-column moves and in-column reordering (calculating the correct drop index after the source element is removed).

## What I'd Add Next

- **Undo/redo stack** — Destructive actions (board/task deletion, task moves) would benefit from a command-pattern undo history stored in context state
- **Touch drag-and-drop** — Replace the native HTML5 DnD API with a touch-compatible library (e.g., `@dnd-kit/core`) for mobile/tablet users
- **IndexedDB persistence** — Migrate from `localStorage` (5MB limit, synchronous) to IndexedDB via Dexie.js for larger datasets and non-blocking I/O
- **Unit & integration tests** — The reducer is pure-function logic ideal for unit tests; component rendering with React Testing Library and Cypress for drag-and-drop e2e flows
- **Accessibility audit** — While ARIA attributes and keyboard navigation are present, a full WCAG 2.1 audit with a screen reader would identify gaps
- **Framer Motion transitions** — Smooth animations for task moves, modal enter/exit, and sidebar collapse would elevate the UX polish

## License

MIT