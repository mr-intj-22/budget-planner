import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Date Store - Selected month/year for budget views
 * Persisted to localStorage to remember user's last viewed period
 */
interface DateState {
    selectedYear: number;
    selectedMonth: number;  // 0-11

    setSelectedYear: (year: number) => void;
    setSelectedMonth: (month: number) => void;
    setSelectedDate: (year: number, month: number) => void;

    // Navigation helpers
    goToPreviousMonth: () => void;
    goToNextMonth: () => void;
    goToCurrentMonth: () => void;

    // Computed getters
    getMonthName: () => string;
    getMonthYearString: () => string;
    getDateRange: () => { start: Date; end: Date };
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const useDateStore = create<DateState>()(
    persist(
        (set, get) => ({
            selectedYear: new Date().getFullYear(),
            selectedMonth: new Date().getMonth(),

            setSelectedYear: (year) => set({ selectedYear: year }),
            setSelectedMonth: (month) => set({ selectedMonth: month }),
            setSelectedDate: (year, month) => set({ selectedYear: year, selectedMonth: month }),

            goToPreviousMonth: () => {
                const { selectedYear, selectedMonth } = get();
                if (selectedMonth === 0) {
                    set({ selectedYear: selectedYear - 1, selectedMonth: 11 });
                } else {
                    set({ selectedMonth: selectedMonth - 1 });
                }
            },

            goToNextMonth: () => {
                const { selectedYear, selectedMonth } = get();
                if (selectedMonth === 11) {
                    set({ selectedYear: selectedYear + 1, selectedMonth: 0 });
                } else {
                    set({ selectedMonth: selectedMonth + 1 });
                }
            },

            goToCurrentMonth: () => {
                const now = new Date();
                set({ selectedYear: now.getFullYear(), selectedMonth: now.getMonth() });
            },

            getMonthName: () => {
                const monthName = MONTH_NAMES[get().selectedMonth];
                return monthName ?? 'Unknown';
            },

            getMonthYearString: () => {
                const { selectedYear } = get();
                return `${get().getMonthName()} ${selectedYear}`;
            },

            getDateRange: () => {
                const { selectedYear, selectedMonth } = get();
                const start = new Date(selectedYear, selectedMonth, 1);
                const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
                return { start, end };
            },
        }),
        {
            name: 'budget-planner-date',
            partialize: (state) => ({
                selectedYear: state.selectedYear,
                selectedMonth: state.selectedMonth,
            }),
        }
    )
);

// Export month names for use elsewhere
export { MONTH_NAMES };
