import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: 'Rs.',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency] || currency;
  
  if (currency === 'INR') {
    const formatted = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol} ${formatted}`;
  }
  
  return `${symbol} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Food & Dining': 'utensils',
    'Transportation': 'car',
    'Shopping': 'shopping-bag',
    'Entertainment': 'film',
    'Bills': 'receipt',
    'Travel': 'plane',
    'Groceries': 'apple',
    'Health': 'heart-pulse',
    'Transfer': 'arrow-left-right',
    'Wallet': 'wallet',
    'Settlement': 'check-circle',
  };
  return icons[category] || 'circle';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Food & Dining': '#4F46E5',
    'Transportation': '#6B4C9A',
    'Shopping': '#10B981',
    'Entertainment': '#F59E0B',
    'Bills': '#EF4444',
    'Travel': '#3B82F6',
    'Groceries': '#8B5CF6',
    'Health': '#EC4899',
  };
  return colors[category] || '#888888';
}

export const categoryIcons = [
  { name: 'Food & Dining', icon: 'utensils' },
  { name: 'Transportation', icon: 'car' },
  { name: 'Shopping', icon: 'shopping-bag' },
  { name: 'Entertainment', icon: 'film' },
  { name: 'Bills', icon: 'receipt' },
  { name: 'Travel', icon: 'plane' },
  { name: 'Groceries', icon: 'apple' },
  { name: 'Health', icon: 'heart-pulse' },
  { name: 'Others', icon: 'more-horizontal' },
];

export const currencies = [
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
];

export const exchangeRates: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SGD: 0.016,
};
