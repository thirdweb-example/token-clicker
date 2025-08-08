import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { User } from '@/lib/types'
import { setSessionCookies, generateCsrfToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Verify login code using thirdweb API
    const response = await fetch(`${env.THIRDWEB_API_BASE_URL}/v1/wallets/user/code/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': env.THIRDWEB_SECRET_KEY,
      },
      body: JSON.stringify({
        code,
        email,
        type: 'email',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Thirdweb verify code error:', error)
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    const data = await response.json()

    // Generate CSRF up front so we can include it in body
    const csrfToken = generateCsrfToken()

    const user: User = {
      id: email,
      email,
      walletAddress: data.walletAddress,
      createdAt: new Date().toISOString(),
      csrfToken,
    }

    const res = NextResponse.json({ user })
    setSessionCookies(res, {
      authToken: data.token,
      sessionMaxAgeSeconds: 60 * 60 * 24 * 7,
      csrfMaxAgeSeconds: 60 * 60 * 24 * 7,
      csrfToken,
    })
    return res
  } catch (error) {
    console.error('Error verifying login code:', error)
    return NextResponse.json(
      { error: 'Failed to verify login code' },
      { status: 500 }
    )
  }
} 