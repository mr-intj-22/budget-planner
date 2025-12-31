import React from 'react';
import { FileQuestion, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                {icon ?? <FileQuestion className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action && (
                <Button icon={Plus} onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}

// Loading Skeleton
interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    };

    return (
        <div
            className={`
        animate-pulse bg-slate-200 dark:bg-slate-700
        ${variantClasses[variant]}
        ${className}
      `}
            style={{
                width: width ?? '100%',
                height: height ?? (variant === 'text' ? '1em' : '100%'),
            }}
        />
    );
}

// Loading Card Skeleton
export function CardSkeleton() {
    return (
        <div className="card p-6">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                    <Skeleton variant="text" height={20} className="mb-2" width="60%" />
                    <Skeleton variant="text" height={16} width="40%" />
                </div>
            </div>
            <Skeleton variant="rectangular" height={8} className="mb-2" />
            <div className="flex justify-between">
                <Skeleton variant="text" width={60} height={14} />
                <Skeleton variant="text" width={40} height={14} />
            </div>
        </div>
    );
}

// Toast notification
interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
    if (!isVisible) return null;

    const typeStyles = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-accent-500',
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div
                className={`
          ${typeStyles[type]} text-white px-4 py-3 rounded-xl shadow-lg
          flex items-center gap-3
        `}
            >
                <span>{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 hover:opacity-80"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
