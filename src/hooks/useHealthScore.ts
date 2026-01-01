import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useDateStore } from '../stores/dateStore';
import { calculateTotalHealthScore } from '../utils/healthScoreUtils';
// @ts-ignore
import { getMonthRange } from '../utils/dateUtils';

/**
 * Hook to calculate and manage the monthly financial health score
 */
export function useHealthScore() {
    const { selectedYear, selectedMonth } = useDateStore();

    const result = useLiveQuery(
        async () => {
            const settings = await db.appSettings.toCollection().first();
            const startDay = settings?.firstDayOfMonth ?? 1;
            const { start, end } = getMonthRange(selectedYear, selectedMonth, startDay || 1);

            // 1. Get transactions for the month
            const monthTxs = await db.transactions
                .where('date')
                .between(start, end, true, true)
                .toArray();

            let income = 0;
            let expenses = 0;
            let savings = 0;

            // Map to store daily spending for stability calculation
            const dailySpendingMap = new Map<string, number>();

            for (const tx of monthTxs) {
                if (tx.type === 'income') {
                    income += tx.amount;
                } else if (tx.type === 'expense') {
                    expenses += tx.amount;

                    const dateStr = tx.date.toISOString().split('T')[0] || '';
                    dailySpendingMap.set(dateStr, (dailySpendingMap.get(dateStr) ?? 0) + tx.amount);
                } else if (tx.type === 'savings') {
                    savings += tx.amount;
                }
            }

            const dailySpending = Array.from(dailySpendingMap.values());

            // 2. Get budgeted vs spent
            const budgets = await db.monthlyBudgets
                .where('[year+month]')
                .equals([selectedYear, selectedMonth])
                .toArray();

            const plannedBudget = budgets.reduce((acc, b) => acc + b.plannedAmount, 0);

            // For spent budget, we only count transactions that have a category ID linked to a budget
            const budgetedCategoryIds = new Set(budgets.map(b => b.categoryId));
            let spentBudget = 0;
            for (const tx of monthTxs) {
                if (tx.categoryId && budgetedCategoryIds.has(tx.categoryId) && tx.type === 'expense') {
                    spentBudget += tx.amount;
                }
            }

            // 3. Get Debt data
            const debts = await db.debts.toArray();
            const totalDebt = debts.reduce((acc, d) => acc + (d.originalAmount), 0);

            // Debt paid this month (from transactions type='expense' category='Debt Payback')
            // Actually, we can check transactions with debtId linked
            let totalDebtPaid = 0;
            for (const tx of monthTxs) {
                if (tx.debtId) {
                    totalDebtPaid += tx.amount;
                }
            }

            // 4. Get Current Balance and Average Expenses
            // Current balance = historical income - historical expenses - net savings flow
            // Actually db.getMonthlyTotals for all time might be better
            const allTxs = await db.transactions.toArray();
            let totalHistIncome = 0;
            let totalHistExpenses = 0;
            let totalHistSavings = 0;

            for (const tx of allTxs) {
                if (tx.type === 'income') totalHistIncome += tx.amount;
                else if (tx.type === 'expense') totalHistExpenses += tx.amount;
                else if (tx.type === 'savings') totalHistSavings += tx.amount;
            }

            const currentBalance = totalHistIncome - totalHistExpenses - totalHistSavings;

            // Average expenses (last 6 months or all if less)
            // For simplicity, let's take totalHistExpenses / (unique months)
            const expenseTxs = allTxs.filter(tx => tx.type === 'expense');
            const monthsWithExpenses = new Set(expenseTxs.map(tx => `${tx.date.getFullYear()}-${tx.date.getMonth()}`));
            const avgMonthlyExpenses = monthsWithExpenses.size > 0
                ? totalHistExpenses / monthsWithExpenses.size
                : expenses; // Fallback to current month if no history

            // 5. Calculate final score
            const scoreResult = calculateTotalHealthScore(
                income,
                savings,
                plannedBudget,
                spentBudget,
                totalDebt,
                totalDebtPaid,
                dailySpending,
                currentBalance,
                avgMonthlyExpenses
            );

            // 6. Removed side-effect database write from useLiveQuery which caused recursion/crashes
            // This logic will be moved to a separate persistence layer or explicit action.

            // 7. Get previous month score for trend
            let prevYear = selectedYear;
            let prevMonth = selectedMonth - 1;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear -= 1;
            }

            const prevScore = await db.healthScores
                .where('[year+month]')
                .equals([prevYear, prevMonth])
                .first();

            return {
                ...scoreResult,
                prevScore: prevScore?.totalScore ?? null
            };
        },
        [selectedYear, selectedMonth]
    );

    const { score, isLoading } = result === undefined ? { score: null, isLoading: true } : { score: result, isLoading: false };

    // Effect to safely save snapshot to DB
    useEffect(() => {
        if (!score || isLoading) return;

        const saveSnapshot = async () => {
            const now = new Date();
            const isFuture = selectedYear > now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth > now.getMonth());

            if (isFuture) return;

            try {
                const existing = await db.healthScores
                    .where('[year+month]')
                    .equals([selectedYear, selectedMonth])
                    .first();

                const scoreData = {
                    year: selectedYear,
                    month: selectedMonth,
                    totalScore: score.totalScore,
                    componentScores: {
                        savingsRate: score.components.savingsRate.score,
                        budgetAdherence: score.components.budgetAdherence.score,
                        debtProgress: score.components.debtProgress.score,
                        spendingStability: score.components.spendingStability.score,
                        emergencyFund: score.components.emergencyFund.score,
                    },
                    createdAt: new Date()
                };

                if (existing) {
                    await db.healthScores.update(existing.id!, scoreData);
                } else {
                    await db.healthScores.add(scoreData);
                }
            } catch (err) {
                console.error('Failed to save health score snapshot:', err);
            }
        };

        saveSnapshot();
    }, [score?.totalScore, selectedYear, selectedMonth, isLoading]);

    return {
        score,
        isLoading,
    };
}
