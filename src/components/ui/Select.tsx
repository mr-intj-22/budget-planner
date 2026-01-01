import React from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange: (value: string) => void;
}

export function Select({
    label,
    error,
    options,
    placeholder,
    onChange,
    value,
    className = '',
    id,
    ...props
}: SelectProps) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="label">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={inputId}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
            input appearance-none cursor-pointer pr-10
            ${error ? 'input-error' : ''}
          `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

// Color Picker
interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    colors: string[];
    label?: string;
}

export function ColorPicker({ value, onChange, colors, label }: ColorPickerProps) {
    return (
        <div>
            {label && <p className="label">{label}</p>}
            <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className={`
              w-8 h-8 rounded-full transition-all duration-200
              ${value === color
                                ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                                : 'hover:scale-110'
                            }
            `}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                    />
                ))}
            </div>
        </div>
    );
}

// Icon Picker
interface IconPickerProps {
    value: string;
    onChange: (icon: string) => void;
    icons: string[];
    label?: string;
    color?: string;
}

export function IconPicker({ value, onChange, icons, label, color = '#6366f1' }: IconPickerProps) {
    return (
        <div>
            {label && <p className="label">{label}</p>}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                {icons.map((iconName) => {
                    // Convert kebab-case to PascalCase for Lucide icons
                    const pascalName = iconName
                        .split('-')
                        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                        .join('') as keyof typeof Icons;

                    const IconComponent = Icons[pascalName] as React.ElementType;

                    return (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => onChange(iconName)}
                            className={`
                                aspect-square rounded-lg flex items-center justify-center transition-all duration-200
                                ${value === iconName
                                    ? 'bg-white dark:bg-slate-800 shadow-md ring-2 ring-slate-900 dark:ring-white scale-110 z-10'
                                    : 'hover:bg-white/80 dark:hover:bg-slate-800/80 hover:scale-105 opacity-60 hover:opacity-100'
                                }
                            `}
                            aria-label={`Select icon ${iconName}`}
                        >
                            {IconComponent ? (
                                <IconComponent
                                    className="w-5 h-5"
                                    style={{ color: value === iconName ? color : 'currentColor' }}
                                />
                            ) : (
                                <span className="text-[10px]">{iconName}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
