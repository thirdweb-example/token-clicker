import { NextRequest, NextResponse } from 'next/server'
import { transferTokens } from '@/lib/thirdweb'
import { env } from '@/lib/env'

const REWARD_AMOUNT = '10000000000000000' // 0.01 tokens (assuming 18 decimals)

export async function POST(request: NextRequest) {
  try {
    const { playerAddress } = await request.json()

    if (!playerAddress) {
      return NextResponse.json(
        { error: 'Player address is required' },
        { status: 400 }
      )
    }

    // Transfer tokens from treasury to player
    const result = await transferTokens(
      env.TREASURY_WALLET_ADDRESS,
      playerAddress,
      REWARD_AMOUNT,
      env.TOKEN_CONTRACT_ADDRESS,
      env.CHAIN_ID
    )

    return NextResponse.json({ 
      transactionIds: result.transactionIds,
      amount: REWARD_AMOUNT 
    })
  } catch (error) {
    console.error('Error sending reward:', error)
    return NextResponse.json(
      { error: 'Failed to send reward' },
      { status: 500 }
    )
  }
} 