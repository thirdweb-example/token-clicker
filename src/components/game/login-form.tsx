'use client'

import React, { useState } from 'react'
import { User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateUser } from '@/lib/hooks/use-game-api'

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const createUserMutation = useCreateUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) return

    try {
      const result = await createUserMutation.mutateAsync(username.trim())
      onLogin(result.user)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="animated-bg">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
      </div>
      
      <Card className="w-full max-w-md glass-card border-0 relative z-10">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <CardTitle className="text-3xl font-bold text-white glow-text">
            Token Clicker Game
          </CardTitle>
          <p className="text-gray-300 mt-2">
            Hit targets, earn tokens, have fun! 🚀
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                🎮 Choose your username
              </label>
              <Input
                type="text"
                placeholder="Enter your username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={createUserMutation.isPending}
                className="glass-card-dark border-0 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full gradient-button text-white font-bold py-3 rounded-xl border-0"
              disabled={createUserMutation.isPending || !username.trim()}
            >
              {createUserMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  🔄 Creating your wallet...
                </div>
              ) : (
                '🎯 Start Playing!'
              )}
            </Button>
            
            {createUserMutation.error && (
              <div className="text-red-400 text-sm text-center bg-red-400/20 p-3 rounded-lg border border-red-400/30">
                ❌ {createUserMutation.error.message}
              </div>
            )}
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>🔐 Your wallet will be created automatically</p>
            <p>💎 Hit targets to earn 0.01 tokens each</p>
            <p>⏱️ Each game lasts 10 seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 