'use client'

import React from 'react'
import { GameState, SessionStats } from '@/lib/types'
import { TOKEN_SYMBOL } from '@/lib/constants'

interface GameInfoProps {
  gameState: GameState
  sessionStats: SessionStats
}

export function GameInfo({ gameState, sessionStats }: GameInfoProps) {
  const totalShots = sessionStats.hits + sessionStats.misses
  const accuracy = totalShots > 0 ? Math.round((sessionStats.hits / totalShots) * 100) : 0
  
  return (
    <div className="text-center glass-card p-6 rounded-2xl border-0 mb-6">

      <div className="grid grid-cols-3 gap-3 text-white">
        <div className="text-center">
          <div className="text-lg font-bold text-green-500">✅ {sessionStats.hits}</div>
          <div className="text-xs text-gray-300">Session Hits</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">❌ {sessionStats.misses}</div>
          <div className="text-xs text-gray-300">Session Misses</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${accuracy >= 70 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            🎯 {accuracy}%
          </div>
          <div className="text-xs text-gray-300">Session Accuracy</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="text-center">
          <div className={`text-xl font-bold ${sessionStats.totalGains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            💰 {sessionStats.totalGains > 0 ? '+' : ''}{sessionStats.totalGains.toFixed(2)} {TOKEN_SYMBOL}
          </div>
          <div className="text-xs text-gray-300">Session Total</div>
        </div>
      </div>
    </div>
  )
} 