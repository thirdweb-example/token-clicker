'use client'

import React, { useState } from 'react'
import { User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TOKEN_SYMBOL } from '@/lib/constants'

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send code')
      }

      setStep('code')
    } catch (error) {
      console.error('Failed to send code:', error)
      setError(error instanceof Error ? error.message : 'Failed to send code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: code.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to verify code')
      }

      const csrfToken = response.headers.get('X-CSRF-Token') || ''
      const result = await response.json()
      onLogin({ ...result.user, csrfToken })
    } catch (error) {
      console.error('Failed to verify code:', error)
      setError(error instanceof Error ? error.message : 'Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setCode('')
    setError('')
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
            Vibe Shooter
          </CardTitle>
          <p className="text-gray-300 mt-2">
            Hit targets, earn {TOKEN_SYMBOL.toLowerCase()}, have fun! 🚀
          </p>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  📧 Enter your email address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="glass-card-dark border-0 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full gradient-button text-white font-bold py-3 rounded-xl border-0"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    📤 Sending code...
                  </div>
                ) : (
                  '📤 Send Login Code'
                )}
              </Button>
              
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-400/20 p-3 rounded-lg border border-red-400/30">
                  ❌ {error}
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  🔑 Enter the 6-digit code sent to {email}
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
                  className="glass-card-dark border-0 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/50 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full gradient-button text-white font-bold py-3 rounded-xl border-0"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    🔄 Verifying...
                  </div>
                ) : (
                  '🎯 Start Playing!'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                className="w-full gradient-button text-white font-bold py-3 rounded-xl border-0"
                disabled={isLoading}
              >
                ← Back to email
              </Button>
              
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-400/20 p-3 rounded-lg border border-red-400/30">
                  ❌ {error}
                </div>
              )}
            </form>
          )}
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>🔐 Your wallet will be created automatically</p>
            <p>💎 Hit targets to earn 0.01 {TOKEN_SYMBOL.toLowerCase()} each</p>
            <p>⏱️ Each game lasts 10 seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 