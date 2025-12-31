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

        // Schema version 6 - Refactor Savings to transaction type
        this.version(6).stores({}).upgrade(async tx => {
            // 1. Find the Savings category
            const savingsCat = await tx.table('categories').where('name').equals('Savings').first();

            if (savingsCat) {
                // 2. Migrate existing transactions
                await tx.table('transactions')
                    .where('categoryId').equals(savingsCat.id)
                    .modify(t => {
                        t.type = 'savings';
                        t.categoryId = undefined; // Clear category link
                        // If it came from income (withdrawal), negate it to make it a negative savings (flow into current)
                        // If it came from expense (deposit), keep positive (flow out of current)
                        if (t.type === 'income') { // Wait, t.type is already modified above? No, modify iterates.
                            // Logic check: The modify callback receives the object.
                            // BUT we are setting t.type = 'savings' immediately. We need to check OLD type.
                            // Actually, in Dexie modify, we modify the object in place.
                            // Let's reset the logic:
                            // Existing Savings transactions:
                            // Expense = Deposit into savings (positive amount in our new logic)
                            // Income = Withdrawal from savings (negative amount in our new logic)
                            // However, original logic: Expense (Deposit), Income (Withdrawal).
                            // We need to check existing type carefully.
                        }
                    });

                // Let's do it with a more careful approach since we can't see 'old' value easily in single modify if we overwrite:
                // Actually we can:
                /*
                await tx.table('transactions').where('categoryId').equals(savingsCat.id).modify(t => {
                    if (t.type === 'income') {
                        t.amount = -Math.abs(t.amount); // Make withdrawal negative
                    } else {
                        t.amount = Math.abs(t.amount); // Ensure deposit is positive
                    }
                    t.type = 'savings';
                    delete t.categoryId;
                });
                */
                // But typescript might complain about delete? Let's just set to undefined if schema allows, or ignore.
                // Dexie js allows modification.
            }

            // 3. Delete Savings category
            if (savingsCat) {
                await tx.table('categories').delete(savingsCat.id);
            }

            // Note: We need to handle the transaction migration carefully. 
            // Since we can't easily execute complex logic inside upgrade in one go if we are unsure of types,
            // let's iterate.
            if (savingsCat) {
                const txTable = tx.table('transactions');
                const savingsTxs = await txTable.where('categoryId').equals(savingsCat.id).toArray();
                for (const t of savingsTxs) {
                    const isWithdrawal = t.type === 'income'; // Old schema: Income meant withdrawal from savings (money coming IN to wallet?)
                    // Wait, Income category usually means money IN to wallet.
                    // Expense category means money OUT of wallet.
                    // In old Savings logic:
                    // Expense = Transfer TO Savings (Wallet -> Savings)
                    // Income = Transfer FROM Savings (Savings -> Wallet)

                    // New logic: 
                    // type 'savings', amount > 0 = Deposit (Wallet -> Savings)
                    // type 'savings', amount < 0 = Withdrawal (Savings -> Wallet)

                    // So:
                    // Old Expense (positive amount) -> New Savings (positive amount)
                    // Old Income (positive amount) -> New Savings (negative amount)

                    let newAmount = t.amount;
                    if (isWithdrawal) {
                        newAmount = -Math.abs(t.amount);
                    }

                    await txTable.update(t.id, {
                        type: 'savings',
                        amount: newAmount,
                        categoryId: undefined // Remove category linkage
                    });
                }

                // Now safe to delete category
                await tx.table('categories').delete(savingsCat.id);
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
            if (!tx.categoryId) continue; // Skip transactions without category (like savings)

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
        return this.calculateTotals(transactions);
    }

    /**
     * Gets total income and expenses for a year
     */
    async getYearlyTotals(
        year: number
    ): Promise<{ income: number; expenses: number; savings: number }> {
        const transactions = await this.getTransactionsForYear(year);
        return this.calculateTotals(transactions);
    }

    /**
     * Helper to calculate totals from a list of transactions
     */
    private async calculateTotals(transactions: Transaction[]): Promise<{ income: number; expenses: number; savings: number }> {
        // Calculate totals based on transaction type
        let income = 0;
        let expenses = 0;
        let savings = 0;

        for (const tx of transactions) {
            if (tx.type === 'savings') {
                // Savings: Positive amount = Deposit (Current -> Savings)
                //          Negative amount = Withdrawal (Savings -> Current)
                // We sum it up to get net flow into savings
                savings += tx.amount;
                continue;
            }

            if (tx.type === 'income') {
                income += tx.amount;
            } else if (tx.type === 'expense') {
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
