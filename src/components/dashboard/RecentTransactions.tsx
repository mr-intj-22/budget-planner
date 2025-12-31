import React from 'react';
import { ArrowRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../ui/Card';
import { CategoryBadge } from '../ui/Badge';
import { useRecentTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

export function RecentTransactions() {
    const { transactions, isLoading } = useRecentTransactions(5);
    const { categories } = useCategories();
    const { settings } = useSettings();

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    if (isLoading) {
        return (
            <Card>
                <CardHeader title="Recent Transactions" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                            </div>
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader title="Recent Transactions" />
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No transactions yet</p>
                </div>
            </Card>
        );
    }

    return (
        <Card padding="none">
            <div className="p-6 pb-0">
                <CardHeader
                    title="Recent Transactions"
                    action={
                        <Link
                            to="/transactions"
                            className="text-sm text-accent-500 hover:text-accent-600 flex items-center gap-1"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    }
                />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {transactions.map((transaction) => {
                    const category = categoryMap.get(transaction.categoryId);
                    return (
                        <div
                            key={transaction.id}
                            className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${category?.color ?? '#6b7280'}20` }}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category?.color ?? '#6b7280' }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {transaction.description || 'No description'}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {category && <CategoryBadge category={category} showIcon={false} />}
                                    <span className="text-xs text-slate-400">
                                        {formatDate(new Date(transaction.date))}
                                    </span>
                                </div>
                            </div>
                            <p className={`text-sm font-semibold ${transaction.type === 'income'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount, settings)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
