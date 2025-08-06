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
  } = useBalance(user.walletAddress, user.authToken)

  const { isEnabled: soundEnabled, toggleSound, playTokenGainSound, playTokenLossSound, playClickSound } = useSound()

  const [isAnimating, setIsAnimating] = useState(false)
  const [showIncrement, setShowIncrement] = useState(false)
  const [incrementAmount, setIncrementAmount] = useState('')
  const [isPositiveChange, setIsPositiveChange] = useState(true)
  const previousBalanceRef = useRef<string | null>(null)

  // Track balance changes and trigger animation
  useEffect(() => {
    if (balance?.data && previousBalanceRef.current && !isBalanceLoading) {
      const currentBalance = parseFloat(balance.data)
      const previousBalance = parseFloat(previousBalanceRef.current)
      
      if (currentBalance !== previousBalance) {
        const difference = currentBalance - previousBalance
        const isIncrease = difference > 0
        
        setIncrementAmount(
          isIncrease 
            ? `+${formatTokenAmount(Math.abs(difference).toString())}`
            : `-${formatTokenAmount(Math.abs(difference).toString())}`
        )
        setIsPositiveChange(isIncrease)
        setIsAnimating(true)
        setShowIncrement(true)
        
        // Play appropriate sound based on gain or loss
        if (isIncrease) {
          playTokenGainSound()
        } else {
          playTokenLossSound()
        }
        
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
  }, [balance?.data, isBalanceLoading, playTokenGainSound, playTokenLossSound])

  return (
    <Card className="w-full glass-card border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white glow-text">
              Welcome, {user.email ? user.email.split('@')[0] : 'Guest'}!
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              <div className="text-sm text-gray-200">
                🔗 {formatWalletAddress(user.walletAddress)}
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
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-right relative">
            <div className={`text-3xl font-bold glow-text mb-2 transition-all duration-300 ${
              isAnimating 
                ? isPositiveChange 
                  ? 'text-green-300 scale-110 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]' 
                  : 'text-red-300 scale-110 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
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
              <div className={`absolute -top-6 -right-2 ${isPositiveChange ? 'animate-bounce' : 'animate-pulse'}`}>
                <div className={`px-2 py-1 rounded-full text-sm font-bold border animate-pulse ${
                  isPositiveChange 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
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