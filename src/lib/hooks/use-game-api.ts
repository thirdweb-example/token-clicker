import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Transaction } from '@/lib/types'

// Query Keys
export const QUERY_KEYS = {
  user: (username: string) => ['user', username],
  balance: (address: string) => ['balance', address],
  transactions: (page?: number, limit?: number) => ['transactions', page, limit],
  transaction: (id: string) => ['transaction', id],
} as const



// Balance Queries
export function useBalance(address: string | null, authToken: string | null, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.balance(address || ''),
    queryFn: async () => {
      if (!address || !authToken) throw new Error('No address or auth token provided')
      
      const response = await fetch(`/api/balance?address=${address}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch balance')
      }
      
      const data = await response.json()
      return data.balance
    },
    enabled: enabled && !!address && !!authToken,
    staleTime: 4 * 1000, // 4 seconds
    refetchInterval: 5 * 1000, // 5 seconds
  })
}

// Reward Mutations
export function useSendReward() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ authToken, gameSessionData }: { 
      authToken: string;
      gameSessionData?: {
        gameStartTime: number;
        targetHitTime: number;
      }
    }) => {
      const response = await fetch('/api/reward', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ gameSessionData }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send reward')
      }

      return response.json()
    },
    onSuccess: (data: any, { authToken }: { authToken: string; gameSessionData?: any }) => {
      // Invalidate all balance queries since we don't have playerAddress anymore
      queryClient.invalidateQueries({
        queryKey: ['balance']
      })
      
      // Invalidate transactions to show new transaction
      queryClient.invalidateQueries({
        queryKey: ['transactions']
      })
    },
  })
}

// Penalty Mutations
export function useSendPenalty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ authToken }: { authToken: string }) => {
      const response = await fetch('/api/penalty', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to apply penalty')
      }

      return response.json()
    },
    onSuccess: (data: any, { authToken }: { authToken: string }) => {
      // Invalidate all balance queries since we don't have playerAddress anymore
      queryClient.invalidateQueries({
        queryKey: ['balance']
      })
      
      // Invalidate transactions to show new transaction
      queryClient.invalidateQueries({
        queryKey: ['transactions']
      })
    },
  })
}

// Transaction Queries
export function useTransaction(transactionId: string | null, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.transaction(transactionId || ''),
    queryFn: async () => {
      if (!transactionId) throw new Error('No transaction ID provided')
      
      const response = await fetch(`/api/transaction/${transactionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transaction')
      }
      
      const data = await response.json()
      return data
    },
    enabled: enabled && !!transactionId,
    refetchInterval: (data: any) => {
      // Stop polling if transaction is confirmed or failed
      if (data?.result?.confirmedAt || data?.result?.errorMessage || data?.result?.cancelledAt) {
        return false
      }
      // Poll every 3 seconds for pending transactions
      return 3000
    },
    staleTime: 0, // Always check for updates on pending transactions
    gcTime: 1000 * 60 * 5, // Keep data for 5 minutes
  })
}

export function useTransactions(page = 1, limit = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(page, limit),
    queryFn: async () => {
      const response = await fetch(`/api/transactions?page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      return data.transactions
    },
    staleTime: 2 * 1000, // 2 seconds
  })
}

// Custom hook for managing local transactions with server sync
export function useTransactionManager() {
  const queryClient = useQueryClient()
  
  const updateLocalTransaction = (id: string, updates: Partial<Transaction>) => {
    queryClient.setQueryData(
      ['localTransaction', id],
      (oldData: Transaction | undefined) => 
        oldData ? { ...oldData, ...updates } : undefined
    )
  }
  
  const addLocalTransaction = (transaction: Transaction) => {
    queryClient.setQueryData(['localTransaction', transaction.id], transaction)
  }
  
  const getLocalTransaction = (id: string) => {
    return queryClient.getQueryData(['localTransaction', id]) as Transaction | undefined
  }
  
  return {
    updateLocalTransaction,
    addLocalTransaction,
    getLocalTransaction,
  }
} 