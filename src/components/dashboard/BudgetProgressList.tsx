import React from 'react';
import * as Icons from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { useMonthlyBudgetSummary } from '../../hooks/useBudgets';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';

export function BudgetProgressList() {
    const { summaries, isLoading } = useMonthlyBudgetSummary();
    const { settings } = useSettings();

    // Filter to show only categories with budget and sort by usage
    const budgetedCategories = summaries
        .filter((s) => s.planned > 0)
        .sort((a, b) => b.percentUsed - a.percentUsed);

    if (isLoading) {
        return (
            <Card>
                <CardHeader title="Budget Progress" />
                <div className="space-y-4 h-64 overflow-y-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="flex justify-between mb-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    if (budgetedCategories.length === 0) {
        return (
            <Card>
                <CardHeader title="Budget Progress" />
                <div className="h-64 flex items-center justify-center text-center text-slate-400 dark:text-slate-500">
                    <div>
                        <p>No budgets set for this month</p>
                        <p className="text-sm mt-1">Go to Monthly Budget to set up your budgets</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader title="Budget Progress" subtitle="Category spending vs budget" />
            <div className="space-y-4 h-64 overflow-y-auto">
                {budgetedCategories.map((summary) => {
                    // Get icon component
                    const iconName = summary.categoryIcon
                        .split('-')
                        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                        .join('') as keyof typeof Icons;
                    const IconComponent = Icons[iconName] as React.ElementType;

                    const isOverBudget = summary.percentUsed > 100;
                    const isWarning = summary.percentUsed >= 80 && summary.percentUsed < 100;

                    return (
                        <div key={summary.categoryId}>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    {IconComponent && (
                                        <IconComponent
                                            className="w-4 h-4"
                                            style={{ color: summary.categoryColor }}
                                        />
                                    )}
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {summary.categoryName}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-medium ${isOverBudget
                                        ? 'text-red-600 dark:text-red-400'
                                        : isWarning
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {formatCurrency(summary.spent, settings)}
                                    </span>
                                    <span className="text-sm text-slate-400"> / </span>
                                    <span className="text-sm text-slate-500">
                                        {formatCurrency(summary.planned, settings)}
                                    </span>
                                </div>
                            </div>
                            <ProgressBar
                                value={summary.percentUsed}
                                color={summary.categoryColor}
                                size="sm"
                            />
                            {isOverBudget && (
                                <p className="text-xs text-red-500 mt-1">
                                    Over budget by {formatCurrency(Math.abs(summary.remaining), settings)}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
