// Benita Granites — Utility Functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number in Indian numbering system
 */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString('en-IN');
}

/**
 * Format currency in INR (lakhs/crores)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a block ID
 */
export function generateBlockId(sequence: number): string {
  return `BG-${String(sequence).padStart(5, '0')}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate CBM from dimensions
 */
export function calculateCBM(length: number, width: number, height: number): number {
  return Number(((length * width * height) / 1000000).toFixed(3));
}

/**
 * Calculate fuel consumption
 */
export function calculateFuelConsumption(
  opening: number,
  added: number,
  closing: number
): number {
  return opening + added - closing;
}

/**
 * Calculate litres per operating hour
 */
export function calculateLitresPerHour(consumption: number, hours: number): number {
  if (hours === 0) return 0;
  return Number((consumption / hours).toFixed(1));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Translate Firebase errors to user-friendly messages
 */
export function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups.',
    'permission-denied': "You don't have permission to perform this action.",
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'not-found': 'The requested resource was not found.',
  };
  return messages[code] || `An unexpected error occurred: ${code}. Please try again.`;
}

/**
 * Status color helper
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Block statuses
    dug: 'bg-info-bg text-info border-info-border',
    ready_for_dressing: 'bg-warning-bg text-warning border-warning-border',
    dressing: 'bg-info-bg text-info border-info-border',
    ready_for_sale: 'bg-success-bg text-success border-success-border',
    reserved: 'bg-warning-bg text-warning border-warning-border',
    sold: 'bg-success-bg text-success border-success-border',
    dispatched: 'bg-slate-50 text-slate border-slate-200',
    // Approval
    draft: 'bg-slate-50 text-slate border-slate-200',
    submitted: 'bg-info-bg text-info border-info-border',
    verified: 'bg-teal-50 text-teal border-teal-200',
    approved: 'bg-success-bg text-success border-success-border',
    rejected: 'bg-critical-bg text-critical border-critical-border',
    cancelled: 'bg-slate-50 text-slate border-slate-200',
    // Payment
    pending: 'bg-warning-bg text-warning border-warning-border',
    paid: 'bg-success-bg text-success border-success-border',
    partially_paid: 'bg-info-bg text-info border-info-border',
    // Equipment
    active: 'bg-success-bg text-success border-success-border',
    inactive: 'bg-slate-50 text-slate border-slate-200',
    under_maintenance: 'bg-warning-bg text-warning border-warning-border',
    // Exception
    open: 'bg-critical-bg text-critical border-critical-border',
    acknowledged: 'bg-warning-bg text-warning border-warning-border',
    resolved: 'bg-success-bg text-success border-success-border',
    // General
    warning: 'bg-warning-bg text-warning border-warning-border',
    critical: 'bg-critical-bg text-critical border-critical-border',
    success: 'bg-success-bg text-success border-success-border',
    info: 'bg-info-bg text-info border-info-border',
  };
  return colors[status] || 'bg-slate-50 text-slate border-slate-200';
}
