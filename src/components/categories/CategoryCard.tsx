import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import type { Category } from '../../db/schema';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../hooks/useSettings';
import { useAppStore } from '../../stores/appStore';
import { useCategorySpending } from '../../hooks/useTransactions';

interface CategoryCardProps {
    category: Category;
    showBudgetProgress?: boolean;
}

export function CategoryCard({ category, showBudgetProgress = true }: CategoryCardProps) {
    const { settings } = useSettings();
    const { openCategoryModal, openDeleteConfirmation } = useAppStore();
    const { spending } = useCategorySpending();

    const spent = spending.get(category.id ?? 0) ?? 0;
    const budget = category.monthlyBudget;
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

    // Get icon component
    const iconName = category.icon
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') as keyof typeof Icons;
    const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }> | undefined;

    const handleEdit = () => {
        openCategoryModal(category.id);
    };

    const handleDelete = () => {
        if (category.isDefault) {
            return; // Can't delete default categories
        }
        openDeleteConfirmation('category', category.id!, category.name);
    };

    return (
        <Card hover className="group relative">
            {/* Edit/Delete buttons */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton
                    icon={Edit2}
                    size="sm"
                    onClick={handleEdit}
                    aria-label={`Edit ${category.name}`}
                />
                {!category.isDefault && (
                    <IconButton
                        icon={Trash2}
                        size="sm"
                        onClick={handleDelete}
                        aria-label={`Delete ${category.name}`}
                        className="hover:text-red-500"
                    />
                )}
            </div>

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                >
                    {IconComponent ? (
                        <IconComponent className="w-6 h-6" style={{ color: category.color }} />
                    ) : (
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {category.name}
                    </h3>

                    {showBudgetProgress && budget > 0 ? (
                        <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500 dark:text-slate-400">
                                    {formatCurrency(spent, settings)} spent
                                </span>
                                <span className={`font-medium ${remaining >= 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {remaining >= 0 ? formatCurrency(remaining, settings) + ' left' : formatCurrency(Math.abs(remaining), settings) + ' over'}
                                </span>
                            </div>
                            <ProgressBar
                                value={percentUsed}
                                color={category.color}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Budget: {formatCurrency(budget, settings)}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}
