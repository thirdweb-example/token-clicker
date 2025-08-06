import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance, transferTokens } from '@/lib/thirdweb'
import { env } from '@/lib/env'

const PENALTY_AMOUNT = '50000000000000000' // 0.05 tokens (assuming 18 decimals)

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      )
    }

    const { playerAddress } = await request.json()

    if (!playerAddress) {
      return NextResponse.json(
        { error: 'Player address is required' },
        { status: 400 }
      )
    }

    // First, check the user's current token balance
    // Get token balance for the specified token
    const balance = await getTokenBalance(
        playerAddress,
        env.TOKEN_CONTRACT_ADDRESS,
        env.CHAIN_ID
      )

    const currentBalance = BigInt(balance.data)
    const penaltyAmountBigInt = BigInt(PENALTY_AMOUNT)

    // Calculate actual transfer amount - use full penalty or available balance, whichever is smaller
    const transferAmount = currentBalance < penaltyAmountBigInt ? currentBalance : penaltyAmountBigInt

    // If user has no balance, nothing to transfer
    if (transferAmount === BigInt(0)) {
      return NextResponse.json({
        transactionIds: [],
        amount: PENALTY_AMOUNT,
        actualAmount: '0'
      })
    }

    // Transfer tokens from player to treasury using player's auth token
    const result = await transferTokens(
      playerAddress,
      env.TREASURY_WALLET_ADDRESS,
      transferAmount.toString(),
      env.TOKEN_CONTRACT_ADDRESS,
      env.CHAIN_ID,
      authToken
    )

    return NextResponse.json({ 
      transactionIds: result.transactionIds,
      amount: PENALTY_AMOUNT,
      actualAmount: transferAmount.toString()
    })
  } catch (error) {
    console.error('Error applying penalty:', error)
    return NextResponse.json(
      { error: 'Failed to apply penalty' },
      { status: 500 }
    )
  }
} 