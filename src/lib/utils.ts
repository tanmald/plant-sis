import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IdentityPreference } from '@/types/database.types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets personalized title based on user's identity preference
 * @param identityPreference - User's identity preference ('female', 'male', 'prefer-not-to-say')
 * @returns Personalized title string ('Plant Sis', 'Plant Buddy', or 'plant parent')
 */
export function getPlantTitle(identityPreference?: IdentityPreference | null): string {
  switch (identityPreference) {
    case 'female':
      return 'Plant Sis'
    case 'male':
      return 'Plant Buddy'
    case 'prefer-not-to-say':
    default:
      return 'plant parent'
  }
}

/**
 * Identity preference options for UI display
 */
export const IDENTITY_OPTIONS = [
  {
    value: 'female',
    label: 'Female 💁‍♀️',
    title: 'Plant Sis',
    description: 'I identify as female'
  },
  {
    value: 'male',
    label: 'Male 💁‍♂️',
    title: 'Plant Buddy',
    description: 'I identify as male'
  },
  {
    value: 'prefer-not-to-say',
    label: 'Prefer not to say',
    title: 'plant parent',
    description: 'Keep it neutral'
  },
] as const;
