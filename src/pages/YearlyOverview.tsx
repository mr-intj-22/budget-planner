import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { useDateStore, MONTH_NAMES } from '../stores/dateStore';
import { useSettings } from '../hooks/useSettings';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../utils/currency';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';

export function YearlyOverview() {
    const { selectedYear } = useDateStore();
    const { settings } = useSettings();
    const { categories } = useCategories();

    // Get all transactions for the year
    const yearlyData = useLiveQuery(async () => {
        const transactions = await db.getTransactionsForYear(selectedYear);

        // Group by month
        const monthlyData = MONTH_NAMES.map((name, index) => {
            const monthTransactions = transactions.filter(t => {
                const txDate = new Date(t.date);
                return txDate.getMonth() === index;
            });

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                month: name.substring(0, 3),
                income,
                expenses,
                net: income - expenses,
            };
        });

        // Calculate yearly totals
        const yearlyTotals = monthlyData.reduce(
            (acc, m) => ({
                income: acc.income + m.income,
                expenses: acc.expenses + m.expenses,
                net: acc.net + m.net,
            }),
            { income: 0, expenses: 0, net: 0 }
        );

        // Category totals for the year
        const categoryTotals = new Map<number, number>();
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (t.categoryId) {
                    const current = categoryTotals.get(t.categoryId) ?? 0;
                    categoryTotals.set(t.categoryId, current + t.amount);
                }
            });

        return { monthlyData, yearlyTotals, categoryTotals };
    }, [selectedYear]);

    if (!yearlyData) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
            </div>
        );
    }

    const { monthlyData, yearlyTotals, categoryTotals } = yearlyData;

    // Prepare category breakdown
    const categoryBreakdown = categories
        .map(c => ({
            name: c.name,
            color: c.color,
            amount: categoryTotals.get(c.id ?? 0) ?? 0,
        }))
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-medium text-slate-900 dark:text-white mb-1">{label}</p>
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
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Yearly Overview
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    {selectedYear} Summary
                </p>
            </div>

            {/* Yearly Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(yearlyTotals.income, settings)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(yearlyTotals.expenses, settings)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Net Savings</p>
                    <p className={`text-2xl font-bold ${yearlyTotals.net >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {formatCurrency(yearlyTotals.net, settings)}
                    </p>
                </Card>
            </div>

            {/* Monthly Chart */}
            <Card>
                <CardHeader title="Monthly Comparison" subtitle="Income vs Expenses by month" />
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                tickFormatter={(value) => formatCurrency(value, settings)}
                                width={80}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Category Breakdown */}
            <Card>
                <CardHeader title="Spending by Category" subtitle="Year-to-date totals" />
                <div className="space-y-3">
                    {categoryBreakdown.slice(0, 10).map((category, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                            />
                            <span className="flex-1 text-slate-700 dark:text-slate-300">
                                {category.name}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {formatCurrency(category.amount, settings)}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Monthly Breakdown Table */}
            <Card padding="none">
                <div className="p-6 pb-0">
                    <CardHeader title="Monthly Breakdown" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Month
                                </th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Income
                                </th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Expenses
                                </th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Net
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {MONTH_NAMES.map((month, index) => {
                                const data = monthlyData[index];
                                return (
                                    <tr
                                        key={month}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        <td className="px-6 py-3 text-slate-900 dark:text-white font-medium">
                                            {month}
                                        </td>
                                        <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(data?.income ?? 0, settings)}
                                        </td>
                                        <td className="px-6 py-3 text-right text-red-600 dark:text-red-400">
                                            {formatCurrency(data?.expenses ?? 0, settings)}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-medium ${(data?.net ?? 0) >= 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {formatCurrency(data?.net ?? 0, settings)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
