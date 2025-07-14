'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GameState, GameTarget, User } from '@/lib/types'
import { generateRandomPosition, generateUniqueId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSound } from '@/lib/contexts/sound-context'

interface GameArenaProps {
  user: User
  onTargetHit: (targetId: string) => void
  onGameEnd: (score: number) => void
  onGameStateChange?: (gameState: GameState) => void
}

const GAME_DURATION = 10000 // 10 seconds in milliseconds
const TARGET_SPAWN_INTERVAL = 1000 // 2 seconds
const TARGET_LIFETIME = 2000 // 3 seconds before target disappears

interface LaserBeam {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  targetId: string
}

export function GameArena({ user, onTargetHit, onGameEnd, onGameStateChange }: GameArenaProps) {
  const { playTargetHitSound } = useSound()
  
  const [gameState, setGameState] = useState<GameState>({
    timeLeft: GAME_DURATION / 1000,
    score: 0,
    targets: [],
    isPlaying: false,
    isGameOver: false,
  })

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [gunPos, setGunPos] = useState({ x: 0, y: 0 })
  const [gunRotation, setGunRotation] = useState(0)
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([])
  const [isFiring, setIsFiring] = useState(false)

  const arenaRef = useRef<HTMLDivElement>(null)
  const gameTimerRef = useRef<NodeJS.Timeout>()
  const targetSpawnTimerRef = useRef<NodeJS.Timeout>()

  // Notify parent of game state changes – but skip the very first render to
  // avoid triggering a parent state update while the component tree is still
  // mounting (which React warns about).
  const didMountRef = useRef(false)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    onGameStateChange?.(gameState)
  }, [gameState, onGameStateChange])

  // Initialize gun position and handle mouse tracking
  useEffect(() => {
    if (!arenaRef.current) return

    const arena = arenaRef.current
    const rect = arena.getBoundingClientRect()
    
    // Set fixed gun position at bottom center using same coordinate system
    const fixedGunPos = {
      x: arena.offsetWidth / 2,
      y: arena.offsetHeight - 60, // 60px from bottom
    }
    setGunPos(fixedGunPos)

    const handleMouseMove = (e: MouseEvent) => {
      // Use consistent coordinate system with click handler
      const rect = arena.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMousePos({ x, y })
      
      // Calculate gun position using same method as click handler
      const currentGunX = arena.offsetWidth / 2
      const currentGunY = arena.offsetHeight - 60
      
      // Calculate rotation angle from gun to mouse
      const deltaX = x - currentGunX
      const deltaY = y - currentGunY
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
      
      // Adjust angle so gun points upward by default (subtract 90 degrees)
      setGunRotation(angle - 90)
    }

    arena.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      arena.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

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

  const handleArenaClick = useCallback((e: React.MouseEvent) => {
    if (!arenaRef.current || !gameState.isPlaying) return

    // Calculate click position relative to the arena element so it works no matter which
    // child element (including a target) was clicked.
    const rect = arenaRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Calculate gun position relative to arena element dimensions
    const arena = arenaRef.current
    const currentGunX = arena.offsetWidth / 2
    const currentGunY = arena.offsetHeight - 60

    // Always shoot laser to click position
    const beamId = generateUniqueId()
    
    const newBeam: LaserBeam = {
      id: beamId,
      startX: currentGunX, // Gun center X relative to arena
      startY: currentGunY, // Gun center Y relative to arena
      endX: clickX,
      endY: clickY,
      targetId: '', // No target ID for general clicks
    }

    // Clear any existing laser beams and add the new one
    setLaserBeams([newBeam])

    // Set firing state for gun animation
    setIsFiring(true)
    setTimeout(() => setIsFiring(false), 150)

    // Remove laser beam after brief display
    setTimeout(() => {
      setLaserBeams([])
    }, 200)

    // Play target hit sound
    playTargetHitSound()

    // Check if click hit any target
    const hitTarget = gameState.targets.find(target => {
      const targetCenterX = target.x + 30
      const targetCenterY = target.y + 30
      const distance = Math.sqrt(
        Math.pow(clickX - targetCenterX, 2) + Math.pow(clickY - targetCenterY, 2)
      )
      return distance <= 30 // Target radius
    })

    if (hitTarget) {
      // Only process target hit if we actually hit a target
      setGameState(prev => {
        onTargetHit(hitTarget.id)
        
        return {
          ...prev,
          score: prev.score + 1,
          targets: prev.targets.filter(t => t.id !== hitTarget.id),
        }
      })
    }
  }, [gunPos.x, gunPos.y, playTargetHitSound, gameState.targets, gameState.isPlaying, onTargetHit])

  // No separate target click handler is required – clicks on a target should
  // bubble up to the arena so the existing logic handles them.

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
        style={{ height: '500px', cursor: 'crosshair' }}
        onClick={handleArenaClick}
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
          />
        ))}

                {/* Laser Beams */}
        {laserBeams.map((beam) => (
          <svg
            key={beam.id}
            className="laser-beam"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <line
              x1={beam.startX}
              y1={beam.startY}
              x2={beam.endX}
              y2={beam.endY}
              stroke="#ff0080"
              strokeWidth="3"
              style={{
                filter: 'drop-shadow(0 0 10px #ff0080) drop-shadow(0 0 20px #ff0080)',
              }}
            />
          </svg>
        ))}

        {/* Laser Gun */}
        <div
          className="laser-gun"
          style={{
            position: 'absolute',
            left: `${gunPos.x - 20}px`,
            top: `${gunPos.y - 20}px`,
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #4a90e2, #7b68ee)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            border: '2px solid #ffffff',
            boxShadow: `0 0 15px rgba(123, 104, 238, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.2)${isFiring ? ', 0 0 25px #ffffff' : ''}`,
            zIndex: 20,
            transition: 'all 0.1s ease-out',
            transform: `rotate(${gunRotation}deg) ${isFiring ? 'scale(1.1)' : 'scale(1)'}`,
            transformOrigin: 'center center',
          }}
        >
          {/* Gun barrel */}
          <div
            style={{
              position: 'absolute',
              top: '15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '4px',
              height: '10px',
              background: '#ffffff',
              borderRadius: '2px',
              boxShadow: `0 0 5px #ffffff${isFiring ? ', 0 0 15px #ffffff' : ''}`,
            }}
          />
          {/* Gun core */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              background: 'radial-gradient(circle, #ffffff, #7b68ee)',
              borderRadius: '50%',
              animation: 'gun-glow 2s ease-in-out infinite',
            }}
          />
          {/* Muzzle flash */}
          {isFiring && (
            <div
              style={{
                position: 'absolute',
                top: '5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                background: 'radial-gradient(circle, #ffffff, #ffff00)',
                borderRadius: '50%',
                boxShadow: '0 0 15px #ffffff, 0 0 25px #ffff00',
                animation: 'muzzle-flash 0.15s ease-out',
              }}
            />
          )}
        </div>

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