import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Check, Calendar } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button, IconButton } from '../ui/Button';
import { CircularProgress } from '../ui/ProgressBar';
import type { SavingsGoal } from '../../db/schema';
import { formatCurrency } from '../../utils/currency';
import { getRelativeTime } from '../../utils/dateUtils';
import { useSettings } from '../../hooks/useSettings';
import { useAppStore } from '../../stores/appStore';
import { calculateGoalProgress } from '../../hooks/useSavingsGoals';
import { useCategories } from '../../hooks/useCategories'; // Added

interface SavingsGoalCardProps {
    goal: SavingsGoal;
}

export function SavingsGoalCard({ goal }: SavingsGoalCardProps) {
    const { settings } = useSettings();
    const { openTransactionModal, openSavingsGoalModal, openDeleteConfirmation } = useAppStore();
    const { categories } = useCategories(); // Added

    // Find Savings category ID
    const savingsCategory = categories.find(c => c.name === 'Savings');
    const savingsCategoryId = savingsCategory?.id;

    const { progress, remaining, daysRemaining, onTrack } = calculateGoalProgress(goal);

    // Get icon component
    const iconName = goal.icon
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') as keyof typeof Icons;
    const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }> | undefined;

    const handleAddContribution = async () => {
        const amount = parseFloat(contributionAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        try {
            await addContribution(goal.id!, amount);
            showToast(`Added ${formatCurrency(amount, settings)} to ${goal.name}`, 'success');
            setIsContributionModalOpen(false);
            setContributionAmount('');
        } catch (error) {
            showToast('Failed to add contribution', 'error');
        }
    };

    return (
        <>
            <Card hover className="group relative">
                {/* Edit/Delete buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton
                        icon={Edit2}
                        size="sm"
                        onClick={() => openSavingsGoalModal(goal.id)}
                        aria-label={`Edit ${goal.name}`}
                    />
                    <IconButton
                        icon={Trash2}
                        size="sm"
                        onClick={() => openDeleteConfirmation('goal', goal.id!, goal.name)}
                        aria-label={`Delete ${goal.name}`}
                        className="hover:text-red-500"
                    />
                </div>

                <div className="flex items-center gap-5">
                    {/* Progress Circle */}
                    <CircularProgress
                        value={progress}
                        size={80}
                        strokeWidth={6}
                        color={goal.isCompleted ? '#10b981' : goal.color}
                        showValue={true}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {IconComponent && (
                                <IconComponent className="w-5 h-5" style={{ color: goal.color }} />
                            )}
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {goal.name}
                            </h3>
                            {goal.isCompleted && (
                                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Complete
                                </span>
                            )}
                        </div>

                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {formatCurrency(goal.currentAmount, settings)}
                            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                {' '}/ {formatCurrency(goal.targetAmount, settings)}
                            </span>
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className={`flex items-center gap-1 ${remaining <= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                {remaining > 0 ? `${formatCurrency(remaining, settings)} to go` : 'Goal reached!'}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-4 h-4" />
                                {daysRemaining > 0 ? getRelativeTime(new Date(goal.targetDate)) : 'Past due'}
                            </span>
                        </div>

                        {!goal.isCompleted && (
                            <div className="mt-3 flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${onTrack
                                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                                    }`}>
                                    {onTrack ? 'On track' : 'Behind schedule'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {formatCurrency(goal.monthlyContribution, settings)}/month
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {!goal.isCompleted && (
                    <div className="flex gap-2 mt-4">
                        <Button
                            icon={Plus}
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                                // Find 'Savings' category
                                // Note: We don't have direct access to categories here, need to fetch or assume.
                                // Better to let TransactionModal handle default if ID missing, or fetch here.
                                // Ideally we pass the category ID. For now let's use a hook or context?
                                // Actually, we can just Open modal and let user confirm category if needed, 
                                // BUT requirement is "take value from savings category".
                                // We really should pre-select 'Savings'.
                                // Let's try to find it via a new hook call or passed prop?
                                // UseCategories is not here. Let's add it.
                                openTransactionModal(undefined, {
                                    type: 'expense', // Deposit to savings = Expense from checking
                                    description: `Deposit to ${goal.name}`,
                                    savingsGoalId: goal.id,
                                    categoryId: savingsCategoryId,
                                });
                            }}
                        >
                            Deposit
                        </Button>
                        <Button
                            icon={Icons.Minus}
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                                openTransactionModal(undefined, {
                                    type: 'income', // Withdraw from savings = Income to checking
                                    description: `Withdraw from ${goal.name}`,
                                    savingsGoalId: goal.id,
                                    categoryId: savingsCategoryId,
                                });
                            }}
                        >
                            Withdraw
                        </Button>
                    </div>
                )}
            </Card>
        </>
    );
}
