import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { useMonthlyTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { getMonthRange } from '../../utils/dateUtils';
import { useDateStore } from '../../stores/dateStore';

export function SpendingLineChart() {
    const { transactions, isLoading } = useMonthlyTransactions();
    const { categories } = useCategories();
    const { selectedYear, selectedMonth } = useDateStore();
    const { settings } = useSettings();

    const dailyData: { day: string; expenses: number; income: number; cumulativeExpenses: number; cumulativeIncome: number; netBalance: number }[] = [];

    // Create set of excluded category IDs
    const excludedCategoryIds = new Set(
        categories.filter(c => c.excludeFromTotals).map(c => c.id)
    );

    let currentExpenses = 0;
    let currentIncome = 0;

    // We can't easily get the startDay here without async or passing it down.
    // However, the transactions come pre-sorted by date from the hook?
    // Actually, hook returns desc sort.
    // The previous loop logic generated empty days too.
    // Ideally we'd get the range from settings again or trust the transactions?
    // But we need to fill gaps (days with 0 spending).
    // Let's rely on the transactions to find the range or assume standard if not provided?
    // No, for the Chart to look right, we need the start date.
    // We can fetch settings or assume default. But since useMonthlyTransactions fetches the right data...
    // Let's use the range of the fetched transactions? No, data might be empty at start/end.

    // Quick fix: Fetch settings via hook or passed prop?
    // Let's use the explicit settings hook for consistency
    const firstDayOfMonth = settings?.firstDayOfMonth ?? 1;
    const { start, end } = getMonthRange(selectedYear, selectedMonth, firstDayOfMonth);

    // Iterate day by day from start to end
    const currentDate = new Date(start);
    while (currentDate <= end) {
        const dateStr = currentDate.toDateString(); // For comparison
        const dayLabel = currentDate.getDate().toString(); // Or "Jan 25"

        const dayTransactions = transactions.filter((t) => {
            const tDate = new Date(t.date);
            return tDate.toDateString() === dateStr && !excludedCategoryIds.has(t.categoryId);
        });

        const dayExpenses = dayTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const dayIncome = dayTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        currentExpenses += dayExpenses;
        currentIncome += dayIncome;
        const netBalance = currentIncome - currentExpenses;

        dailyData.push({
            day: dayLabel, // Just the day number for compactness, or adjust format
            expenses: dayExpenses,
            income: dayIncome,
            cumulativeExpenses: currentExpenses,
            cumulativeIncome: currentIncome,
            netBalance,
        });

        // Next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader title="Spending Over Time" />
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse w-full h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
            </Card>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-medium text-slate-900 dark:text-white mb-1">Day {label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value, settings)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader title="Cash Flow & Spending" subtitle="Cumulative income, expenses, and net balance" />
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            tickLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            tickLine={{ stroke: '#e2e8f0' }}
                            tickFormatter={(value) => formatCurrency(value, settings)}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="cumulativeExpenses"
                            name="Expenses"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="netBalance"
                            name="Net Balance"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
