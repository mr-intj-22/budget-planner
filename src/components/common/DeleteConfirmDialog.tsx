import React, { useState } from 'react';
import { ConfirmDialog } from '../ui/Modal';
import { useAppStore } from '../../stores/appStore';
import { useTransactionOperations } from '../../hooks/useTransactions';
import { useCategoryOperations } from '../../hooks/useCategories';
import { useSavingsGoalOperations } from '../../hooks/useSavingsGoals';
import { db } from '../../db/database';

export function DeleteConfirmDialog() {
    const { deleteConfirmation, closeDeleteConfirmation, showToast } = useAppStore();
    const { deleteTransaction } = useTransactionOperations();
    const { deleteCategory } = useCategoryOperations();
    const { deleteGoal } = useSavingsGoalOperations();
    const [isDeleting, setIsDeleting] = useState(false);

    const getTitle = () => {
        switch (deleteConfirmation.type) {
            case 'transaction':
                return 'Delete Transaction';
            case 'category':
                return 'Delete Category';
            case 'goal':
                return 'Delete Savings Goal';
            case 'all-data':
                return 'Reset All Data';
            default:
                return 'Delete';
        }
    };

    const getMessage = () => {
        switch (deleteConfirmation.type) {
            case 'transaction':
                return `Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone.`;
            case 'category':
                return `Are you sure you want to delete the "${deleteConfirmation.name}" category? Make sure no transactions are using this category.`;
            case 'goal':
                return `Are you sure you want to delete "${deleteConfirmation.name}"? All progress will be lost.`;
            case 'all-data':
                return 'This will permanently delete ALL your data including transactions, categories, budgets, and settings. This cannot be undone!';
            default:
                return 'Are you sure you want to delete this item?';
        }
    };

    const handleConfirm = async () => {
        setIsDeleting(true);

        try {
            switch (deleteConfirmation.type) {
                case 'transaction':
                    if (deleteConfirmation.id) {
                        await deleteTransaction(deleteConfirmation.id);
                        showToast('Transaction deleted', 'success');
                    }
                    break;
                case 'category':
                    if (deleteConfirmation.id) {
                        await deleteCategory(deleteConfirmation.id);
                        showToast('Category deleted', 'success');
                    }
                    break;
                case 'goal':
                    if (deleteConfirmation.id) {
                        await deleteGoal(deleteConfirmation.id);
                        showToast('Goal deleted', 'success');
                    }
                    break;
                case 'all-data':
                    await db.resetAllData(true);
                    showToast('All data has been reset', 'success');
                    break;
            }
            closeDeleteConfirmation();
        } catch (error) {
            console.error('Delete failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete';
            showToast(errorMessage, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ConfirmDialog
            isOpen={deleteConfirmation.isOpen}
            onClose={closeDeleteConfirmation}
            onConfirm={handleConfirm}
            title={getTitle()}
            message={getMessage()}
            confirmLabel={deleteConfirmation.type === 'all-data' ? 'Reset Everything' : 'Delete'}
            variant={deleteConfirmation.type === 'all-data' ? 'danger' : 'danger'}
            isLoading={isDeleting}
        />
    );
}
