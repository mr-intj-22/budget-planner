import React from 'react';
import { CategoryList } from '../components/categories/CategoryList';

export function Categories() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Categories
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage your spending categories and budgets
                </p>
            </div>

            {/* Category List */}
            <CategoryList />
        </div>
    );
}
