'use client'

import React, { useState, useEffect, useRef } from 'react'
import { User } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { formatWalletAddress, formatTokenAmount } from '@/lib/utils'
import { useBalance } from '@/lib/hooks/use-game-api'
import { useSound } from '@/lib/contexts/sound-context'

interface GameHeaderProps {
  user: User
  onLogout?: () => void
}

export function GameHeader({ user, onLogout }: GameHeaderProps) {
  const { 
    data: balance, 
    isLoading: isBalanceLoading
  } = useBalance(user.walletAddress)

  const { isEnabled: soundEnabled, toggleSound, playBalanceUpdateSound, playClickSound } = useSound()

  const [isAnimating, setIsAnimating] = useState(false)
  const [showIncrement, setShowIncrement] = useState(false)
  const [incrementAmount, setIncrementAmount] = useState('')
  const previousBalanceRef = useRef<string | null>(null)

  // Track balance changes and trigger animation
  useEffect(() => {
    if (balance?.data && previousBalanceRef.current && !isBalanceLoading) {
      const currentBalance = parseFloat(balance.data)
      const previousBalance = parseFloat(previousBalanceRef.current)
      
      if (currentBalance > previousBalance) {
        const difference = currentBalance - previousBalance
        setIncrementAmount(`+${formatTokenAmount(difference.toString())}`)
        setIsAnimating(true)
        setShowIncrement(true)
        
        // Play balance update sound
        playBalanceUpdateSound()
        
        // Reset animation after duration
        setTimeout(() => {
          setIsAnimating(false)
        }, 600)
        
        // Hide increment after longer duration
        setTimeout(() => {
          setShowIncrement(false)
        }, 2000)
      }
    }
    
    // Update previous balance reference
    if (balance?.data) {
      previousBalanceRef.current = balance.data
    }
  }, [balance?.data, isBalanceLoading, playBalanceUpdateSound])

  return (
    <Card className="w-full glass-card border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white glow-text">
              Welcome, {user.username}! 🎯
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm text-gray-200">
                🔗 Wallet: {formatWalletAddress(user.walletAddress)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleSound()
                  }}
                  className={`px-3 py-2 text-sm transition-all duration-300 rounded-lg border ${
                    soundEnabled
                      ? 'text-green-400 hover:text-green-300 border-green-500/30 hover:bg-green-500/20'
                      : 'text-gray-400 hover:text-gray-300 border-gray-500/30 hover:bg-gray-500/20'
                  }`}
                  title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-all duration-300 rounded-lg hover:bg-red-500/20 border border-red-500/30"
                  >
                    Switch Account
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right relative">
            <div className={`text-3xl font-bold glow-text mb-2 transition-all duration-300 ${
              isAnimating 
                ? 'text-green-300 scale-110 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]' 
                : 'text-green-400'
            }`}>
              {isBalanceLoading ? (
                <div className="animate-pulse shimmer">Loading...</div>
              ) : (
                `💰 ${formatTokenAmount(balance?.data || '0')} tokens`
              )}
            </div>
            
            {/* Floating increment indicator */}
            {showIncrement && (
              <div className="absolute -top-6 -right-2 animate-bounce">
                <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-sm font-bold border border-green-500/30 animate-pulse">
                  {incrementAmount}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 