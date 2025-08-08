import { NextRequest, NextResponse } from 'next/server'
import { transferTokens, getUserDetails } from '@/lib/thirdweb'
import { env } from '@/lib/env'
import { verifySessionAndCsrf } from '@/lib/auth'
import { toBaseUnits } from '@/lib/utils'
import { REWARD_CONTRACT_ADDRESS, REWARD_DECIMALS, CHAIN_ID } from '@/lib/constants'

// Human-readable reward amount in token units
const REWARD_TOKENS = '0.01'

export async function POST(request: NextRequest) {
  try {
    // Verify cookie session + CSRF
    let authToken: string
    try {
      const session = verifySessionAndCsrf(request)
      authToken = session.authToken
    } catch (err: any) {
      const code = err?.message
      const map: Record<string, number> = {
        NO_SESSION: 401,
        INVALID_CSRF: 403,
        BAD_ORIGIN: 403,
      }
      return NextResponse.json({ error: code || 'Unauthorized' }, { status: map[code] || 401 })
    }

    // Get user details from auth token
    let userDetails
    try {
      userDetails = await getUserDetails(authToken)
    } catch (error) {
      console.error('Error fetching user details:', error)
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const playerAddress = userDetails.address
    if (!playerAddress) {
      return NextResponse.json(
        { error: 'No wallet address found for user' },
        { status: 400 }
      )
    }

    const { gameSessionData } = await request.json()

    // Optional: Validate game session data if provided
    if (gameSessionData) {
      const { gameStartTime, targetHitTime } = gameSessionData
      
      // Validate that the hit happened during an active game
      if (!gameStartTime || !targetHitTime) {
        return NextResponse.json(
          { error: 'Invalid game session data' },
          { status: 400 }
        )
      }
      
      // Check if hit time is within reasonable game duration (max 10 seconds per game)
      const timeSinceGameStart = targetHitTime - gameStartTime
      if (timeSinceGameStart < 0 || timeSinceGameStart > 10000) {
        return NextResponse.json(
          { error: 'Invalid game timing' },
          { status: 400 }
        )
      }
    }

    // Transfer tokens from treasury to player using treasury auth (no player auth needed for receiving)
    const result = await transferTokens(
      env.TREASURY_WALLET_ADDRESS,
      playerAddress,
      toBaseUnits(REWARD_TOKENS, REWARD_DECIMALS),
      REWARD_CONTRACT_ADDRESS,
      CHAIN_ID
    )

    return NextResponse.json({ 
      transactionIds: result.transactionIds,
      amount: toBaseUnits(REWARD_TOKENS, REWARD_DECIMALS)
    })
  } catch (error) {
    console.error('Error sending reward:', error)
    return NextResponse.json(
      { error: 'Failed to send reward' },
      { status: 500 }
    )
  }
} 