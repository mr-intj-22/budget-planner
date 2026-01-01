/**
 * Database schema types for the Budget Planner application.
 * All data is stored locally in IndexedDB via Dexie.js
 */

// ============================================
// Category - Expense/Income categories
// ============================================
export interface Category {
    id?: number;
    name: string;
    color: string;           // Hex color code (e.g., '#6366f1')
    icon: string;            // Lucide icon name (e.g., 'home', 'car')
    monthlyBudget: number;   // Default monthly budget limit
    isDefault: boolean;      // Default categories (semantics only, handled by isSystemLocked now)
    isSystemLocked?: boolean; // Cannot be deleted
    excludeFromTotals?: boolean; // Excluded from budget/spending totals
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Transaction - Income or expense entries
// ============================================
export type TransactionType = 'income' | 'expense' | 'savings';
export type RecurringType = 'monthly' | 'yearly' | 'weekly' | 'custom';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'bank_transfer' | 'other';

export interface Transaction {
    id?: number;
    amount: number;
    type: TransactionType;
    categoryId?: number; // Optional for savings
    date: Date;
    description: string;
    paymentMethod: PaymentMethod;
    cardName?: string;           // Name of the card used (for credit/debit)
    isRecurring: boolean;
    recurringType?: RecurringType;
    recurringInterval?: number;  // For custom recurring (e.g., every 2 weeks)
    savingsGoalId?: number;      // Link to a savings goal
    debtId?: number;             // Link to a debt liability
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Monthly Budget - Per-category budget for a specific month
// ============================================
export interface MonthlyBudget {
    id?: number;
    categoryId: number;
    year: number;
    month: number;             // 0-11 (JavaScript month format)
    plannedAmount: number;
    rolloverEnabled: boolean;  // Allow unused budget to roll over
    rolloverAmount: number;    // Amount rolled over from previous month
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Savings Goal - Target savings with progress tracking
// ============================================
export interface SavingsGoal {
    id?: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    monthlyContribution: number;
    color: string;
    icon: string;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Debt - Manual debt tracking with currency conversion
// ============================================
export interface Debt {
    id?: number;
    name: string;
    description: string;
    originalAmount: number;
    paidAmount: number; // For partial payments
    originalCurrency: string;
    interestRate?: number;
    dueDate?: Date;
    isPaid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// App Settings - User preferences
// ============================================
export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
    id?: number;
    currency: string;           // Currency code (e.g., 'USD', 'EUR', 'JPY')
    currencySymbol: string;     // Currency symbol (e.g., '$', '€', '¥')
    currencyLocale: string;     // Locale for formatting (e.g., 'en-US')
    firstDayOfMonth: number;    // 1-28, for custom budget periods
    theme: ThemeMode;
    highContrastMode: boolean;
    largeTextMode: boolean;
    hideFinancialValues: boolean; // Privacy mode: hide absolute numbers
    autoBackupEnabled: boolean;   // Enable backup on start
    autoBackupPath?: string;      // User-friendly path label
    lastAutoBackup?: string;      // ISO date of last auto-backup
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Extra State - Non-serializable state (not for export)
// ============================================
export interface ExtraState {
    key: string;
    value: any;
}

// ============================================
// Aggregated/Computed Types (not stored in DB)
// ============================================
export interface CategoryWithSpending extends Category {
    spent: number;
    remaining: number;
    percentUsed: number;
}

export interface MonthlyBudgetSummary {
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    planned: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    rollover: number;
}

export interface MonthlySummary {
    year: number;
    month: number;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    byCategory: Map<number, number>;  // categoryId -> amount
}

export interface YearlySummary {
    year: number;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    monthlyBreakdown: MonthlySummary[];
    categoryTotals: Map<number, number>;
}

// ============================================
// Form/Input Types
// ============================================
export interface TransactionFormData {
    amount: string;
    type: TransactionType;
    categoryId: number;
    date: string;  // ISO date string for form input
    description: string;
    paymentMethod: PaymentMethod;
    cardName: string;            // Name of the card used
    isRecurring: boolean;
    recurringType?: RecurringType;
    savingsGoalId?: number;
}

export interface CategoryFormData {
    name: string;
    color: string;
    icon: string;
    monthlyBudget: string;
}

export interface SavingsGoalFormData {
    name: string;
    targetAmount: string;
    currentAmount: string;
    targetDate: string;
    monthlyContribution: string;
    color: string;
    icon: string;
}

// ============================================
// Export/Import Types
// ============================================
export interface BackupData {
    version: number;
    exportedAt: string;
    categories: Category[];
    transactions: Transaction[];
    monthlyBudgets: MonthlyBudget[];
    savingsGoals: SavingsGoal[];
    debts: Debt[];
    settings: AppSettings | null;
}
