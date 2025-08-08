'use client'

import React, { useState, useEffect, useRef } from 'react'
import { User } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { formatWalletAddress, formatTokenAmount } from '@/lib/utils'
import { useBalance } from '@/lib/hooks/use-game-api'
import { useSound } from '@/lib/contexts/sound-context'
import { TOKEN_SYMBOL } from '@/lib/constants'

interface GameHeaderProps {
  user: User
  onLogout?: () => void
}

export function GameHeader({ user, onLogout }: GameHeaderProps) {
  const { 
    data: balance, 
    isLoading: isBalanceLoading
  } = useBalance(user.walletAddress, null)

  const { isEnabled: soundEnabled, toggleSound, playTokenGainSound, playTokenLossSound, playClickSound } = useSound()

  const [isAnimating, setIsAnimating] = useState(false)
  const [showIncrement, setShowIncrement] = useState(false)
  const [incrementAmount, setIncrementAmount] = useState('')
  const [isPositiveChange, setIsPositiveChange] = useState(true)
  const previousBalanceRef = useRef<string | null>(null)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [copied, setCopied] = useState(false)

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
    <>
    <Card className="w-full glass-card border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white glow-text">
              Welcome, {user.email ? user.email.split('@')[0] : 'Guest'}!
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(user.walletAddress)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  } catch {
                    // ignore clipboard errors
                  }
                }}
                className="text-sm text-left text-gray-200 hover:text-white transition-colors underline-offset-2 hover:underline"
                title="Click to copy full address"
              >
                🔗 {formatWalletAddress(user.walletAddress)} {copied && <span className="text-green-400">(copied)</span>}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleSound()
                  }}
                  className={`px-3 py-2 text-sm transition-all duration-300 rounded-lg border shadow-sm ${
                    soundEnabled
                      ? 'text-green-400 hover:text-green-300 border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
                      : 'text-gray-300 hover:text-gray-200 border-gray-500/30 bg-white/5 hover:bg-gray-500/20'
                  }`}
                  title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-all duration-300 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 shadow-sm"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex-col gap-2 sm:gap-4 text-right relative">
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
                `💰 ${formatTokenAmount(balance?.data || '0')} ${TOKEN_SYMBOL}`
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

<button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="px-4 py-2 text-sm text-blue-300 hover:text-blue-200 transition-all duration-300 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 shadow-sm"
                >
                  Withdraw
                </button>
          </div>
          
        </div>
      </CardContent>
    </Card>
    {isWithdrawOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-md rounded-2xl glass-card p-6 border-0">
          <h3 className="text-xl font-bold text-white glow-text mb-4">Withdraw {TOKEN_SYMBOL}</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-300 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-green-400">
                {formatTokenAmount(balance?.data || '0')} {TOKEN_SYMBOL}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Recipient Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            {withdrawError && (
              <div className="text-red-400 text-sm bg-red-400/20 p-2 rounded-lg border border-red-400/30">{withdrawError}</div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-gray-200 hover:bg-white/10"
                disabled={isWithdrawing}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setWithdrawError('')
                  setIsWithdrawing(true)
                  try {
                    const res = await fetch('/api/withdraw', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': user.csrfToken,
                      },
                      credentials: 'include',
                      body: JSON.stringify({ recipientAddress: recipient.trim() }),
                    })
                    const data = await res.json()
                    if (!res.ok) {
                      throw new Error(data?.error || 'Withdraw failed')
                    }
                    setIsWithdrawOpen(false)
                    setRecipient('')
                  } catch (err: any) {
                    setWithdrawError(err?.message || 'Withdraw failed')
                  } finally {
                    setIsWithdrawing(false)
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-60"
                disabled={isWithdrawing || !recipient.trim()}
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
} 