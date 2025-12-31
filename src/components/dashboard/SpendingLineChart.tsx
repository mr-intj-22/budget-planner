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
import { getMonthRange } from '../../utils/dateUtils';
import { useDateStore } from '../../stores/dateStore';

export function SpendingLineChart() {
    const { transactions, isLoading } = useMonthlyTransactions();
    const { selectedYear, selectedMonth } = useDateStore();
    const { settings } = useSettings();

    const dailyData: { day: string; expenses: number; income: number; cumulativeExpenses: number; cumulativeIncome: number; netBalance: number; currentBalance: number }[] = [];

    let currentExpenses = 0;
    let currentIncome = 0;
    let currentSavings = 0;

    // Fetch settings for financial month start
    const firstDayOfMonth = settings?.firstDayOfMonth ?? 1;
    const { start, end } = getMonthRange(selectedYear, selectedMonth, firstDayOfMonth);

    // Iterate day by day from start to end
    const currentDate = new Date(start);
    while (currentDate <= end) {
        const dateStr = currentDate.toDateString();
        const dayLabel = currentDate.getDate().toString();

        const dayTransactions = transactions.filter((t) => {
            const tDate = new Date(t.date);
            return tDate.toDateString() === dateStr;
        });

        // Split by Type
        const dayExpenses = dayTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const dayIncome = dayTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const daySavings = dayTransactions
            .filter((t) => t.type === 'savings')
            .reduce((sum, t) => sum + t.amount, 0);

        currentExpenses += dayExpenses;
        currentIncome += dayIncome;
        currentSavings += daySavings;

        const netBalance = currentIncome - currentExpenses;
        const currentBalance = currentIncome - currentExpenses - currentSavings;

        dailyData.push({
            day: dayLabel,
            expenses: dayExpenses,
            income: dayIncome,
            cumulativeExpenses: currentExpenses,
            cumulativeIncome: currentIncome,
            netBalance,
            currentBalance,
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
            <CardHeader title="Cash Flow & Spending" subtitle="Cumulative income, expenses, and balances" />
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
                            dataKey="cumulativeIncome"
                            name="Income"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
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
                        <Line
                            type="monotone"
                            dataKey="currentBalance"
                            name="Current Balance"
                            stroke="#6366f1"
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
