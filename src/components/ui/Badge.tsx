import React from 'react';
import * as Icons from 'lucide-react';
import type { Category } from '../../db/schema';

interface BadgeProps {
    children: React.ReactNode;
    color?: string;
    variant?: 'solid' | 'outline' | 'subtle';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({
    children,
    color = '#6366f1',
    variant = 'subtle',
    size = 'sm',
    className = '',
}: BadgeProps) {
    const getStyles = () => {
        switch (variant) {
            case 'solid':
                return {
                    backgroundColor: color,
                    color: 'white',
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderColor: color,
                    color: color,
                    borderWidth: '1px',
                };
            case 'subtle':
            default:
                return {
                    backgroundColor: `${color}20`,
                    color: color,
                };
        }
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={`badge ${sizeClasses[size]} ${className}`}
            style={getStyles()}
        >
            {children}
        </span>
    );
}

// Category Badge with icon
interface CategoryBadgeProps {
    category: Pick<Category, 'name' | 'color' | 'icon'>;
    size?: 'sm' | 'md';
    showIcon?: boolean;
}

export function CategoryBadge({
    category,
    size = 'sm',
    showIcon = true,
}: CategoryBadgeProps) {
    // Get icon component dynamically
    const iconName = category.icon
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') as keyof typeof Icons;

    const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }> | undefined;

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
    };

    return (
        <Badge color={category.color} size={size}>
            {showIcon && IconComponent && (
                <IconComponent className={iconSizes[size]} />
            )}
            {category.name}
        </Badge>
    );
}

// Transaction type badge
interface TypeBadgeProps {
    type: 'income' | 'expense' | 'savings';
}

export function TypeBadge({ type }: TypeBadgeProps) {
    const getColor = () => {
        switch (type) {
            case 'income': return '#10b981';
            case 'expense': return '#ef4444';
            case 'savings': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const getLabel = () => {
        switch (type) {
            case 'income': return 'Income';
            case 'expense': return 'Expense';
            case 'savings': return 'Savings';
            default: return type;
        }
    };

    return (
        <Badge
            color={getColor()}
            variant="subtle"
            size="sm"
        >
            {getLabel()}
        </Badge>
    );
}
