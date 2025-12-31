import Dexie, { type Table } from 'dexie';
import type {
    Category,
    Transaction,
    MonthlyBudget,
    SavingsGoal,
    AppSettings,
} from './schema';
import { defaultCategories, defaultSettings } from './seeds';

// @ts-ignore
import { getMonthRange, getYearRange } from '../utils/dateUtils';

/**
 * BudgetPlannerDB - Main database class using Dexie.js

 * 
 * This database stores all budget planner data locally in IndexedDB.
 * It supports versioned schema migrations and automatic seeding of default data.
 */
export class BudgetPlannerDB extends Dexie {
    // Table declarations for TypeScript type checking
    categories!: Table<Category, number>;
    transactions!: Table<Transaction, number>;
    monthlyBudgets!: Table<MonthlyBudget, number>;
    savingsGoals!: Table<SavingsGoal, number>;
    appSettings!: Table<AppSettings, number>;

    constructor() {
        super('BudgetPlannerDB');

        // Schema version 1 - Initial schema
        this.version(1).stores({
            // Primary key: ++id (auto-increment)
            // Indexed fields for querying
            categories: '++id, name, isDefault',
            transactions: '++id, categoryId, date, type, [date+type]',
            monthlyBudgets: '++id, categoryId, year, month, [categoryId+year+month], [year+month]',
            savingsGoals: '++id, name, targetDate, isCompleted',
            appSettings: '++id',
        });

        // Schema version 2 - Add indexes and seed new category
        this.version(2).stores({
            categories: '++id, name, isDefault', // Boolean indexing not supported, so remove excludeFromTotals
            // Other tables remain same, but must be restated or Dexie deletes them? 
            // Dexie inheritance: versions inherit from previous if not specified? 
            // No, Dexie requires all tables to be present in latest version if changed? 
            // Actually, usually you just define differences or strictly defined all. 
            // Safest to redefine all for clarity.
            transactions: '++id, categoryId, date, type, [date+type]',
            monthlyBudgets: '++id, categoryId, year, month, [categoryId+year+month], [year+month]',
            savingsGoals: '++id, name, targetDate, isCompleted',
            appSettings: '++id',
        }).upgrade(async tx => {
            // Add Debt Payback category if it doesn't exist
            const existing = await tx.table('categories').where('name').equals('Debt Payback').first();
            if (!existing) {
                await tx.table('categories').add({
                    name: 'Debt Payback',
                    color: '#be123c',
                    icon: 'credit-card',
                    monthlyBudget: 0,
                    isDefault: true,
                    isSystemLocked: true,
                    excludeFromTotals: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        });

        // Schema version 3 - Ensure Savings category exists
        this.version(3).stores({}).upgrade(async tx => {
            const existing = await tx.table('categories').where('name').equals('Savings').first();
            if (!existing) {
                await tx.table('categories').add({
                    name: 'Savings',
                    color: '#10b981',
                    icon: 'piggy-bank',
                    monthlyBudget: 500,
                    isDefault: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        });

        // Schema version 3 - Ensure Savings category exists
        this.version(3).stores({}).upgrade(async tx => {
            const existing = await tx.table('categories').where('name').equals('Savings').first();
            if (!existing) {
                await tx.table('categories').add({
                    name: 'Savings',
                    color: '#10b981',
                    icon: 'piggy-bank',
                    monthlyBudget: 500,
                    isDefault: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        });

        // Schema version 4 - Add savingsGoalId index and update Category flags
        this.version(4).stores({
            transactions: '++id, categoryId, date, type, savingsGoalId, [date+type]'
        }).upgrade(async tx => {
            // 1. Set Debt Payback to NOT exclude from totals (it is an expense)
            await tx.table('categories')
                .where('name').equals('Debt Payback')
                .modify({ excludeFromTotals: false });

            // 2. Set Savings to EXCLUDE from totals (it is a transfer)
            await tx.table('categories')
                .where('name').equals('Savings')
                .modify({ excludeFromTotals: true });
        });

        // Schema version 5 - Ensure Income category exists
        this.version(5).stores({}).upgrade(async tx => {
            const existing = await tx.table('categories').where('name').equals('Income').first();
            if (!existing) {
                await tx.table('categories').add({
                    name: 'Income',
                    color: '#10b981',
                    icon: 'wallet',
                    monthlyBudget: 0,
                    isDefault: true,
                    isSystemLocked: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        });

        // Hook to seed default data on database creation
        this.on('populate', async () => {
            await this.seedDefaultData();
        });
    }

    /**
     * Seeds the database with default categories and settings
     */
    private async seedDefaultData(): Promise<void> {
        // Add default categories
        await this.categories.bulkAdd(defaultCategories);

        // Add default settings
        await this.appSettings.add(defaultSettings);
    }

    /**
     * Resets all data and re-seeds defaults
     * Requires explicit confirmation to prevent accidental data loss
     */
    async resetAllData(confirmed: boolean = false): Promise<void> {
        if (!confirmed) {
            throw new Error('Reset requires explicit confirmation');
        }

        await this.transaction('rw',
            [this.categories, this.transactions, this.monthlyBudgets, this.savingsGoals, this.appSettings],
            async () => {
                await this.categories.clear();
                await this.transactions.clear();
                await this.monthlyBudgets.clear();
                await this.savingsGoals.clear();
                await this.appSettings.clear();
                await this.seedDefaultData();
            }
        );
    }

    /**
     * Helper to get start day setting
     */
    private async getStartDay(): Promise<number> {
        const settings = await this.appSettings.toCollection().first();
        return settings?.firstDayOfMonth ?? 1;
    }

    /**
     * Gets transactions for a specific month
     */
    async getTransactionsForMonth(year: number, month: number): Promise<Transaction[]> {
        const startDay = await this.getStartDay();
        // Use updated date util which now accepts startDay
        const { start, end } = getMonthRange(year, month, startDay);

        return this.transactions
            .where('date')
            .between(start, end, true, true)
            .toArray();
    }

    /**
     * Gets transactions for a specific year
     */
    async getTransactionsForYear(year: number): Promise<Transaction[]> {
        const startDay = await this.getStartDay();
        // Use updated date util which now accepts startDay
        const { start, end } = getYearRange(year, startDay);

        return this.transactions
            .where('date')
            .between(start, end, true, true)
            .toArray();
    }

    /**
     * Gets spending by category for a month
     */
    async getCategorySpendingForMonth(
        year: number,
        month: number
    ): Promise<Map<number, number>> {
        const transactions = await this.getTransactionsForMonth(year, month);
        const spending = new Map<number, number>();

        for (const tx of transactions) {
            const current = spending.get(tx.categoryId) ?? 0;
            if (tx.type === 'expense') {
                spending.set(tx.categoryId, current + tx.amount);
            } else if (tx.type === 'income') {
                spending.set(tx.categoryId, current - tx.amount);
            }
        }

        return spending;
    }

    /**
     * Gets total income and expenses for a month
     */
    async getMonthlyTotals(
        year: number,
        month: number
    ): Promise<{ income: number; expenses: number; savings: number }> {
        const transactions = await this.getTransactionsForMonth(year, month);

        // Get IDs of categories to exclude (filter in memory as boolean indexing is limited)
        const categories = await this.categories.toArray();
        const excludedSet = new Set(
            categories
                .filter(c => c.excludeFromTotals)
                .map(c => c.id!)
        );

        let income = 0;
        let expenses = 0;
        let savings = 0;

        for (const tx of transactions) {
            // Handle excluded categories (Savings)
            if (excludedSet.has(tx.categoryId)) {
                if (tx.type === 'expense') {
                    savings += tx.amount; // Deposit to savings
                } else {
                    savings -= tx.amount; // Withdrawal from savings
                }
                continue;
            }

            if (tx.type === 'income') {
                income += tx.amount;
            } else {
                expenses += tx.amount;
            }
        }

        return { income, expenses, savings };
    }

    /**
     * Gets total income and expenses for a year
     */
    async getYearlyTotals(
        year: number
    ): Promise<{ income: number; expenses: number; savings: number }> {
        const transactions = await this.getTransactionsForYear(year);

        // Get IDs of categories to exclude (filter in memory as boolean indexing is limited)
        const categories = await this.categories.toArray();
        const excludedSet = new Set(
            categories
                .filter(c => c.excludeFromTotals)
                .map(c => c.id!)
        );

        let income = 0;
        let expenses = 0;
        let savings = 0;

        for (const tx of transactions) {
            // Handle excluded categories (Savings)
            if (excludedSet.has(tx.categoryId)) {
                if (tx.type === 'expense') {
                    savings += tx.amount; // Deposit to savings
                } else {
                    savings -= tx.amount; // Withdrawal from savings
                }
                continue;
            }

            if (tx.type === 'income') {
                income += tx.amount;
            } else {
                expenses += tx.amount;
            }
        }

        return { income, expenses, savings };
    }

    /**
     * Gets budget for a category in a specific month
     */
    async getBudgetForCategoryMonth(
        categoryId: number,
        year: number,
        month: number
    ): Promise<MonthlyBudget | undefined> {
        return this.monthlyBudgets
            .where('[categoryId+year+month]')
            .equals([categoryId, year, month])
            .first();
    }

    /**
     * Sets or updates budget for a category in a specific month
     */
    async setBudgetForCategoryMonth(
        categoryId: number,
        year: number,
        month: number,
        plannedAmount: number,
        rolloverEnabled: boolean = false
    ): Promise<number> {
        const existing = await this.getBudgetForCategoryMonth(categoryId, year, month);
        const now = new Date();

        if (existing?.id) {
            await this.monthlyBudgets.update(existing.id, {
                plannedAmount,
                rolloverEnabled,
                updatedAt: now,
            });
            return existing.id;
        }

        return this.monthlyBudgets.add({
            categoryId,
            year,
            month,
            plannedAmount,
            rolloverEnabled,
            rolloverAmount: 0,
            createdAt: now,
            updatedAt: now,
        });
    }
}

// Singleton database instance
export const db = new BudgetPlannerDB();
