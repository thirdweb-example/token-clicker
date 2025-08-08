"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTokenAmount, formatWalletAddress } from '@/lib/utils'
import { REWARD_DECIMALS, TOKEN_SYMBOL } from '@/lib/constants'
import { useLeaderboard } from '@/lib/hooks/use-game-api'

export function LeaderboardCard() {
  const { data: owners, isLoading, error } = useLeaderboard()

  const medals = ['🥇', '🥈', '🥉']

  return (
    <Card className="w-full glass-card border-0">
      <CardHeader>
        <CardTitle className="text-white glow-text">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="text-gray-300">Loading top players...</div>
        ) : error ? (
          <div className="text-red-400">{String((error as any)?.message || error)}</div>
        ) : !owners || owners.length === 0 ? (
          <div className="text-gray-300">No players yet.</div>
        ) : (
          <ul className="space-y-3">
            {owners.map((owner, index: number) => (
              <li
                key={owner.address}
                className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {medals[index] || ''}
                  </span>
                  <span className="text-gray-200 font-mono">
                    {formatWalletAddress(owner.address)}
                  </span>
                </div>
                <div className="text-green-300 font-semibold">
                  {formatTokenAmount(owner.amount, REWARD_DECIMALS)} {TOKEN_SYMBOL}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}


