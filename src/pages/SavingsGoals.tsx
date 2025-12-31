import React from 'react';
import { SavingsGoalList } from '../components/savings/SavingsGoalList';

export function SavingsGoals() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Savings Goals
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Track your progress towards financial goals
                </p>
            </div>

            {/* Goals List */}
            <SavingsGoalList />
        </div>
    );
}
