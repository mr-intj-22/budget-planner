import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { CategoryCard } from './CategoryCard';
import { useCategories } from '../../hooks/useCategories';
import { useAppStore } from '../../stores/appStore';

export function CategoryList() {
    const { categories, isLoading } = useCategories();
    const { openCategoryModal } = useAppStore();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <div className="animate-pulse flex items-start gap-4">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="flex-1">
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <Card>
                <EmptyState
                    icon={<FolderOpen className="w-8 h-8 text-slate-400" />}
                    title="No categories"
                    description="Create categories to organize your transactions"
                    action={{
                        label: 'Add Category',
                        onClick: () => openCategoryModal(),
                    }}
                />
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {categories.length} categories
                </p>
                <Button icon={Plus} onClick={() => openCategoryModal()} size="sm">
                    Add Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </div>
    );
}
