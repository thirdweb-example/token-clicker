'use client'

import React from 'react'
import { formatTokenAmount, cn } from '@/lib/utils'
import { TOKEN_SYMBOL } from '@/lib/constants'

interface PrizePoolInfoProps {
  balance?: { data?: string } | null
  isLoading?: boolean
  className?: string
}

export function PrizePoolInfo({ balance, isLoading, className }: PrizePoolInfoProps) {
  const isEmpty = !isLoading && ((balance?.data || '0') === '0')

  return (
    <div className={cn('mt-3 text-sm text-gray-200', className)}>
      {isLoading ? (
        <span className="opacity-80">Fetching prize pool...</span>
      ) : (
        <div className="flex flex-col items-center">
          <span>
            Prize pool remaining: <span className="font-semibold text-green-300">{formatTokenAmount(balance?.data || '0')}  {TOKEN_SYMBOL}</span>
          </span>
          {isEmpty && (
            <span className="mt-2 text-sm font-semibold text-red-300">Come back later!</span>
          )}
        </div>
      )}
    </div>
  )
}


