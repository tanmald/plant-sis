import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the plant parent title - always returns "Plant Bestie"
 * @deprecated Identity preference is no longer used
 */
export function getPlantTitle(): string {
  return 'Plant Bestie'
}
