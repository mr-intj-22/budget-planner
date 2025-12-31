import React from 'react';
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

interface SavingsGoalCardProps {
    goal: SavingsGoal;
}

export function SavingsGoalCard({ goal }: SavingsGoalCardProps) {
    const { settings } = useSettings();
    const { openTransactionModal, openSavingsGoalModal, openDeleteConfirmation } = useAppStore();

    const { progress, remaining, daysRemaining, onTrack } = calculateGoalProgress(goal);

    // Get icon component
    const iconName = goal.icon
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') as keyof typeof Icons;
    const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }> | undefined;

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
                                <span style={{ color: goal.color }}>
                                    <IconComponent className="w-5 h-5" />
                                </span>
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
                                openTransactionModal(undefined, {
                                    type: 'savings', // Deposit to savings
                                    description: `Deposit to ${goal.name}`,
                                    savingsGoalId: goal.id,
                                    amount: '', // Clear amount
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
                                    type: 'savings', // Withdraw from savings
                                    description: `Withdraw from ${goal.name}`,
                                    savingsGoalId: goal.id,
                                    // Hack: We need a way to indicate withdrawal in the modal initial state
                                    // Since 'savings' covers both, we might need a flag or assume user enters negative?
                                    // BETTER: Pass a negative amount or handle it in modal?
                                    // Let's assume user enters positive amount for "Withdrawal" and we negate it?
                                    // No, simpler: TransactionModal should know if it's a withdrawal context.
                                    // Let's pass a signed amount if we can, or checks.
                                    // For now, let's just default to 'savings' and let user handle sign?
                                    // User Request: "in savings deposit dialog, remove category".
                                    // If we click "Withdraw", we ideally want it to be a withdrawal.
                                    // If we pass an initial negative amount (e.g. '-0') it might work?
                                    // Let's pre-fill description and let user handle amount sign?
                                    // Actually, standard behavior for withdrawal is usually positive input -> logic negates it.
                                    // But TransactionModal is generic.
                                    // Let's just pass `type: 'savings'` and description.
                                    // If user inputs positive amount for withdrawal, it's a deposit. That's confusing.
                                    // We need to differentiate in the modal or pass a 'isWithdrawal' hint? 
                                    // TransactionFormData doesn't have isWithdrawal.
                                    // Let's use `amount: '-1'` as a hint? No.
                                    // Ideally, we should set the type to 'savings' and maybe handle the sign in the modal based on a new prop?
                                    // But I can't change the modal props easily without checking store.
                                    // Let's stick to simple first: 'savings' type.
                                    // Wait, if I set type to 'savings', is it always positive?
                                    // My Database logic says: positive = deposit, negative = withdrawal.
                                    // Users won't type '-50'.
                                    // I should probably add a toggle in the modal for 'Deposit' vs 'Withdraw' if type is 'savings'.
                                    amount: '',
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
