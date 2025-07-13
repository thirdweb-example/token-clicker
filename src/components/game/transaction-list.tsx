'use client'

import React, { useState, useEffect } from 'react'
import { Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatWalletAddress } from '@/lib/utils'

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionUpdate?: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onTransactionUpdate }: TransactionListProps) {
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions)

  useEffect(() => {
    setLocalTransactions(transactions)
  }, [transactions])

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'confirmed':
        return 'text-green-400 bg-green-400/20 border-green-400/30'
      case 'failed':
        return 'text-red-400 bg-red-400/20 border-red-400/30'
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return '⏳ Pending'
      case 'confirmed':
        return '✅ Confirmed'
      case 'failed':
        return '❌ Failed'
      default:
        return '❓ Unknown'
    }
  }

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <Card className="w-full max-w-md glass-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white glow-text flex items-center gap-2">
          💰 Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {localTransactions.length === 0 ? (
            <div className="text-center text-gray-300 py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p>No transactions yet.</p>
              <p className="text-sm text-gray-400 mt-2">Hit some targets to earn tokens!</p>
            </div>
          ) : (
            localTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 rounded-xl border-0 hover:bg-white/10 transition-all duration-300 group"
                style={{
                  background: 'rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💎</span>
                    <span className="font-bold text-green-400 glow-text">
                      +0.01 tokens
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </div>
                </div>
                
                {/* Always render transaction hash area to prevent layout jump */}
                <div className="mb-2 h-4">
                  {transaction.transactionHash ? (
                    <span className="text-xs text-gray-400">
                      🔗 Tx: {formatWalletAddress(transaction.transactionHash)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      🔗 Tx: Generating...
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    🕒 {new Date(transaction.createdAt).toLocaleTimeString()}
                  </span>
                  {transaction.status === 'pending' && (
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 