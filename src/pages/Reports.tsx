import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useDateStore, MONTH_NAMES } from '../stores/dateStore';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { useAppStore } from '../stores/appStore';
import { formatCurrency } from '../utils/currency';
import { downloadBackup, downloadCSV } from '../utils/exportImport';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { getYearOptions } from '../utils/dateUtils';

export function Reports() {
    const { selectedYear, setSelectedYear } = useDateStore();
    const { categories } = useCategories();
    const { settings } = useSettings();
    const { showToast } = useAppStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isExporting, setIsExporting] = useState(false);

    // Get trend data
    const trendData = useLiveQuery(async () => {
        const transactions = await db.getTransactionsForYear(selectedYear);

        return MONTH_NAMES.map((name, month) => {
            let monthTransactions = transactions.filter(t => {
                const txDate = new Date(t.date);
                return txDate.getMonth() === month;
            });

            if (selectedCategory !== 'all') {
                monthTransactions = monthTransactions.filter(
                    t => t.categoryId === parseInt(selectedCategory)
                );
            }

            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                month: name.substring(0, 3),
                expenses,
                income,
            };
        });
    }, [selectedYear, selectedCategory]);

    // Get top spending categories
    const topCategories = useLiveQuery(async () => {
        const transactions = await db.getTransactionsForYear(selectedYear);
        const categoryTotals = new Map<number, number>();

        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const current = categoryTotals.get(t.categoryId) ?? 0;
                categoryTotals.set(t.categoryId, current + t.amount);
            });

        return categories
            .map(c => ({
                id: c.id,
                name: c.name,
                color: c.color,
                amount: categoryTotals.get(c.id ?? 0) ?? 0,
            }))
            .filter(c => c.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [selectedYear, categories]);

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            await downloadCSV(selectedYear);
            showToast('CSV exported successfully', 'success');
        } catch (error) {
            showToast('Failed to export CSV', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportBackup = async () => {
        setIsExporting(true);
        try {
            await downloadBackup();
            showToast('Backup created successfully', 'success');
        } catch (error) {
            showToast('Failed to create backup', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const yearOptions = getYearOptions(5).map(year => ({
        value: year.toString(),
        label: year.toString(),
    }));

    const categoryOptions = [
        { value: 'all', label: 'All Categories' },
        ...categories.map(c => ({
            value: c.id?.toString() ?? '',
            label: c.name,
        })),
    ];

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Reports & Insights
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Analyze your spending patterns
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        icon={FileSpreadsheet}
                        variant="secondary"
                        onClick={handleExportCSV}
                        disabled={isExporting}
                    >
                        Export CSV
                    </Button>
                    <Button
                        icon={FileJson}
                        variant="secondary"
                        onClick={handleExportBackup}
                        disabled={isExporting}
                    >
                        Export Backup
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <Select
                    options={yearOptions}
                    value={selectedYear.toString()}
                    onChange={(value) => setSelectedYear(parseInt(value))}
                    className="w-32"
                />
                <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    className="w-48"
                />
            </div>

            {/* Trend Chart */}
            <Card>
                <CardHeader title="Spending Trend" subtitle={`${selectedYear} monthly breakdown`} />
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
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
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Expenses"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="income"
                                name="Income"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Top Categories */}
            <Card>
                <CardHeader title="Top Spending Categories" subtitle="Highest expenses this year" />
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topCategories} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                tickFormatter={(value) => formatCurrency(value, settings)}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                width={120}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="amount"
                                name="Amount"
                                radius={[0, 4, 4, 0]}
                            >
                                {topCategories?.map((entry, index) => (
                                    <Bar key={index} dataKey="amount" fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
