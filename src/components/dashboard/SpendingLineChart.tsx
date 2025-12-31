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
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { useDateStore } from '../../stores/dateStore';
import { getDaysInMonth } from '../../utils/dateUtils';

export function SpendingLineChart() {
    const { transactions, isLoading } = useMonthlyTransactions();
    const { selectedYear, selectedMonth } = useDateStore();
    const { settings } = useSettings();

    // Calculate cumulative spending per day
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const dailyData: { day: number; expenses: number; income: number; cumulative: number }[] = [];

    let cumulativeExpenses = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayTransactions = transactions.filter((t) => {
            const txDay = new Date(t.date).getDate();
            return txDay === day;
        });

        const dayExpenses = dayTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const dayIncome = dayTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        cumulativeExpenses += dayExpenses;

        dailyData.push({
            day,
            expenses: dayExpenses,
            income: dayIncome,
            cumulative: cumulativeExpenses,
        });
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
            <CardHeader title="Spending Over Time" subtitle="Daily cumulative expenses" />
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
                            dataKey="cumulative"
                            name="Cumulative Expenses"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            name="Daily Income"
                            stroke="#10b981"
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
