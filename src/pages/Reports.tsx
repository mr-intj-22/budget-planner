import { useState } from 'react';
import { FileJson, FileSpreadsheet } from 'lucide-react';
import {
    BarChart,
    Bar,
    Cell,
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

            const income = transactions
                .filter(t => {
                    const txDate = new Date(t.date);
                    return txDate.getMonth() === month && t.type === 'income';
                })
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
                if (t.categoryId) {
                    const current = categoryTotals.get(t.categoryId) ?? 0;
                    categoryTotals.set(t.categoryId, current + t.amount);
                }
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

    // Get health score trend data with prediction
    const healthTrendData = useLiveQuery(async () => {
        const scores = await db.healthScores
            .where('year')
            .equals(selectedYear)
            .toArray();

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Calculate actual scores
        const data = MONTH_NAMES.map((name, month) => {
            const scoreEntry = scores.find(s => s.month === month);
            const isFuture = selectedYear > currentYear || (selectedYear === currentYear && month > currentMonth);

            return {
                month: name.substring(0, 3),
                actual: scoreEntry ? Math.round(scoreEntry.totalScore) : null,
                isFuture
            };
        });

        // Simple Prediction Logic (Linear Projection)
        const availableScores = scores
            .sort((a, b) => a.month - b.month)
            .map(s => ({ x: s.month, y: s.totalScore }));

        let projection = null;
        if (availableScores.length >= 2) {
            // Linear regression: y = mx + b
            const n = availableScores.length;
            const sumX = availableScores.reduce((sum, s) => sum + s.x, 0);
            const sumY = availableScores.reduce((sum, s) => sum + s.y, 0);
            const sumXY = availableScores.reduce((sum, s) => sum + s.x * s.y, 0);
            const sumX2 = availableScores.reduce((sum, s) => sum + s.x * s.x, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            projection = (x: number) => Math.min(100, Math.max(0, Math.round(slope * x + intercept)));
        } else if (availableScores.length === 1 && availableScores[0]) {
            // Constant projection
            const firstScore = availableScores[0].y;
            projection = () => Math.round(firstScore);
        }

        const lastActualMonth = [...data].reverse().find(d => d.actual !== null);
        const lastActualIdx = lastActualMonth ? MONTH_NAMES.findIndex(m => m.startsWith(lastActualMonth.month)) : -1;

        return data.map((d, i) => {
            let predicted = null;
            if (projection && (d.isFuture || d.actual === null)) {
                // If we have no data for a month, or it's the future, predict it
                predicted = projection(i);
            }

            // To make lines connect, the first predicted point should be the last actual point
            if (i === lastActualIdx && projection) {
                predicted = d.actual;
            }

            return { ...d, predicted };
        });
    }, [selectedYear]);

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
                            {entry.name}: {formatCurrency(entry.value ?? 0, settings)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Reports & Insights
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Analyze your financial performance
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
            <div className="flex flex-wrap gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend Chart */}
                <Card>
                    <CardHeader title="Cash Flow Trend" subtitle={`${selectedYear} monthly income vs expenses`} />
                    <div className="h-80 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(value) => formatCurrency(value, settings)}
                                    width={80}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Expenses"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    name="Income"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Financial Health Trend" subtitle={`${selectedYear} monthly health progress & AI prediction`} />
                    <div className="h-80 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={healthTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                    width={40}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length > 0) {
                                            const actual = payload.find(p => p.dataKey === 'actual')?.value as number | undefined;
                                            const predicted = payload.find(p => p.dataKey === 'predicted')?.value as number | undefined;
                                            const scoreValue = actual ?? predicted ?? 0;
                                            const isPrediction = actual === undefined && predicted !== undefined;

                                            return (
                                                <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                        {isPrediction ? 'AI Projection' : 'Actual Score'}
                                                    </p>
                                                    <p className={`text-2xl font-black ${scoreValue >= 90 ? 'text-emerald-500' :
                                                        scoreValue >= 75 ? 'text-blue-500' :
                                                            scoreValue >= 60 ? 'text-amber-500' : 'text-red-500'
                                                        }`}>
                                                        {scoreValue}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    content={() => (
                                        <div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest mb-4">
                                            <div className="flex items-center gap-2 text-indigo-500">
                                                <div className="w-4 h-1 bg-indigo-500 rounded-full" />
                                                <span>Historical</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-400 opacity-60">
                                                <div className="w-4 h-1 bg-indigo-400 rounded-full border-b-2 border-dashed border-white dark:border-slate-900" />
                                                <span>AI Projection</span>
                                            </div>
                                        </div>
                                    )}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                    animationDuration={1500}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                    connectNulls
                                    opacity={0.5}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Top Categories */}
            <Card>
                <CardHeader title="Top Spending Categories" subtitle="Highest expenses this year" />
                <div className="h-64 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topCategories} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                tickFormatter={(value) => formatCurrency(value, settings)}
                                axisLine={false}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                width={120}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="amount"
                                name="Amount"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                            >
                                {topCategories?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
