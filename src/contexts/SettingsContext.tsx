import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SettingsContextType {
  // Appearance
  compactMode: boolean
  setCompactMode: (compact: boolean) => void

  // Notifications (UI only - mock for now)
  wateringReminders: boolean
  setWateringReminders: (enabled: boolean) => void
  checkInReminders: boolean
  setCheckInReminders: (enabled: boolean) => void
  reminderTime: string
  setReminderTime: (time: string) => void

  // Reset
  resetSettings: () => void
}

interface StoredSettings {
  compactMode: boolean
  wateringReminders: boolean
  checkInReminders: boolean
  reminderTime: string
}

const defaultSettings: StoredSettings = {
  compactMode: false,
  wateringReminders: true,
  checkInReminders: true,
  reminderTime: '09:00',
}

const STORAGE_KEY = 'plantsis-settings'

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [compactMode, setCompactModeState] = useState(defaultSettings.compactMode)
  const [wateringReminders, setWateringRemindersState] = useState(defaultSettings.wateringReminders)
  const [checkInReminders, setCheckInRemindersState] = useState(defaultSettings.checkInReminders)
  const [reminderTime, setReminderTimeState] = useState(defaultSettings.reminderTime)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const settings: StoredSettings = JSON.parse(stored)
        setCompactModeState(settings.compactMode ?? defaultSettings.compactMode)
        setWateringRemindersState(settings.wateringReminders ?? defaultSettings.wateringReminders)
        setCheckInRemindersState(settings.checkInReminders ?? defaultSettings.checkInReminders)
        setReminderTimeState(settings.reminderTime ?? defaultSettings.reminderTime)
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
    }
  }, [])

  // Persist to localStorage whenever settings change
  useEffect(() => {
    try {
      const settings: StoredSettings = {
        compactMode,
        wateringReminders,
        checkInReminders,
        reminderTime,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }, [compactMode, wateringReminders, checkInReminders, reminderTime])

  // Apply compact mode to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-compact', compactMode.toString())
  }, [compactMode])

  const setCompactMode = (compact: boolean) => {
    setCompactModeState(compact)
  }

  const setWateringReminders = (enabled: boolean) => {
    setWateringRemindersState(enabled)
  }

  const setCheckInReminders = (enabled: boolean) => {
    setCheckInRemindersState(enabled)
  }

  const setReminderTime = (time: string) => {
    setReminderTimeState(time)
  }

  const resetSettings = () => {
    setCompactModeState(defaultSettings.compactMode)
    setWateringRemindersState(defaultSettings.wateringReminders)
    setCheckInRemindersState(defaultSettings.checkInReminders)
    setReminderTimeState(defaultSettings.reminderTime)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to remove settings from localStorage:', error)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        compactMode,
        setCompactMode,
        wateringReminders,
        setWateringReminders,
        checkInReminders,
        setCheckInReminders,
        reminderTime,
        setReminderTime,
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
