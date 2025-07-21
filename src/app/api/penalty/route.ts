import { NextRequest, NextResponse } from 'next/server'
import { transferTokens } from '@/lib/thirdweb'
import { env } from '@/lib/env'

const PENALTY_AMOUNT = '50000000000000000' // 0.05 tokens (assuming 18 decimals)

export async function POST(request: NextRequest) {
  try {
    const { playerAddress } = await request.json()

    if (!playerAddress) {
      return NextResponse.json(
        { error: 'Player address is required' },
        { status: 400 }
      )
    }

    // Transfer tokens from player to treasury (reverse of reward)
    const result = await transferTokens(
      playerAddress,
      env.TREASURY_WALLET_ADDRESS,
      PENALTY_AMOUNT,
      env.TOKEN_CONTRACT_ADDRESS,
      env.CHAIN_ID
    )

    return NextResponse.json({ 
      transactionIds: result.transactionIds,
      amount: PENALTY_AMOUNT 
    })
  } catch (error) {
    console.error('Error applying penalty:', error)
    return NextResponse.json(
      { error: 'Failed to apply penalty' },
      { status: 500 }
    )
  }
} 