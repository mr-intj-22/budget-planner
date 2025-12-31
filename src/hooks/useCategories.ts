/**
 * React hooks for category data access
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Category } from '../db/schema';

/**
 * Hook to get all categories
 */
export function useCategories() {
    const categories = useLiveQuery(
        () => db.categories.orderBy('name').toArray(),
        []
    );

    return {
        categories: categories ?? [],
        isLoading: categories === undefined,
    };
}

/**
 * Hook to get a single category by ID
 */
export function useCategory(id: number | null) {
    const category = useLiveQuery(
        () => (id ? db.categories.get(id) : undefined),
        [id]
    );

    return {
        category,
        isLoading: id !== null && category === undefined,
    };
}

/**
 * Hook for category CRUD operations
 */
export function useCategoryOperations() {
    const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date();
        return db.categories.add({
            ...category,
            createdAt: now,
            updatedAt: now,
        });
    };

    const updateCategory = async (id: number, updates: Partial<Category>) => {
        return db.categories.update(id, {
            ...updates,
            updatedAt: new Date(),
        });
    };

    const deleteCategory = async (id: number) => {
        // Check if category is used by any transactions
        const transactionCount = await db.transactions
            .where('categoryId')
            .equals(id)
            .count();

        if (transactionCount > 0) {
            throw new Error(`Cannot delete category with ${transactionCount} transactions`);
        }

        // Check if it's a default category
        const category = await db.categories.get(id);
        if (category?.isDefault) {
            throw new Error('Cannot delete default categories');
        }

        return db.categories.delete(id);
    };

    return {
        addCategory,
        updateCategory,
        deleteCategory,
    };
}
