/**
 * Export and Import utilities for backup/restore functionality
 */

import { db } from '../db/database';
import type { BackupData } from '../db/schema';

const BACKUP_VERSION = 1;

/**
 * Exports all data to a JSON backup file
 */
export async function exportBackup(): Promise<string> {
    const [categories, transactions, monthlyBudgets, savingsGoals, settings] = await Promise.all([
        db.categories.toArray(),
        db.transactions.toArray(),
        db.monthlyBudgets.toArray(),
        db.savingsGoals.toArray(),
        db.appSettings.toArray(),
    ]);

    const backup: BackupData = {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        categories,
        transactions,
        monthlyBudgets,
        savingsGoals,
        settings: settings[0] ?? null,
    };

    return JSON.stringify(backup, null, 2);
}

/**
 * Downloads the backup as a JSON file
 */
export async function downloadBackup(): Promise<void> {
    const data = await exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Imports data from a backup file
 */
export async function importBackup(file: File): Promise<{ success: boolean; message: string }> {
    try {
        const text = await file.text();
        const backup = JSON.parse(text) as BackupData;

        // Validate backup structure
        if (!backup.version || !backup.categories || !backup.transactions) {
            return { success: false, message: 'Invalid backup file format' };
        }

        // Check version compatibility
        if (backup.version > BACKUP_VERSION) {
            return { success: false, message: 'Backup file is from a newer version' };
        }

        // Import data in a transaction
        await db.transaction('rw',
            [db.categories, db.transactions, db.monthlyBudgets, db.savingsGoals, db.appSettings],
            async () => {
                // Clear existing data
                await db.categories.clear();
                await db.transactions.clear();
                await db.monthlyBudgets.clear();
                await db.savingsGoals.clear();
                await db.appSettings.clear();

                // Import categories (convert dates)
                const categories = backup.categories.map(c => ({
                    ...c,
                    createdAt: new Date(c.createdAt),
                    updatedAt: new Date(c.updatedAt),
                }));
                await db.categories.bulkAdd(categories);

                // Import transactions (convert dates)
                const transactions = backup.transactions.map(t => ({
                    ...t,
                    date: new Date(t.date),
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt),
                }));
                await db.transactions.bulkAdd(transactions);

                // Import monthly budgets
                if (backup.monthlyBudgets?.length) {
                    const budgets = backup.monthlyBudgets.map(b => ({
                        ...b,
                        createdAt: new Date(b.createdAt),
                        updatedAt: new Date(b.updatedAt),
                    }));
                    await db.monthlyBudgets.bulkAdd(budgets);
                }

                // Import savings goals
                if (backup.savingsGoals?.length) {
                    const goals = backup.savingsGoals.map(g => ({
                        ...g,
                        targetDate: new Date(g.targetDate),
                        createdAt: new Date(g.createdAt),
                        updatedAt: new Date(g.updatedAt),
                    }));
                    await db.savingsGoals.bulkAdd(goals);
                }

                // Import settings
                if (backup.settings) {
                    await db.appSettings.add({
                        ...backup.settings,
                        createdAt: new Date(backup.settings.createdAt),
                        updatedAt: new Date(backup.settings.updatedAt),
                    });
                }
            }
        );

        return { success: true, message: `Imported ${backup.transactions.length} transactions successfully` };
    } catch (error) {
        console.error('Import error:', error);
        return { success: false, message: 'Failed to import backup file' };
    }
}

/**
 * Exports transactions to CSV format
 */
export async function exportToCSV(year?: number, month?: number): Promise<string> {
    let transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Filter by date if specified
    if (year !== undefined && month !== undefined) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59);
        transactions = transactions.filter(t => t.date >= start && t.date <= end);
    } else if (year !== undefined) {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59);
        transactions = transactions.filter(t => t.date >= start && t.date <= end);
    }

    // Sort by date
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Create CSV
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method'];
    const rows = transactions.map(t => [
        t.date.toISOString().split('T')[0],
        t.type,
        categoryMap.get(t.categoryId) ?? 'Unknown',
        t.amount.toFixed(2),
        `"${t.description.replace(/"/g, '""')}"`,
        t.paymentMethod,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Downloads transactions as CSV file
 */
export async function downloadCSV(year?: number, month?: number): Promise<void> {
    const data = await exportToCSV(year, month);
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const filename = year !== undefined && month !== undefined
        ? `budget-transactions-${year}-${String(month + 1).padStart(2, '0')}.csv`
        : year !== undefined
            ? `budget-transactions-${year}.csv`
            : `budget-transactions.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
