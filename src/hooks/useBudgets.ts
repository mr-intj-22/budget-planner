/**
 * React hooks for monthly budget data access
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { MonthlyBudgetSummary } from '../db/schema';
import { useDateStore } from '../stores/dateStore';
import { useCategories } from './useCategories';
import { useCategorySpending } from './useTransactions';

/**
 * Hook to get budget summaries for all categories in the selected month
 */
export function useMonthlyBudgetSummary() {
    const { selectedYear, selectedMonth } = useDateStore();
    const { categories } = useCategories();
    const { spending } = useCategorySpending();

    const budgets = useLiveQuery(
        () => db.monthlyBudgets
            .where('[year+month]')
            .equals([selectedYear, selectedMonth])
            .toArray(),
        [selectedYear, selectedMonth]
    );

    // Compute summaries for each category
    const summaries: MonthlyBudgetSummary[] = categories.map((category) => {
        const budget = budgets?.find((b) => b.categoryId === category.id);
        const spent = spending.get(category.id ?? 0) ?? 0;
        const planned = budget?.plannedAmount ?? category.monthlyBudget;
        const rollover = budget?.rolloverAmount ?? 0;
        const totalBudget = planned + rollover;
        const remaining = totalBudget - spent;
        const percentUsed = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

        return {
            categoryId: category.id ?? 0,
            categoryName: category.name,
            categoryColor: category.color,
            categoryIcon: category.icon,
            planned,
            spent,
            remaining,
            percentUsed: Math.min(100, Math.max(0, percentUsed)),
            rollover,
        };
    });

    // Calculate totals
    const totalPlanned = summaries.reduce((sum, s) => sum + s.planned, 0);
    const totalSpent = summaries.reduce((sum, s) => sum + s.spent, 0);
    const totalRemaining = totalPlanned - totalSpent;

    return {
        summaries,
        totalPlanned,
        totalSpent,
        totalRemaining,
        isLoading: budgets === undefined,
    };
}

/**
 * Hook for budget operations
 */
export function useBudgetOperations() {
    const { selectedYear, selectedMonth } = useDateStore();

    const setBudget = async (
        categoryId: number,
        plannedAmount: number,
        rolloverEnabled: boolean = false
    ) => {
        return db.setBudgetForCategoryMonth(
            categoryId,
            selectedYear,
            selectedMonth,
            plannedAmount,
            rolloverEnabled
        );
    };

    const copyFromPreviousMonth = async () => {
        let prevYear = selectedYear;
        let prevMonth = selectedMonth - 1;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear--;
        }

        const previousBudgets = await db.monthlyBudgets
            .where('[year+month]')
            .equals([prevYear, prevMonth])
            .toArray();

        const now = new Date();
        for (const budget of previousBudgets) {
            const existing = await db.getBudgetForCategoryMonth(
                budget.categoryId,
                selectedYear,
                selectedMonth
            );

            if (!existing) {
                // Calculate rollover if enabled
                let rolloverAmount = 0;
                if (budget.rolloverEnabled) {
                    const prevSpending = await db.getCategorySpendingForMonth(prevYear, prevMonth);
                    const spent = prevSpending.get(budget.categoryId) ?? 0;
                    rolloverAmount = Math.max(0, budget.plannedAmount - spent);
                }

                await db.monthlyBudgets.add({
                    categoryId: budget.categoryId,
                    year: selectedYear,
                    month: selectedMonth,
                    plannedAmount: budget.plannedAmount,
                    rolloverEnabled: budget.rolloverEnabled,
                    rolloverAmount,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }
    };

    return {
        setBudget,
        copyFromPreviousMonth,
    };
}
