import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableWidgetProps {
    id: string;
    children: React.ReactNode;
    isEditing: boolean;
}

export function SortableWidget({ id, children, isEditing }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {isEditing && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-4 right-4 z-20 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    title="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-accent-500" />
                </div>
            )}
            <div className={`h-full transition-transform duration-200 ${isEditing && !isDragging ? 'group-hover:scale-[1.01]' : ''}`}>
                {children}
            </div>
            {isEditing && (
                <div className="absolute inset-0 border-2 border-dashed border-accent-500/20 rounded-xl pointer-events-none" />
            )}
        </div>
    );
}
