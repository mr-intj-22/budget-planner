import React from 'react';
import { Receipt } from 'lucide-react';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { TransactionRow } from './TransactionRow';
import { useMonthlyTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useAppStore } from '../../stores/appStore';

export function TransactionList() {
    const { transactions, isLoading } = useMonthlyTransactions();
    const { categories } = useCategories();
    const { openTransactionModal } = useAppStore();

    // Create category map for quick lookup
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    if (isLoading) {
        return (
            <Card>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                            </div>
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    if (transactions.length === 0) {
        return (
            <Card>
                <EmptyState
                    icon={<Receipt className="w-8 h-8 text-slate-400" />}
                    title="No transactions yet"
                    description="Start tracking your income and expenses by adding your first transaction"
                    action={{
                        label: 'Add Transaction',
                        onClick: () => openTransactionModal(),
                    }}
                />
            </Card>
        );
    }

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const dateKey = new Date(transaction.date).toDateString();
        if (!groups.has(dateKey)) {
            groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(transaction);
        return groups;
    }, new Map<string, typeof transactions>());

    return (
        <Card padding="none">
            {Array.from(groupedTransactions.entries()).map(([dateKey, dayTransactions]) => (
                <div key={dateKey}>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {new Date(dateKey).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {dayTransactions.map((transaction) => (
                            <TransactionRow
                                key={transaction.id}
                                transaction={transaction}
                                category={categoryMap.get(transaction.categoryId)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </Card>
    );
}
