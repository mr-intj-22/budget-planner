import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, ColorPicker } from '../ui/Select';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/appStore';
import { useSavingsGoal, useSavingsGoalOperations } from '../../hooks/useSavingsGoals';
import { categoryColors, availableIcons } from '../../db/seeds';
import type { SavingsGoalFormData } from '../../db/schema';
import { formatDateForInput, parseDateInput } from '../../utils/dateUtils';

const initialFormData: SavingsGoalFormData = {
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    monthlyContribution: '',
    color: '#10b981',
    icon: 'piggy-bank',
};

export function SavingsGoalModal() {
    const { isSavingsGoalModalOpen, editingSavingsGoalId, closeSavingsGoalModal, showToast } = useAppStore();
    const { goal: editingGoal } = useSavingsGoal(editingSavingsGoalId);
    const { addGoal, updateGoal } = useSavingsGoalOperations();

    const [formData, setFormData] = useState<SavingsGoalFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof SavingsGoalFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isSavingsGoalModalOpen) {
            if (editingGoal) {
                setFormData({
                    name: editingGoal.name,
                    targetAmount: editingGoal.targetAmount.toString(),
                    currentAmount: editingGoal.currentAmount.toString(),
                    targetDate: formatDateForInput(new Date(editingGoal.targetDate)),
                    monthlyContribution: editingGoal.monthlyContribution.toString(),
                    color: editingGoal.color,
                    icon: editingGoal.icon,
                });
            } else {
                // Default target date: 1 year from now
                const defaultDate = new Date();
                defaultDate.setFullYear(defaultDate.getFullYear() + 1);
                setFormData({
                    ...initialFormData,
                    targetDate: formatDateForInput(defaultDate),
                });
            }
            setErrors({});
        }
    }, [isSavingsGoalModalOpen, editingGoal]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof SavingsGoalFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Goal name is required';
        }

        const targetAmount = parseFloat(formData.targetAmount);
        if (!formData.targetAmount || isNaN(targetAmount) || targetAmount <= 0) {
            newErrors.targetAmount = 'Please enter a valid target amount';
        }

        if (!formData.targetDate) {
            newErrors.targetDate = 'Please select a target date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const goalData = {
                name: formData.name.trim(),
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: parseFloat(formData.currentAmount) || 0,
                targetDate: parseDateInput(formData.targetDate),
                monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
                color: formData.color,
                icon: formData.icon,
                isCompleted: false,
            };

            if (editingSavingsGoalId) {
                await updateGoal(editingSavingsGoalId, goalData);
                showToast('Goal updated successfully', 'success');
            } else {
                await addGoal(goalData);
                showToast('Goal created successfully', 'success');
            }

            closeSavingsGoalModal();
        } catch (error) {
            console.error('Failed to save goal:', error);
            showToast('Failed to save goal', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const iconOptions = availableIcons.slice(0, 20).map((icon) => ({
        value: icon,
        label: icon.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    }));

    return (
        <Modal
            isOpen={isSavingsGoalModalOpen}
            onClose={closeSavingsGoalModal}
            title={editingSavingsGoalId ? 'Edit Savings Goal' : 'New Savings Goal'}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <Input
                    label="Goal Name"
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    autoFocus
                />

                {/* Target Amount */}
                <Input
                    label="Target Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    error={errors.targetAmount}
                />

                {/* Current Amount */}
                <Input
                    label="Current Savings"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    helperText="How much have you already saved?"
                />

                {/* Target Date */}
                <Input
                    label="Target Date"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    error={errors.targetDate}
                />

                {/* Monthly Contribution */}
                <Input
                    label="Monthly Contribution"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="500"
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                    helperText="How much will you save each month?"
                />

                {/* Color Picker */}
                <ColorPicker
                    label="Color"
                    colors={categoryColors}
                    value={formData.color}
                    onChange={(color) => setFormData({ ...formData, color })}
                />

                {/* Icon Selector */}
                <Select
                    label="Icon"
                    options={iconOptions}
                    value={formData.icon}
                    onChange={(value) => setFormData({ ...formData, icon: value })}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={closeSavingsGoalModal}
                        fullWidth
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        fullWidth
                    >
                        {editingSavingsGoalId ? 'Save Changes' : 'Create Goal'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
