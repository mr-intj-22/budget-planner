import React from 'react';
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
