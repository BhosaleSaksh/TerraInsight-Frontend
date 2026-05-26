# TeraInsight Operational Planning Dashboard

A professional, high-performance operational planning dashboard designed for analyzing SKU demand, setting operational targets, and tracking week-over-week performance metrics. Built with modern React and Tailwind CSS.

## 🚀 Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run the development server locally:
```bash
npm run dev
```

## ✨ Features Implemented

- **Interactive Demand Grid**: Dynamic table with customizable weekly projections (W1-W8), conditional status tracking, and inline editing.
- **Advanced Filtering & Sorting**: Multi-criteria memoized filtering (search, category, region, status) combined with dynamic column sorting.
- **Analytics KPI Row**: Top-level metric cards summarizing Total Items, Active Items, Total Forecast Demand, and Category segmentation.
- **Smart Detail Panel**: Interactive slide-out drawer providing granular SKU analytics, zero-demand tracking, computed risk statuses, and Recharts-powered trend curves.
- **Accessible Modal Forms**: Robust Add/Edit SKU workflows backed by Zod and React Hook Form, featuring inline validation.
- **UX Polish**: Skeleton loaders, empty search states, responsive tablet/laptop scaling, smooth micro-animations, and keyboard accessibility (Escape/Enter binds).
- **Persistent Storage**: Zustand local storage middleware ensures no data loss across page refreshes.

## 📸 Screenshots

![Dashboard Overview](./docs/screenshots/overview.png)
*(Placeholder: Dashboard Overview)*

![Detail Panel Analytics](./docs/screenshots/detail-panel.png)
*(Placeholder: Detail Drawer & Recharts)*

![Filtering State](./docs/screenshots/filtering.png)
*(Placeholder: Advanced Multi-Select Filtering)*

## 🛠️ Tech Stack

- **Core**: React 19, Vite
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form, Zod
- **Data Visualization**: Recharts

## 📐 Architecture & Engineering

### 1. Component Architecture
The application uses a highly modular UI architecture to maintain separation of concerns:
- **`src/components/grid/`**: Houses the complex `DemandGrid` and `SummaryRow`, prioritizing semantic tables and reactive layout.
- **`src/components/detail/`**: Encapsulates the detail side-drawer, ensuring that chart rendering (`Recharts`) and heavy tracking logic don't block the main table's paint cycle.
- **`src/components/forms/`**: Centralizes robust schema validations and modal layouts for SKU entry.

### 2. State Management (Zustand)
Global state is managed via `zustand` to eliminate prop-drilling and provide a single source of truth for planning matrices.
- The store (`usePlanningStore.js`) encapsulates CRUD actions, filter states, and sorting preferences.
- Uses `persist` middleware to automatically serialize the operational dataset into `localStorage`.

### 3. High-Performance Filtering & Sorting
To guarantee 60fps rendering even with large datasets, the `App.jsx` engine leverages React's `useMemo`:
- Calculates filtering constraints (`search`, `category`, `status`, `region`) in $O(n)$ time.
- Chains sorting algorithms (e.g., dynamic multi-key support for strings, numerics, and weekly indices) inside the *same* memoization block.
- Ensures the data pipeline only recalculates when dependency nodes mutate, avoiding unnecessary re-renders.

## 📁 Folder Structure

```
src/
├── components/          # Reusable UI architecture
│   ├── detail/          # Analytics drawer & charts
│   ├── filters/         # Search & multi-select bars
│   ├── forms/           # Zod validated modals
│   ├── grid/            # Demand table & KPI cards
│   └── layout/          # Dashboard framing & headers
├── data/                # Initial seed data
├── store/               # Zustand global state & persistence
├── utils/               # Pure functions (math & sorting logic)
├── App.jsx              # Application root & data pipelining
└── index.css            # Tailwind directives & global scrollbar configs
```

## Live Demo
https://terra-insight-frontend-six.vercel.app/
