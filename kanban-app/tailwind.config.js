/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#635FC7',
          hover: '#A8A4FF',
          light: 'rgba(99, 95, 199, 0.1)',
          'light-hover': 'rgba(99, 95, 199, 0.25)',
        },
        danger: {
          DEFAULT: '#EA5555',
          hover: '#FF9898',
        },
        kanban: {
          bg: '#F4F7FD',
          'bg-secondary': '#FFFFFF',
          'bg-sidebar': '#FFFFFF',
          'text-primary': '#000112',
          'text-secondary': '#828FA3',
          border: '#E4EBFA',
          'input-bg': '#FFFFFF',
          'input-border': 'rgba(130, 143, 163, 0.25)',
          overlay: 'rgba(0, 0, 0, 0.5)',
          'checkbox-bg': '#FFFFFF',
          'checkbox-border': 'rgba(130, 143, 163, 0.25)',
          'dropdown-bg': '#FFFFFF',
          'column-bg': '#E4EBFA',
          'task-bg': '#FFFFFF',
          'subtask-bg': '#F4F7FD',
          'subtask-hover': 'rgba(99, 95, 199, 0.25)',
          scrollbar: 'rgba(130, 143, 163, 0.4)',
        },
      },
      fontSize: {
        'body': ['13px', '1.5'],
        'heading-sm': ['12px', { lineHeight: '1.5', letterSpacing: '2.4px', fontWeight: '700' }],
        'heading-md': ['15px', { lineHeight: '1.5', fontWeight: '700' }],
        'heading-lg': ['18px', { lineHeight: '1.5', fontWeight: '700' }],
        'heading-xl': ['24px', { lineHeight: '1.5', fontWeight: '700' }],
      },
      borderRadius: {
        'pill': '100px',
      },
      boxShadow: {
        'task': '0px 4px 6px rgba(54, 78, 126, 0.1)',
        'task-hover': '0px 4px 12px rgba(54, 78, 126, 0.2)',
        'dropdown': '0px 10px 20px rgba(54, 78, 126, 0.25)',
        'modal': '0px 4px 6px rgba(54, 78, 126, 0.1)',
      },
      spacing: {
        'sidebar': '300px',
        'column': '280px',
      },
    },
  },
  plugins: [],
};