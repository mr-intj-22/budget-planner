import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { ColorPicker, IconPicker } from '../ui/Select';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/appStore';
import { useCategory, useCategoryOperations } from '../../hooks/useCategories';
import { categoryColors, availableIcons } from '../../db/seeds';
import type { CategoryFormData } from '../../db/schema';

const initialFormData: CategoryFormData = {
    name: '',
    color: '#6366f1',
    icon: 'more-horizontal',
    monthlyBudget: '',
};

export function CategoryModal() {
    const { isCategoryModalOpen, editingCategoryId, closeCategoryModal, showToast } = useAppStore();
    const { category: editingCategory } = useCategory(editingCategoryId);
    const { addCategory, updateCategory } = useCategoryOperations();

    const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isCategoryModalOpen) {
            if (editingCategory) {
                setFormData({
                    name: editingCategory.name,
                    color: editingCategory.color,
                    icon: editingCategory.icon,
                    monthlyBudget: editingCategory.monthlyBudget.toString(),
                });
            } else {
                setFormData(initialFormData);
            }
            setErrors({});
        }
    }, [isCategoryModalOpen, editingCategory]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }

        const budget = parseFloat(formData.monthlyBudget);
        if (formData.monthlyBudget && (isNaN(budget) || budget < 0)) {
            newErrors.monthlyBudget = 'Please enter a valid budget amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const categoryData = {
                name: formData.name.trim(),
                color: formData.color,
                icon: formData.icon,
                monthlyBudget: parseFloat(formData.monthlyBudget) || 0,
                isDefault: editingCategory?.isDefault ?? false,
            };

            if (editingCategoryId) {
                await updateCategory(editingCategoryId, categoryData);
                showToast('Category updated successfully', 'success');
            } else {
                await addCategory(categoryData);
                showToast('Category created successfully', 'success');
            }

            closeCategoryModal();
        } catch (error) {
            console.error('Failed to save category:', error);
            showToast('Failed to save category', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <Modal
            isOpen={isCategoryModalOpen}
            onClose={closeCategoryModal}
            title={editingCategoryId ? 'Edit Category' : 'New Category'}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Preview */}
                <div className="flex items-center justify-center py-4">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${formData.color}20` }}
                    >
                        <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: formData.color }}
                        />
                    </div>
                </div>

                {/* Name */}
                <Input
                    label="Category Name"
                    placeholder="e.g., Coffee, Gym, etc."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    autoFocus
                />

                {/* Color Picker */}
                <ColorPicker
                    label="Color"
                    colors={categoryColors}
                    value={formData.color}
                    onChange={(color) => setFormData({ ...formData, color })}
                />

                {/* Icon Picker */}
                <IconPicker
                    label="Icon"
                    icons={availableIcons}
                    value={formData.icon}
                    onChange={(icon) => setFormData({ ...formData, icon })}
                    color={formData.color}
                />

                {/* Monthly Budget */}
                <Input
                    label="Default Monthly Budget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                    error={errors.monthlyBudget}
                    helperText="Set a default budget limit for this category"
                />

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={closeCategoryModal}
                        fullWidth
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        fullWidth
                    >
                        {editingCategoryId ? 'Save Changes' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
