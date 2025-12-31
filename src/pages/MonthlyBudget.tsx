import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useDateStore } from '../stores/dateStore';
import { useMonthlyBudgetSummary, useBudgetOperations } from '../hooks/useBudgets';
import { useAppStore } from '../stores/appStore';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency } from '../utils/currency';

export function MonthlyBudget() {
    const { getMonthYearString } = useDateStore();
    const { summaries, totalPlanned, totalSpent, totalRemaining, isLoading } = useMonthlyBudgetSummary();
    const { setBudget, copyFromPreviousMonth } = useBudgetOperations();
    const { showToast } = useAppStore();
    const { settings } = useSettings();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleEditStart = (categoryId: number, currentValue: number) => {
        setEditingId(categoryId);
        setEditValue(currentValue.toString());
    };

    const handleEditSave = async (categoryId: number) => {
        const amount = parseFloat(editValue);
        if (!isNaN(amount) && amount >= 0) {
            await setBudget(categoryId, amount);
            showToast('Budget updated', 'success');
        }
        setEditingId(null);
    };

    const handleCopyFromPrevious = async () => {
        try {
            await copyFromPreviousMonth();
            showToast('Budget copied from previous month', 'success');
        } catch (error) {
            showToast('Failed to copy budget', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Monthly Budget
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {getMonthYearString()}
                    </p>
                </div>
                <Button
                    icon={Copy}
                    variant="secondary"
                    onClick={handleCopyFromPrevious}
                >
                    Copy from Last Month
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Budget</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(totalPlanned, settings)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Spent</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(totalSpent, settings)}
                    </p>
                    <ProgressBar
                        value={(totalSpent / totalPlanned) * 100}
                        className="mt-2"
                    />
                </Card>
                <Card>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Remaining</p>
                    <p className={`text-2xl font-bold ${totalRemaining >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {formatCurrency(totalRemaining, settings)}
                    </p>
                </Card>
            </div>

            {/* Budget List */}
            <Card padding="none">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-700/50 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <div className="col-span-4">Category</div>
                        <div className="col-span-2 text-right">Budget</div>
                        <div className="col-span-2 text-right">Spent</div>
                        <div className="col-span-2 text-right">Remaining</div>
                        <div className="col-span-2">Progress</div>
                    </div>

                    {/* Rows */}
                    {summaries.map((summary) => {
                        const iconName = summary.categoryIcon
                            .split('-')
                            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                            .join('') as keyof typeof Icons;
                        const IconComponent = Icons[iconName] as React.ElementType;

                        const isEditing = editingId === summary.categoryId;
                        const isOverBudget = summary.percentUsed > 100;

                        return (
                            <div
                                key={summary.categoryId}
                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                {/* Category */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${summary.categoryColor}20` }}
                                    >
                                        {IconComponent && (
                                            <IconComponent
                                                className="w-5 h-5"
                                                style={{ color: summary.categoryColor }}
                                            />
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {summary.categoryName}
                                    </span>
                                </div>

                                {/* Budget */}
                                <div className="col-span-2 text-right">
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleEditSave(summary.categoryId)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEditSave(summary.categoryId);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            className="w-24 ml-auto text-right"
                                            autoFocus
                                        />
                                    ) : (
                                        <button
                                            onClick={() => handleEditStart(summary.categoryId, summary.planned)}
                                            className="text-slate-600 dark:text-slate-300 hover:text-accent-500 dark:hover:text-accent-400"
                                        >
                                            {formatCurrency(summary.planned, settings)}
                                        </button>
                                    )}
                                </div>

                                {/* Spent */}
                                <div className={`col-span-2 text-right ${isOverBudget ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-300'
                                    }`}>
                                    {formatCurrency(summary.spent, settings)}
                                </div>

                                {/* Remaining */}
                                <div className={`col-span-2 text-right font-medium ${summary.remaining >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {formatCurrency(summary.remaining, settings)}
                                </div>

                                {/* Progress */}
                                <div className="col-span-2">
                                    <ProgressBar
                                        value={summary.percentUsed}
                                        color={summary.categoryColor}
                                        size="sm"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        {summary.percentUsed.toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
