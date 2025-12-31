# Budget Planner

A modern, privacy-first personal budgeting application that runs entirely in the browser with offline support and local IndexedDB storage.

![Budget Planner](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue)

## Features

### 📊 Dashboard
- Total income, expenses, and net balance at a glance
- Expense breakdown pie chart by category
- Spending trend line chart
- Budget progress overview
- Recent transactions quick view

### 💰 Transactions
- Add income and expense transactions
- Categorize with customizable categories
- Multiple payment methods
- Recurring transaction support
- Duplicate and inline delete with undo

### 📁 Categories
- 13 default categories with colors and icons
- Add, edit, and delete custom categories
- Color picker and icon selector
- Per-category budget limits

### 📅 Monthly Budget
- Set budget per category for each month
- Planned vs actual comparison
- Overspending alerts with visual indicators
- Copy budgets from previous month
- Rollover unused budget option

### 📈 Yearly Overview
- Month-by-month comparison chart
- Category totals across the year
- Year-to-date summaries
- Projected year-end savings

### 🎯 Savings Goals
- Create multiple savings goals
- Target amount and date
- Monthly contribution tracking
- Visual progress circles
- On-track/behind-schedule indicators

### 📋 Reports & Insights
- Spending trend analysis
- Top spending categories
- Filter by date range and category
- Export to CSV
- Full JSON backup

### ⚙️ Settings
- Currency selection (USD, EUR, JPY, etc.)
- Light/Dark/System theme
- First day of financial month
- High contrast mode
- Large text mode
- Backup/Restore data
- Reset all data

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tooling
- **Tailwind CSS** - Styling
- **Dexie.js** - IndexedDB wrapper
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ (with npm)

### Installation

```bash
# Navigate to the project directory
cd BudgetManager

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Sidebar, Header, Layout
│   ├── dashboard/       # Dashboard widgets
│   ├── transactions/    # Transaction components
│   ├── categories/      # Category components
│   ├── savings/         # Savings goal components
│   └── common/          # Shared components
├── db/
│   ├── database.ts      # Dexie database setup
│   ├── schema.ts        # TypeScript interfaces
│   └── seeds.ts         # Default data
├── hooks/               # React hooks for data access
├── pages/               # Page components
├── stores/              # Zustand stores
└── utils/               # Utility functions
```

## Privacy

This app is 100% local-first:
- All data stored in browser's IndexedDB
- No external API calls
- No authentication required
- Works offline
- Your financial data never leaves your device

## License

MIT
