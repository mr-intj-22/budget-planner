import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { Settings2, Check, RefreshCcw } from 'lucide-react';
import { useDateStore } from '../stores/dateStore';
import { useSettings } from '../hooks/useSettings';
import { SortableWidget } from '../components/dashboard/SortableWidget';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { SpendingLineChart } from '../components/dashboard/SpendingLineChart';
import { BudgetProgressList } from '../components/dashboard/BudgetProgressList';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { HealthScoreDial } from '../components/dashboard/HealthScoreDial';
import { Button } from '../components/ui/Button';

const DEFAULT_LAYOUT = ['spending-chart', 'expense-pie', 'budget-list', 'recent-transactions', 'health-score'];

export function Dashboard() {
    const { getMonthYearString } = useDateStore();
    const { settings, updateSettings } = useSettings();
    const [isEditing, setIsEditing] = useState(false);

    const layout = settings?.dashboardLayout || DEFAULT_LAYOUT;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require dragging a bit before starting
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = layout.indexOf(active.id as string);
            const newIndex = layout.indexOf(over.id as string);
            const newLayout = arrayMove(layout, oldIndex, newIndex);
            updateSettings({ dashboardLayout: newLayout });
        }
    };

    const resetLayout = () => {
        updateSettings({ dashboardLayout: DEFAULT_LAYOUT });
    };

    const renderWidget = (id: string) => {
        switch (id) {
            case 'spending-chart': return <SpendingLineChart />;
            case 'expense-pie': return <ExpensePieChart />;
            case 'budget-list': return <BudgetProgressList />;
            case 'recent-transactions': return <RecentTransactions limit={5} />;
            case 'health-score': return <HealthScoreDial />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Page Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Overview for {getMonthYearString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={resetLayout}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    )}
                    <Button
                        variant={isEditing ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? (
                            <><Check className="w-4 h-4 mr-2" /> Finish Editing</>
                        ) : (
                            <><Settings2 className="w-4 h-4 mr-2" /> Customize Layout</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Static Summary Cards (Top) */}
            <SummaryCards />

            {/* Draggable Content Area */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={layout}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {layout.map((id) => (
                            <div
                                key={id}
                                className={id === 'health-score' ? 'lg:col-span-2' : ''}
                            >
                                <SortableWidget id={id} isEditing={isEditing}>
                                    {renderWidget(id)}
                                </SortableWidget>
                            </div>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
