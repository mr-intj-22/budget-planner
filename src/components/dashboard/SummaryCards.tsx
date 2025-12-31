import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Scale } from 'lucide-react';
import { StatCard } from '../ui/Card';
import { useMonthlyTotals } from '../../hooks/useTransactions';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';

export function SummaryCards() {
    const { income, expenses, savings, net, isLoading: isTotalsLoading } = useMonthlyTotals();
    const { totalSaved, overallProgress, isLoading: isGoalsLoading } = useSavingsGoals();
    const { settings } = useSettings();

    // Current Balance = Net (Wealth) - Savings (set aside)
    const currentBalance = net - savings;

    if (isTotalsLoading || isGoalsLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="card p-6 animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard
                title="Current Balance"
                value={formatCurrency(currentBalance, settings)}
                change={{
                    value: 'Available',
                    type: 'neutral',
                }}
                color="#3b82f6"
                icon={<Wallet className="w-6 h-6 text-blue-500" />}
            />

            <StatCard
                title="Net Balance"
                value={formatCurrency(net, settings)}
                change={{
                    value: net >= 0 ? 'Total Wealth' : 'In Dept',
                    type: net >= 0 ? 'positive' : 'negative',
                }}
                color={net >= 0 ? '#10b981' : '#ef4444'}
                icon={<Scale className="w-6 h-6" style={{ color: net >= 0 ? '#10b981' : '#ef4444' }} />}
            />

            <StatCard
                title="Total Income"
                value={formatCurrency(income, settings)}
                color="#10b981"
                icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            />

            <StatCard
                title="Total Expenses"
                value={formatCurrency(expenses, settings)}
                color="#ef4444"
                icon={<TrendingDown className="w-6 h-6 text-red-500" />}
            />

            <StatCard
                title="Savings Progress"
                value={formatCurrency(totalSaved, settings)}
                change={{
                    value: `${overallProgress.toFixed(0)}% of goals`,
                    type: overallProgress >= 50 ? 'positive' : 'neutral',
                }}
                color="#6366f1"
                icon={<PiggyBank className="w-6 h-6 text-accent-500" />}
            />
        </div>
    );
}
