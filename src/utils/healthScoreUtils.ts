// Removed unused imports of Transaction, MonthlyBudget, Debt, AppSettings to fix lint
export interface HealthScoreComponentResult {
    score: number;
    value: number;
    label: string;
    description: string;
}

export interface MonthlyHealthScoreResult {
    totalScore: number;
    components: {
        savingsRate: HealthScoreComponentResult;
        budgetAdherence: HealthScoreComponentResult;
        debtProgress: HealthScoreComponentResult;
        spendingStability: HealthScoreComponentResult;
        emergencyFund: HealthScoreComponentResult;
    };
}

/**
 * Calculates the Savings Rate component (30% weight)
 * Target: 20% of income = 100 points
 */
export function calculateSavingsRate(income: number, savings: number): HealthScoreComponentResult {
    const rate = income > 0 ? (savings / income) : 0;
    // 0.20 (20%) -> 100 points. Score = rate / 0.20 * 100
    const score = Math.min(100, Math.max(0, rate * 500));

    return {
        score,
        value: rate * 100,
        label: 'Savings Rate',
        description: `You saved ${(rate * 100).toFixed(1)}% of your income.`
    };
}

/**
 * Calculates the Budget Adherence component (25% weight)
 * Based on how much was spent over the planned budget
 */
export function calculateBudgetAdherence(planned: number, spent: number): HealthScoreComponentResult {
    if (planned === 0) return { score: 100, value: 0, label: 'Budget Adherence', description: 'No budgets set for this month.' };

    const overspend = Math.max(0, spent - planned);
    const adherence = Math.max(0, 100 - (overspend / planned * 100));

    return {
        score: adherence,
        value: (spent / planned) * 100,
        label: 'Budget Adherence',
        description: spent > planned
            ? `You spent ${(spent - planned).toFixed(2)} over your planned budget.`
            : 'You stayed within your planned budget.'
    };
}

/**
 * Calculates the Debt Progress component (20% weight)
 * Target: 2% reduction of total debt per month = 100 points
 */
export function calculateDebtProgress(totalDebt: number, totalPaid: number): HealthScoreComponentResult {
    if (totalDebt === 0) return { score: 100, value: 0, label: 'Debt Progress', description: 'You have no outstanding debt!' };

    const reductionRate = totalPaid / totalDebt;
    // 0.02 (2%) -> 100 points. Score = rate / 0.02 * 100
    const score = Math.min(100, Math.max(0, reductionRate * 5000));

    return {
        score,
        value: reductionRate * 100,
        label: 'Debt Progress',
        description: `You reduced your debt by ${(reductionRate * 100).toFixed(2)}% this month.`
    };
}

/**
 * Calculates the Spending Stability component (15% weight)
 * Based on the variance of daily spending.
 */
export function calculateSpendingStability(dailySpending: number[]): HealthScoreComponentResult {
    if (dailySpending.length < 2) return { score: 100, value: 0, label: 'Spending Stability', description: 'Not enough data to calculate stability.' };

    const n = dailySpending.length;
    const mean = dailySpending.reduce((a, b) => a + b, 0) / n;

    if (mean === 0) return { score: 100, value: 0, label: 'Spending Stability', description: 'No spending recorded.' };

    const variance = dailySpending.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (CV) = stdDev / mean
    // Lower CV is better. If CV = 0 (perfect stability), score = 100.
    // If CV = 1.0 (stdDev = mean), score = 0.
    const cv = stdDev / mean;
    const score = Math.max(0, 100 - (cv * 100));

    return {
        score,
        value: cv,
        label: 'Spending Stability',
        description: score > 80 ? 'Your spending is very consistent.' : 'Your spending has high daily variance.'
    };
}

/**
 * Calculates the Emergency Fund component (10% weight)
 * Target: 6 months of average expenses = 100 points
 */
export function calculateEmergencyFund(currentBalance: number, avgMonthlyExpenses: number): HealthScoreComponentResult {
    if (avgMonthlyExpenses === 0) return { score: 100, value: 0, label: 'Emergency Fund', description: 'No expenses recorded to calculate target.' };

    const monthsCovered = currentBalance / avgMonthlyExpenses;
    // 6 months -> 100 points. Score = months / 6 * 100
    const score = Math.min(100, Math.max(0, monthsCovered * 16.6));

    return {
        score,
        value: monthsCovered,
        label: 'Emergency Fund',
        description: `Your balance covers ${monthsCovered.toFixed(1)} months of expenses.`
    };
}

/**
 * Aggregates all components into a final score
 */
export function calculateTotalHealthScore(
    income: number,
    savings: number,
    plannedBudget: number,
    spentBudget: number,
    totalDebt: number,
    totalDebtPaid: number,
    dailySpending: number[],
    currentBalance: number,
    avgMonthlyExpenses: number
): MonthlyHealthScoreResult {
    const savingsRate = calculateSavingsRate(income, savings);
    const budgetAdherence = calculateBudgetAdherence(plannedBudget, spentBudget);
    const debtProgress = calculateDebtProgress(totalDebt, totalDebtPaid);
    const spendingStability = calculateSpendingStability(dailySpending);
    const emergencyFund = calculateEmergencyFund(currentBalance, avgMonthlyExpenses);

    const totalScore = Math.round(
        (savingsRate.score * 0.30) +
        (budgetAdherence.score * 0.25) +
        (debtProgress.score * 0.20) +
        (spendingStability.score * 0.15) +
        (emergencyFund.score * 0.10)
    );

    return {
        totalScore,
        components: {
            savingsRate,
            budgetAdherence,
            debtProgress,
            spendingStability,
            emergencyFund
        }
    };
}
