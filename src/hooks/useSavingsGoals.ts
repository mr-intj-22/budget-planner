/**
 * React hooks for savings goal data access
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { SavingsGoal } from '../db/schema';

/**
 * Hook to get all savings goals
 */
export function useSavingsGoals() {
    const goals = useLiveQuery(
        () => db.savingsGoals.orderBy('targetDate').toArray(),
        []
    );

    // Calculate totals
    const totalTarget = goals?.reduce((sum, g) => sum + g.targetAmount, 0) ?? 0;
    const totalSaved = goals?.reduce((sum, g) => sum + g.currentAmount, 0) ?? 0;
    const totalRemaining = totalTarget - totalSaved;
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
        goals: goals ?? [],
        totalTarget,
        totalSaved,
        totalRemaining,
        overallProgress,
        isLoading: goals === undefined,
    };
}

/**
 * Hook to get a single savings goal by ID
 */
export function useSavingsGoal(id: number | null) {
    const goal = useLiveQuery(
        () => (id ? db.savingsGoals.get(id) : undefined),
        [id]
    );

    return {
        goal,
        isLoading: id !== null && goal === undefined,
    };
}

/**
 * Hook for savings goal operations
 */
export function useSavingsGoalOperations() {
    const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date();
        return db.savingsGoals.add({
            ...goal,
            createdAt: now,
            updatedAt: now,
        });
    };

    const updateGoal = async (id: number, updates: Partial<SavingsGoal>) => {
        return db.savingsGoals.update(id, {
            ...updates,
            updatedAt: new Date(),
        });
    };

    const deleteGoal = async (id: number) => {
        return db.savingsGoals.delete(id);
    };

    const addContribution = async (id: number, amount: number) => {
        const goal = await db.savingsGoals.get(id);
        if (!goal) throw new Error('Goal not found');

        const newAmount = goal.currentAmount + amount;
        const isCompleted = newAmount >= goal.targetAmount;

        return db.savingsGoals.update(id, {
            currentAmount: newAmount,
            isCompleted,
            updatedAt: new Date(),
        });
    };

    return {
        addGoal,
        updateGoal,
        deleteGoal,
        addContribution,
    };
}

/**
 * Calculate progress and time remaining for a goal
 */
export function calculateGoalProgress(goal: SavingsGoal) {
    const progress = goal.targetAmount > 0
        ? (goal.currentAmount / goal.targetAmount) * 100
        : 0;

    const remaining = goal.targetAmount - goal.currentAmount;

    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const daysRemaining = Math.ceil(
        (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const monthsRemaining = Math.ceil(daysRemaining / 30);

    // Calculate required monthly contribution to reach goal
    const requiredMonthly = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;

    // Check if on track
    const onTrack = goal.monthlyContribution >= requiredMonthly || goal.isCompleted;

    return {
        progress: Math.min(100, Math.max(0, progress)),
        remaining,
        daysRemaining,
        monthsRemaining,
        requiredMonthly,
        onTrack,
    };
}
