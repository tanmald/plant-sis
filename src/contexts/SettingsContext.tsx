import { createContext, useContext, ReactNode } from 'react'

interface SettingsContextType {
  // Reset (kept for potential future use)
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const resetSettings = () => {
    try {
      // Clean up old storage keys
      localStorage.removeItem('plantsis-settings')
      localStorage.removeItem('plantbestie-settings')
    } catch (error) {
      console.error('Failed to remove settings from localStorage:', error)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
