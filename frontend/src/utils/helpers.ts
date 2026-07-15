import type { ApplicationStatus } from '../types';

export const statusColors: Record<ApplicationStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  SUBMITTED: 'bg-gov-blue-light text-gov-blue border border-gov-blue/20 dark:bg-gov-blue/20 dark:text-blue-200 dark:border-gov-blue/40',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700',
  APPROVED: 'bg-gov-green-light text-gov-green border border-gov-green/20 dark:bg-gov-green/20 dark:text-green-200 dark:border-gov-green/40',
  REJECTED: 'bg-red-50 text-gov-error border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  COMPLETED: 'bg-gov-green-light text-gov-success border border-gov-success/20 dark:bg-gov-success/20 dark:text-green-200 dark:border-gov-success/40',
};

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

