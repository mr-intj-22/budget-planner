import Dexie, { type Table } from 'dexie';
import type {
    Category,
    Transaction,
    MonthlyBudget,
    SavingsGoal,
    AppSettings,
} from './schema';
import { defaultCategories, defaultSettings } from './seeds';

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
     * Gets transactions for a specific month
     */
    async getTransactionsForMonth(year: number, month: number): Promise<Transaction[]> {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        return this.transactions
            .where('date')
            .between(startDate, endDate, true, true)
            .toArray();
    }

    /**
     * Gets transactions for a specific year
     */
    async getTransactionsForYear(year: number): Promise<Transaction[]> {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        return this.transactions
            .where('date')
            .between(startDate, endDate, true, true)
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
            if (tx.type === 'expense') {
                const current = spending.get(tx.categoryId) ?? 0;
                spending.set(tx.categoryId, current + tx.amount);
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
    ): Promise<{ income: number; expenses: number }> {
        const transactions = await this.getTransactionsForMonth(year, month);

        let income = 0;
        let expenses = 0;

        for (const tx of transactions) {
            if (tx.type === 'income') {
                income += tx.amount;
            } else {
                expenses += tx.amount;
            }
        }

        return { income, expenses };
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
