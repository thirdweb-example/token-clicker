import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Send login code using thirdweb API
    const response = await fetch(`${env.THIRDWEB_API_BASE_URL}/v1/wallets/user/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': env.THIRDWEB_SECRET_KEY,
      },
      body: JSON.stringify({
        email,
        type: 'email',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Thirdweb send OTP error:', error)
      return NextResponse.json(
        { error: 'Failed to send login code' },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({ 
      success: true,
      message: 'Login code sent to your email' 
    })
  } catch (error) {
    console.error('Error sending login code:', error)
    return NextResponse.json(
      { error: 'Failed to send login code' },
      { status: 500 }
    )
  }
} 