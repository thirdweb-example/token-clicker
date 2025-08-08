import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithSession } from '@/lib/client-auth'
import { User, Transaction } from '@/lib/types'

// Query Keys
export const QUERY_KEYS = {
  user: (username: string) => ['user', username],
  balance: (address: string) => ['balance', address],
  treasuryBalance: ['treasuryBalance'] as const,
  transactions: (page?: number, limit?: number) => ['transactions', page, limit],
  transaction: (id: string) => ['transaction', id],
} as const



// Balance Queries
export function useBalance(address: string | null, _authToken: string | null, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.balance(address || ''),
    queryFn: async () => {
      if (!address) throw new Error('No address provided')
      
      const response = await fetchWithSession(`/api/balance?address=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch balance')
      }
      
      const data = await response.json()
      return data.balance
    },
    enabled: enabled && !!address,
    staleTime: 4 * 1000, // 4 seconds
    refetchInterval: 5 * 1000, // 5 seconds
  })
}

// Treasury balance (reward pool)
export function useTreasuryBalance(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.treasuryBalance,
    queryFn: async () => {
      const response = await fetchWithSession('/api/treasury-balance')
      if (!response.ok) {
        throw new Error('Failed to fetch treasury balance')
      }
      const data = await response.json()
      return data.balance
    },
    enabled,
    staleTime: 5 * 1000,
    refetchInterval: 7 * 1000,
  })
}

// Reward Mutations
export function useSendReward() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ csrfToken, gameSessionData }: { 
      csrfToken: string;
      gameSessionData?: {
        gameStartTime: number;
        targetHitTime: number;
      }
    }) => {
      const response = await fetchWithSession('/api/reward', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ gameSessionData }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send reward')
      }

      return response.json()
    },
    onSuccess: () => {
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
    mutationFn: async ({ csrfToken }: { csrfToken: string }) => {
      const response = await fetchWithSession('/api/penalty', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to apply penalty')
      }

      return response.json()
    },
    onSuccess: () => {
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