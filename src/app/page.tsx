'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { User, Transaction, GameState } from '@/lib/types'
import { LoginForm } from '@/components/game/login-form'
import { GameHeader } from '@/components/game/game-header'
import { GameArena } from '@/components/game/game-arena'
import { GameInfo } from '@/components/game/game-info'
import { TransactionList } from '@/components/game/transaction-list'
import { generateUniqueId } from '@/lib/utils'
import { useSendReward, useTransaction } from '@/lib/hooks/use-game-api'

const USER_STORAGE_KEY = 'token-clicker-user'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true)
  const [activeTransactionIds, setActiveTransactionIds] = useState<string[]>([])
  const [gameState, setGameState] = useState<GameState>({
    timeLeft: 10,
    score: 0,
    targets: [],
    isPlaying: false,
    isGameOver: false,
  })
  
  // React Query hooks
  const sendRewardMutation = useSendReward()
  
  // Use ref to prevent duplicate transactions
  const processingTargetsRef = useRef<Set<string>>(new Set())

  // Handle target hit - send reward and track transaction
  const handleTargetHit = useCallback(async (targetId: string) => {
    if (!user) return
    
    // Prevent duplicate processing of the same target
    if (processingTargetsRef.current.has(targetId)) {
      return
    }
    
    // Prevent new transactions while one is already being processed
    if (sendRewardMutation.isPending) {
      return
    }
    
    // Mark this target as being processed
    processingTargetsRef.current.add(targetId)

    // Create a pending transaction
    const pendingTransaction: Transaction = {
      id: generateUniqueId(),
      transactionHash: null,
      amount: '0.01',
      status: 'pending',
      createdAt: new Date().toISOString(),
      confirmedAt: null,
    }

    // Add to local transactions list
    setTransactions(prev => [pendingTransaction, ...prev])

    try {
      // Send reward using React Query mutation
      const result = await sendRewardMutation.mutateAsync(user.walletAddress)
      const transactionId = result.transactionIds[0]

      // Update transaction with transaction ID and start polling
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === pendingTransaction.id 
            ? { ...tx, transactionHash: transactionId }
            : tx
        )
      )

      // Add to active transaction IDs for polling
      setActiveTransactionIds(prev => [...prev, transactionId])

    } catch (error) {
      console.error('Error sending reward:', error)
      // Mark as failed
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === pendingTransaction.id 
            ? { ...tx, status: 'failed' }
            : tx
        )
      )
    } finally {
      // Remove from processing set after a short delay
      setTimeout(() => {
        processingTargetsRef.current.delete(targetId)
      }, 1000)
    }
  }, [user, sendRewardMutation])

  // Handle game state changes from GameArena
  const handleGameStateChange = useCallback((newGameState: GameState) => {
    setGameState(newGameState)
  }, [])

  // Save user to localStorage
  const saveUserToStorage = useCallback((userData: User) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to save user to localStorage:', error)
    }
  }, [])

  // Load user from localStorage
  const loadUserFromStorage = useCallback(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (savedUser) {
        const userData = JSON.parse(savedUser) as User
        setUser(userData)
        return true
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem(USER_STORAGE_KEY)
    }
    return false
  }, [])

  // Clear user from localStorage (logout)
  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
      setUser(null)
      setTransactions([])
      setActiveTransactionIds([])
      processingTargetsRef.current.clear()
    } catch (error) {
      console.error('Failed to clear user from localStorage:', error)
    }
  }, [])

  // Handle user login
  const handleLogin = useCallback(async (newUser: User) => {
    setUser(newUser)
    saveUserToStorage(newUser)
  }, [saveUserToStorage])

  // Handle game end
  const handleGameEnd = useCallback((score: number) => {
    console.log(`Game ended with score: ${score}`)
    // Could show a game over modal or stats here
  }, [])

  // Check for saved user on component mount
  useEffect(() => {
    const hasLoadedUser = loadUserFromStorage()
    setIsLoadingFromStorage(false)
    
    // If no saved user found, the login form will be shown
    if (!hasLoadedUser) {
      setIsLoadingFromStorage(false)
    }
  }, [loadUserFromStorage])

  // Show loading spinner while checking localStorage
  if (isLoadingFromStorage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your game...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="animated-bg">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <GameHeader 
          user={user} 
          onLogout={handleLogout}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GameArena 
              user={user}
              onTargetHit={handleTargetHit}
              onGameEnd={handleGameEnd}
              onGameStateChange={handleGameStateChange}
            />
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <GameInfo gameState={gameState} />
            <TransactionPollingManager
              transactions={transactions}
              activeTransactionIds={activeTransactionIds}
              onTransactionUpdate={(transactionId, status) => {
                // Update local transaction status
                setTransactions(prev => 
                  prev.map(tx => 
                    tx.transactionHash === transactionId 
                      ? { ...tx, status, confirmedAt: status === 'confirmed' ? new Date().toISOString() : null }
                      : tx
                  )
                )
                
                // Remove from active polling if confirmed or failed
                if (status === 'confirmed' || status === 'failed') {
                  setActiveTransactionIds(prev => prev.filter(id => id !== transactionId))
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Component to handle transaction polling
function TransactionPollingManager({
  transactions,
  activeTransactionIds,
  onTransactionUpdate,
}: {
  transactions: Transaction[]
  activeTransactionIds: string[]
  onTransactionUpdate: (transactionId: string, status: 'pending' | 'confirmed' | 'failed') => void
}) {
  return (
    <>
      {activeTransactionIds.map(transactionId => (
        <TransactionPoller
          key={transactionId}
          transactionId={transactionId}
          onStatusUpdate={onTransactionUpdate}
        />
      ))}
      <TransactionList transactions={transactions} />
    </>
  )
}

// Individual transaction poller component
function TransactionPoller({
  transactionId,
  onStatusUpdate,
}: {
  transactionId: string
  onStatusUpdate: (transactionId: string, status: 'pending' | 'confirmed' | 'failed') => void
}) {
  const { data: transactionData, isError } = useTransaction(transactionId, true)

  useEffect(() => {
    if (transactionData?.result) {
      const serverTransaction = transactionData.result
      
      // Determine status based on server response
      let status: 'pending' | 'confirmed' | 'failed' = 'pending'
      
      if (serverTransaction.confirmedAt) {
        status = 'confirmed'
      } else if (serverTransaction.errorMessage || serverTransaction.cancelledAt) {
        status = 'failed'
      }
      
      onStatusUpdate(transactionId, status)
    }
  }, [transactionData, transactionId, onStatusUpdate])

  useEffect(() => {
    if (isError) {
      onStatusUpdate(transactionId, 'failed')
    }
  }, [isError, transactionId, onStatusUpdate])

  return null // This component doesn't render anything
} 