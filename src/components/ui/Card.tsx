import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({
    children,
    className = '',
    hover = false,
    padding = 'md',
    onClick,
}: CardProps) {
    return (
        <div
            className={`
        card ${paddingClasses[padding]}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        >
            {children}
        </div>
    );
}

// Card Header
interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
    return (
        <div className={`flex items-start justify-between mb-4 ${className}`}>
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

// Card Footer
interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 ${className}`}>
            {children}
        </div>
    );
}

// Stat Card for dashboard
interface StatCardProps {
    title: string;
    value: string;
    change?: {
        value: string;
        type: 'positive' | 'negative' | 'neutral';
    };
    icon?: React.ReactNode;
    color?: string;
}

export function StatCard({ title, value, change, icon, color }: StatCardProps) {
    const changeColors = {
        positive: 'text-emerald-600 dark:text-emerald-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-slate-500 dark:text-slate-400',
    };

    return (
        <Card className="relative overflow-hidden">
            {color && (
                <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
                    style={{ backgroundColor: color }}
                />
            )}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {value}
                    </p>
                    {change && (
                        <p className={`text-sm mt-1 ${changeColors[change.type]}`}>
                            {change.value}
                        </p>
                    )}
                </div>
                {icon && (
                    <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: color ? `${color}20` : undefined }}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
