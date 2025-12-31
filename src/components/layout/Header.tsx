import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon,
    Plus,
} from 'lucide-react';
import { useDateStore, MONTH_NAMES } from '../../stores/dateStore';
import { useAppStore } from '../../stores/appStore';
import { useMonthlyTotals } from '../../hooks/useTransactions';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { Button, IconButton } from '../ui/Button';
import { Select } from '../ui/Select';
import { getYearOptions } from '../../utils/dateUtils';

export function Header() {
    const {
        selectedYear,
        selectedMonth,
        setSelectedMonth,
        setSelectedYear,
        goToPreviousMonth,
        goToNextMonth,
    } = useDateStore();

    const { theme, setTheme, openTransactionModal } = useAppStore();
    const { income, expenses, net } = useMonthlyTotals();
    const { settings } = useSettings();

    const monthOptions = MONTH_NAMES.map((name, index) => ({
        value: index.toString(),
        label: name,
    }));

    const yearOptions = getYearOptions(5).map((year) => ({
        value: year.toString(),
        label: year.toString(),
    }));

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else if (theme === 'dark') {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        } else {
            // System - toggle to light
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between">
            {/* Left: Month/Year Navigation */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <IconButton
                        icon={ChevronLeft}
                        onClick={goToPreviousMonth}
                        aria-label="Previous month"
                    />

                    <div className="flex gap-2">
                        <Select
                            options={monthOptions}
                            value={selectedMonth.toString()}
                            onChange={(value) => setSelectedMonth(parseInt(value))}
                            className="w-32"
                        />
                        <Select
                            options={yearOptions}
                            value={selectedYear.toString()}
                            onChange={(value) => setSelectedYear(parseInt(value))}
                            className="w-24"
                        />
                    </div>

                    <IconButton
                        icon={ChevronRight}
                        onClick={goToNextMonth}
                        aria-label="Next month"
                    />
                </div>
            </div>

            {/* Center: Balance Summary */}
            <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Income
                    </p>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(income, settings)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Expenses
                    </p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(expenses, settings)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Balance
                    </p>
                    <p className={`text-lg font-semibold ${net >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                        {formatCurrency(net, settings)}
                    </p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <IconButton
                    icon={theme === 'dark' ? Sun : Moon}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                />

                <Button
                    icon={Plus}
                    onClick={() => openTransactionModal()}
                    className="hidden sm:flex"
                >
                    Add Transaction
                </Button>
                <IconButton
                    icon={Plus}
                    variant="primary"
                    onClick={() => openTransactionModal()}
                    aria-label="Add transaction"
                    className="sm:hidden"
                />
            </div>
        </header>
    );
}
