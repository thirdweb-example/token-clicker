import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance } from '@/lib/thirdweb'
import { env } from '@/lib/env'
import { verifySessionAndCsrf } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    // Verify cookie session + CSRF for GET is typically not required. But we still require session.
    let authToken: string
    try {
      const session = verifySessionAndCsrf(request, { requireCsrfForMethods: new Set() })
      authToken = session.authToken
    } catch (err: any) {
      const code = err?.message
      const map: Record<string, number> = {
        NO_SESSION: 401,
      }
      return NextResponse.json({ error: code || 'Unauthorized' }, { status: map[code] || 401 })
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get token balance for the specified token
    const balance = await getTokenBalance(
      address,
      env.TOKEN_CONTRACT_ADDRESS,
      env.CHAIN_ID
    )

    return NextResponse.json({ balance })
  } catch (error) {
    console.error('Error getting balance:', error)
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    )
  }
} 