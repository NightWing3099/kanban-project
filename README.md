# organizeME — Kanban Task Management

A fully responsive, feature-rich kanban board application for organizing projects, tracking tasks, and collaborating with clarity. Built with vanilla HTML, CSS, and JavaScript — no framework overhead, just a fast, accessible experience that works everywhere.

![organizeME preview](./preview.jpg)

---

## Features

- **Board-based organization** — Create multiple boards for different projects, teams, or workflows
- **Drag-and-drop task management** — Reorder tasks within columns or move them between columns to update status
- **Subtasks with progress tracking** — Break work down into subtasks and track completion at a glance
- **Persistent state** — All data is saved to `localStorage` automatically; nothing is lost on refresh
- **Light/dark theme** — Toggle between themes with a persistent preference
- **Collapsible sidebar** — Hide the sidebar for more screen real estate when you need it
- **Responsive design** — Optimized for desktop, tablet, and mobile with a dedicated mobile drawer navigation
- **Full CRUD** — Create, read, update, and delete boards, columns, and tasks with form validation
- **Keyboard accessible** — Full keyboard navigation, Escape to close modals, focus management throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Semantic HTML5 |
| Styling | CSS with custom properties, Flexbox |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | `localStorage` with `data.json` seed data |
| Font | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |

No build tools, no frameworks, no dependencies. Open `index.html` and it works.

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/organizeME.git

# Open in browser
cd organizeME/starter-code
open index.html
```

That's it. The app loads with sample data on first visit and persists all changes locally.

---

## Project Structure

```
starter-code/
├── index.html          # Main HTML document
├── style.css           # All styles (1158 lines)
├── app.js              # Application logic (883 lines)
├── data.json           # Seed data for first load
└── assets/             # Icons, logos, favicon
```

---

## Key Design Decisions

**Vanilla JS over frameworks.** For a focused tool like this, the overhead of React or Vue wasn't justified. The DOM manipulation is straightforward, state is simple enough for a single render function, and the result is a zero-dependency app that loads instantly.

**CSS custom properties for theming.** The entire light/dark theme toggle is driven by swapping custom property values on `.dark-theme`. No duplicate style blocks, no preprocessor required.

**Drag-and-drop with the native HTML5 API.** The `draggable` attribute, `dragstart`/`dragover`/`drop` events, and `dataTransfer` provide everything needed. The reorder logic accounts for the array index shift that occurs when removing an element mid-list — a subtle bug that's easy to miss.

---

## What I'd Do Differently Next Time

- **Undo/redo.** Destructive actions (deleting a board, moving a task) would benefit from an undo stack.
- **Offline-first with IndexedDB.** `localStorage` has a 5MB limit and is synchronous. For a production app with larger datasets, IndexedDB or a lightweight wrapper like Dexie would be the right call.
- **Drag-and-drop on mobile.** The native HTML5 DnD API doesn't work on touch devices. A production version would need a touch-compatible implementation or a library like SortableJS.
- **Unit tests.** The render function and data mutations are prime candidates for test coverage.

---

## License

MIT