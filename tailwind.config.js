/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-slate-800',
    'bg-slate-900',
    'from-slate-800',
    'to-slate-900',
    'text-blue-400',
    'text-red-400',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-blue-600',
    'bg-red-600',
    'bg-purple-600',
    'bg-amber-600',
  ],
  theme: {
    extend: {
      colors: {
        // Difficulty colors
        difficulty: {
          standard: '#3b82f6',  // blue
          normal: '#f59e0b',    // amber
          hard: '#dc2626',      // red
        },
        // Role colors
        role: {
          tank: '#10b981',      // emerald
          dps: '#ef4444',       // red
          support: '#8b5cf6',   // violet
          specialist: '#f59e0b', // amber
        },
        // Tag colors
        tag: {
          undead: '#6366f1',    // indigo
          mech: '#64748b',      // slate
          beast: '#84cc16',     // lime
          holy: '#fbbf24',      // amber
          arcane: '#a855f7',    // purple
          nature: '#22c55e',    // green
        },
        // UI colors
        primary: '#2563eb',
        success: '#16a34a',
        danger: '#ef4444',
        surface: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        border: {
          light: '#e2e8f0',
          dark: '#334155',
        },
      },
      boxShadow: {
        card: '0 4px 14px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      zIndex: {
        bg: '0',
        overlay: '10',
        content: '20',
        hud: '30',
        modal: '40',
        dialog: '50',
        tooltip: '60',
      },
    },
  },
  plugins: [],
}

