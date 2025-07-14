'use client'

import React from 'react'
import { GameState } from '@/lib/types'

interface GameInfoProps {
  gameState: GameState
}

export function GameInfo({ gameState }: GameInfoProps) {
  return (
    <div className="text-center glass-card p-6 rounded-2xl border-0 mb-6">
      <h2 className="text-3xl font-bold text-white glow-text mb-4">🎯 Shoot the Targets!</h2>
      <div className="flex justify-center space-x-8 text-white">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400 glow-text">⏱️ {gameState.timeLeft}s</div>
          <div className="text-sm text-gray-300">Time Left</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400 glow-text">🎯 {gameState.score}</div>
          <div className="text-sm text-gray-300">Score</div>
        </div>
      </div>
    </div>
  )
} 