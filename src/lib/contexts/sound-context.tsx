'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { soundGenerator } from '../sound-generator'

interface SoundOptions {
  volume?: number
}

interface SoundState {
  isEnabled: boolean
  volume: number
}

interface SoundContextType {
  isEnabled: boolean
  volume: number
  playTargetHitSound: (options?: SoundOptions) => void
  playBalanceUpdateSound: (options?: SoundOptions) => void
  playClickSound: (options?: SoundOptions) => void
  toggleSound: () => void
  setVolume: (volume: number) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

interface SoundProviderProps {
  children: ReactNode
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [soundState, setSoundState] = useState<SoundState>({
    isEnabled: true,
    volume: 0.5,
  })

  // Load sound settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSound')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSoundState(parsed)
      } catch (error) {
        console.error('Error parsing sound settings:', error)
      }
    }
  }, [])

  // Save sound settings to localStorage
  useEffect(() => {
    localStorage.setItem('gameSound', JSON.stringify(soundState))
  }, [soundState])

  const playTargetHitSound = useCallback((options: SoundOptions = {}) => {
    if (!soundState.isEnabled) return
    
    const volume = options.volume ?? soundState.volume
    soundGenerator.generateTargetHitSound(volume)
  }, [soundState])

  const playBalanceUpdateSound = useCallback((options: SoundOptions = {}) => {
    if (!soundState.isEnabled) return
    
    const volume = options.volume ?? soundState.volume
    soundGenerator.generateBalanceUpdateSound(volume)
  }, [soundState])

  const playClickSound = useCallback((options: SoundOptions = {}) => {
    if (!soundState.isEnabled) return
    
    const volume = options.volume ?? soundState.volume
    soundGenerator.generateClickSound(volume)
  }, [soundState])

  const toggleSound = useCallback(() => {
    setSoundState(prev => ({ ...prev, isEnabled: !prev.isEnabled }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    setSoundState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }))
  }, [])

  const value: SoundContextType = {
    isEnabled: soundState.isEnabled,
    volume: soundState.volume,
    playTargetHitSound,
    playBalanceUpdateSound,
    playClickSound,
    toggleSound,
    setVolume,
  }

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound(): SoundContextType {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
} 