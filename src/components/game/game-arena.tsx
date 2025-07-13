'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GameState, GameTarget, User } from '@/lib/types'
import { generateRandomPosition, generateUniqueId } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface GameArenaProps {
  user: User
  onTargetHit: (targetId: string) => void
  onGameEnd: (score: number) => void
  onGameStateChange?: (gameState: GameState) => void
}

const GAME_DURATION = 10000 // 10 seconds in milliseconds
const TARGET_SPAWN_INTERVAL = 2000 // 2 seconds
const TARGET_LIFETIME = 3000 // 3 seconds before target disappears

export function GameArena({ user, onTargetHit, onGameEnd, onGameStateChange }: GameArenaProps) {
  const [gameState, setGameState] = useState<GameState>({
    timeLeft: GAME_DURATION / 1000,
    score: 0,
    targets: [],
    isPlaying: false,
    isGameOver: false,
  })

  const arenaRef = useRef<HTMLDivElement>(null)
  const gameTimerRef = useRef<NodeJS.Timeout>()
  const targetSpawnTimerRef = useRef<NodeJS.Timeout>()

  // Notify parent of game state changes
  useEffect(() => {
    onGameStateChange?.(gameState)
  }, [gameState, onGameStateChange])

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false,
      timeLeft: GAME_DURATION / 1000,
      score: 0,
      targets: [],
    }))

    // Start game timer
    const startTime = Date.now()
    gameTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      
      setGameState(prev => ({
        ...prev,
        timeLeft: Math.ceil(remaining / 1000),
      }))

      if (remaining <= 0) {
        endGame()
      }
    }, 100)

    // Start target spawning
    spawnTarget()
    targetSpawnTimerRef.current = setInterval(spawnTarget, TARGET_SPAWN_INTERVAL)
  }, [])

  const endGame = useCallback(() => {
    setGameState(prev => {
      const finalScore = prev.score
      onGameEnd(finalScore)
      return {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        targets: [],
      }
    })

    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
    }
    if (targetSpawnTimerRef.current) {
      clearInterval(targetSpawnTimerRef.current)
    }
  }, [onGameEnd])

  const spawnTarget = useCallback(() => {
    if (!arenaRef.current) return

    const arena = arenaRef.current
    const { x, y } = generateRandomPosition(
      arena.clientWidth,
      arena.clientHeight,
      60
    )

    const newTarget: GameTarget = {
      id: generateUniqueId(),
      x,
      y,
      active: true,
    }

    setGameState(prev => ({
      ...prev,
      targets: [...prev.targets, newTarget],
    }))

    // Remove target after lifetime
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        targets: prev.targets.filter(target => target.id !== newTarget.id),
      }))
    }, TARGET_LIFETIME)
  }, [])

  const handleTargetClick = useCallback((targetId: string) => {
    setGameState(prev => {
      const target = prev.targets.find(t => t.id === targetId)
      if (!target) return prev

      onTargetHit(targetId)
      
      return {
        ...prev,
        score: prev.score + 1,
        targets: prev.targets.filter(t => t.id !== targetId),
      }
    })
  }, [onTargetHit])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
      }
      if (targetSpawnTimerRef.current) {
        clearInterval(targetSpawnTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        ref={arenaRef}
        className="relative glass-card-dark rounded-2xl border-0 overflow-hidden backdrop-blur-xl w-full"
        style={{ height: '500px' }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
        </div>
        
        {gameState.targets.map((target) => (
          <div
            key={target.id}
            className="game-target"
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
            }}
            onClick={() => handleTargetClick(target.id)}
          />
        ))}

        {!gameState.isPlaying && !gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <Button 
                onClick={startGame} 
                size="lg"
                className="gradient-button text-white font-bold px-8 py-4 text-lg rounded-xl border-0"
              >
                🚀 Start Game
              </Button>
            </div>
          </div>
        )}

        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center glass-card p-8 rounded-2xl border-0">
              <h3 className="text-3xl font-bold mb-4 text-white glow-text">🎉 Game Over!</h3>
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-xl mb-6 text-gray-200">Final Score: <span className="text-green-400 font-bold">{gameState.score}</span></p>
              <Button 
                onClick={startGame} 
                size="lg"
                className="gradient-button text-white font-bold px-8 py-4 text-lg rounded-xl border-0"
              >
                🎯 Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 