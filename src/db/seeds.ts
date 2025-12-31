import type { Category, AppSettings } from './schema';

/**
 * Default categories with colors and icons
 * These are seeded when the database is first created
 */
export const defaultCategories: Category[] = [
    {
        name: 'Rent / Mortgage',
        color: '#8b5cf6',
        icon: 'home',
        monthlyBudget: 1500,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Car',
        color: '#06b6d4',
        icon: 'car',
        monthlyBudget: 400,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Groceries',
        color: '#22c55e',
        icon: 'shopping-cart',
        monthlyBudget: 600,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Utilities',
        color: '#eab308',
        icon: 'zap',
        monthlyBudget: 200,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Internet & Phone',
        color: '#3b82f6',
        icon: 'wifi',
        monthlyBudget: 100,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Subscriptions',
        color: '#ec4899',
        icon: 'tv',
        monthlyBudget: 50,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Travel',
        color: '#f97316',
        icon: 'plane',
        monthlyBudget: 200,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Entertainment',
        color: '#a855f7',
        icon: 'gamepad-2',
        monthlyBudget: 150,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Health',
        color: '#14b8a6',
        icon: 'heart-pulse',
        monthlyBudget: 100,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Insurance',
        color: '#64748b',
        icon: 'shield',
        monthlyBudget: 300,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Personal',
        color: '#f43f5e',
        icon: 'user',
        monthlyBudget: 200,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Savings',
        color: '#10b981',
        icon: 'piggy-bank',
        monthlyBudget: 500,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Miscellaneous',
        color: '#6b7280',
        icon: 'more-horizontal',
        monthlyBudget: 100,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

/**
 * Income category (special - not for expenses)
 */
export const incomeCategory: Category = {
    name: 'Income',
    color: '#10b981',
    icon: 'wallet',
    monthlyBudget: 0,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

/**
 * Default application settings
 */
export const defaultSettings: AppSettings = {
    currency: 'USD',
    currencySymbol: '$',
    currencyLocale: 'en-US',
    firstDayOfMonth: 1,
    theme: 'system',
    highContrastMode: false,
    largeTextMode: false,
    createdAt: new Date(),
    updatedAt: new Date(),
};

/**
 * Available currencies for settings
 */
export const availableCurrencies = [
    { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
    { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', locale: 'zh-CN', name: 'Chinese Yuan' },
    { code: 'KRW', symbol: '₩', locale: 'ko-KR', name: 'Korean Won' },
    { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
    { code: 'CAD', symbol: '$', locale: 'en-CA', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: '$', locale: 'en-AU', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'CHF', locale: 'de-CH', name: 'Swiss Franc' },
];

/**
 * Available icons for categories
 */
export const availableIcons = [
    'home', 'car', 'shopping-cart', 'zap', 'wifi', 'tv', 'plane',
    'gamepad-2', 'heart-pulse', 'shield', 'user', 'piggy-bank',
    'more-horizontal', 'wallet', 'credit-card', 'gift', 'coffee',
    'utensils', 'book', 'music', 'film', 'camera', 'smartphone',
    'laptop', 'watch', 'glasses', 'shirt', 'scissors', 'wrench',
    'hammer', 'brush', 'baby', 'dog', 'cat', 'bike', 'bus',
    'train', 'ship', 'fuel', 'parking', 'building', 'store',
    'church', 'school', 'hospital', 'pill', 'stethoscope',
    'dumbbell', 'trophy', 'ticket', 'umbrella', 'briefcase',
];

/**
 * Category color palette for color picker
 */
export const categoryColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b', '#71717a', '#6b7280',
];
