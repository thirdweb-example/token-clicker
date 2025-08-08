import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance } from '@/lib/thirdweb'
import { env } from '@/lib/env'
import { verifySessionAndCsrf } from '@/lib/auth'
import { REWARD_CONTRACT_ADDRESS, CHAIN_ID } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    // Require a valid session (no CSRF needed for GET)
    try {
      verifySessionAndCsrf(request, { requireCsrfForMethods: new Set() })
    } catch (err: any) {
      const code = err?.message
      const map: Record<string, number> = {
        NO_SESSION: 401,
      }
      return NextResponse.json({ error: code || 'Unauthorized' }, { status: map[code] || 401 })
    }

    const treasuryAddress = env.TREASURY_WALLET_ADDRESS
    if (!treasuryAddress) {
      return NextResponse.json(
        { error: 'Treasury wallet address not configured' },
        { status: 500 }
      )
    }

    const balance = await getTokenBalance(
      treasuryAddress,
      REWARD_CONTRACT_ADDRESS,
      CHAIN_ID
    )

    return NextResponse.json({ balance })
  } catch (error) {
    console.error('Error getting treasury balance:', error)
    return NextResponse.json(
      { error: 'Failed to get treasury balance' },
      { status: 500 }
    )
  }
}


