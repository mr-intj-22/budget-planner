import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { useCategories } from '../../hooks/useCategories';
import { useCategorySpending } from '../../hooks/useTransactions';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';

export function ExpensePieChart() {
    const { categories } = useCategories();
    const { spending, isLoading } = useCategorySpending();
    const { settings } = useSettings();

    // Prepare data for chart
    const chartData = categories
        .map((category) => ({
            name: category.name,
            value: spending.get(category.id ?? 0) ?? 0,
            color: category.color,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

    if (isLoading) {
        return (
            <Card>
                <CardHeader title="Expenses by Category" />
                <div className="h-64 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-8 border-slate-200 dark:border-slate-700 animate-pulse" />
                </div>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader title="Expenses by Category" />
                <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <p>No expenses this month</p>
                </div>
            </Card>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
            return (
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-medium text-slate-900 dark:text-white">{data.name}</p>
                    <p className="text-slate-600 dark:text-slate-300">
                        {formatCurrency(data.value, settings)} ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader
                title="Expenses by Category"
                subtitle={`Total: ${formatCurrency(totalExpenses, settings)}`}
            />
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            formatter={(value, entry: any) => (
                                <span className="text-sm text-slate-600 dark:text-slate-300">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
