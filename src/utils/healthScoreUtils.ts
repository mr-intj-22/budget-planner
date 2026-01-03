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
        emergencyFund: HealthScoreComponentResult;
    };
}

/**
 * Calculates the Savings Rate component (30% weight)
 * Target: 20% of income = 100 points. If a savings goal is reached, return 100.
 */
export function calculateSavingsRate(income: number, savings: number, goalReached = false): HealthScoreComponentResult {
    if (goalReached) {
        return { score: 100, value: 100, label: 'Savings Rate', description: 'Savings goal reached.' };
    }

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
    const overspendRatio = overspend / planned; // e.g., 0.1 means 10% overspend

    if (overspendRatio <= 0) {
        return {
            score: 100,
            value: (spent / planned) * 100,
            label: 'Budget Adherence',
            description: 'You stayed within your planned budget.'
        };
    }

    // If overspendRatio >= 0.10 (10%), score == 0. Linearly interpolate between 0..0.10
    if (overspendRatio >= 0.10) {
        return {
            score: 0,
            value: (spent / planned) * 100,
            label: 'Budget Adherence',
            description: `You exceeded your budget by ${(overspendRatio * 100).toFixed(1)}%`,
        };
    }

    const score = Math.round(100 * (1 - (overspendRatio / 0.10)));

    return {
        score,
        value: (spent / planned) * 100,
        label: 'Budget Adherence',
        description: `You exceeded your budget by ${(overspend).toFixed(2)}.`
    };
}

/**
 * Calculates the Debt Progress component (20% weight)
 * Target: 20% reduction of total debt per month = 100 points
 */
export function calculateDebtProgress(totalDebt: number, totalPaid: number): HealthScoreComponentResult {
    if (totalDebt === 0) return { score: 100, value: 0, label: 'Debt Progress', description: 'You have no outstanding debt!' };

    const reductionRate = totalPaid / totalDebt;
    // 0.20 (20%) -> 100 points. Score = rate / 0.20 * 100
    const score = Math.min(100, Math.max(0, reductionRate * 500));

    return {
        score,
        value: reductionRate * 100,
        label: 'Debt Progress',
        description: `You reduced your debt by ${(reductionRate * 100).toFixed(2)}% this month.`
    };
}

// Spending Stability removed per new rules.

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
    currentBalance: number,
    avgMonthlyExpenses: number,
    goalReached: boolean = false
): MonthlyHealthScoreResult {
    const savingsRate = calculateSavingsRate(income, savings, goalReached);
    const budgetAdherence = calculateBudgetAdherence(plannedBudget, spentBudget);
    const debtProgress = calculateDebtProgress(totalDebt, totalDebtPaid);
    const emergencyFund = calculateEmergencyFund(currentBalance, avgMonthlyExpenses);

    // If user has no savings recorded, emergency fund should be treated as 0
    if (savings === 0) {
        emergencyFund.score = 0;
        emergencyFund.description = 'No savings available for emergency fund.';
    }

    const totalScore = Math.round(
        (savingsRate.score * 0.30) +
        (budgetAdherence.score * 0.40) +
        (debtProgress.score * 0.15) +
        (emergencyFund.score * 0.15)
    );

    return {
        totalScore,
        components: {
            savingsRate,
            budgetAdherence,
            debtProgress,
            emergencyFund
        }
    };
}
