import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../db/schema';

/**
 * App Store - Global UI state management
 * Persisted to localStorage for theme preference retention
 */
interface AppState {
    // Sidebar state
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;

    // Theme state
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;

    // Modal states
    isTransactionModalOpen: boolean;
    editingTransactionId: number | null;
    transactionModalInitialData: any | null;
    openTransactionModal: (transactionId?: number, initialData?: any) => void;
    closeTransactionModal: () => void;

    isCategoryModalOpen: boolean;
    editingCategoryId: number | null;
    openCategoryModal: (categoryId?: number) => void;
    closeCategoryModal: () => void;

    isSavingsGoalModalOpen: boolean;
    editingSavingsGoalId: number | null;
    openSavingsGoalModal: (goalId?: number) => void;
    closeSavingsGoalModal: () => void;

    // Delete confirmation
    deleteConfirmation: {
        isOpen: boolean;
        type: 'transaction' | 'category' | 'goal' | 'all-data' | null;
        id: number | null;
        name: string;
    };
    openDeleteConfirmation: (type: 'transaction' | 'category' | 'goal' | 'all-data', id: number | null, name: string) => void;
    closeDeleteConfirmation: () => void;

    // Toast notifications
    toast: {
        isVisible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    };
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Sidebar
            sidebarCollapsed: false,
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            // Theme
            theme: 'system',
            setTheme: (theme) => set({ theme }),

            // Transaction Modal
            isTransactionModalOpen: false,
            editingTransactionId: null,
            transactionModalInitialData: null,
            openTransactionModal: (transactionId, initialData) => set({
                isTransactionModalOpen: true,
                editingTransactionId: transactionId ?? null,
                transactionModalInitialData: initialData ?? null,
            }),
            closeTransactionModal: () => set({
                isTransactionModalOpen: false,
                editingTransactionId: null,
                transactionModalInitialData: null,
            }),

            // Category Modal
            isCategoryModalOpen: false,
            editingCategoryId: null,
            openCategoryModal: (categoryId) => set({
                isCategoryModalOpen: true,
                editingCategoryId: categoryId ?? null,
            }),
            closeCategoryModal: () => set({
                isCategoryModalOpen: false,
                editingCategoryId: null,
            }),

            // Savings Goal Modal
            isSavingsGoalModalOpen: false,
            editingSavingsGoalId: null,
            openSavingsGoalModal: (goalId) => set({
                isSavingsGoalModalOpen: true,
                editingSavingsGoalId: goalId ?? null,
            }),
            closeSavingsGoalModal: () => set({
                isSavingsGoalModalOpen: false,
                editingSavingsGoalId: null,
            }),

            // Delete Confirmation
            deleteConfirmation: {
                isOpen: false,
                type: null,
                id: null,
                name: '',
            },
            openDeleteConfirmation: (type, id, name) => set({
                deleteConfirmation: { isOpen: true, type, id, name },
            }),
            closeDeleteConfirmation: () => set({
                deleteConfirmation: { isOpen: false, type: null, id: null, name: '' },
            }),

            // Toast
            toast: {
                isVisible: false,
                message: '',
                type: 'info',
            },
            showToast: (message, type = 'info') => {
                set({ toast: { isVisible: true, message, type } });
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    set((state) => ({
                        toast: { ...state.toast, isVisible: false },
                    }));
                }, 3000);
            },
            hideToast: () => set((state) => ({
                toast: { ...state.toast, isVisible: false },
            })),
        }),
        {
            name: 'budget-planner-app',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                theme: state.theme,
            }),
        }
    )
);
