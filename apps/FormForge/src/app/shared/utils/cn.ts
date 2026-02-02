import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles class conflicts and conditional classes
 * 
 * @example
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500') // => 'px-4 py-2 bg-blue-500'
 * 
 * // Conditional classes
 * cn('px-4', isActive && 'bg-blue-500') // => 'px-4' or 'px-4 bg-blue-500'
 * 
 * // Override conflicts
 * cn('px-4', 'px-8') // => 'px-8' (tailwind-merge handles this)
 * 
 * // Object syntax
 * cn({ 'bg-blue-500': isActive, 'bg-gray-500': !isActive })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

