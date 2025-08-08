import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance, transferTokens, getUserDetails } from '@/lib/thirdweb'
import { env } from '@/lib/env'
import { verifySessionAndCsrf } from '@/lib/auth'
import { toBaseUnits } from '@/lib/utils'
import { TOKEN_CONTRACT_ADDRESS, TOKEN_DECIMALS, CHAIN_ID } from '@/lib/constants'

// Human-readable penalty amount in token units
const PENALTY_TOKENS = '0.05'

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

    // First, check the user's current token balance
    // Get token balance for the specified token
    const balance = await getTokenBalance(
        playerAddress,
        TOKEN_CONTRACT_ADDRESS,
        CHAIN_ID
      )

    const currentBalance = BigInt(balance.data)
    const penaltyAmountBigInt = BigInt(toBaseUnits(PENALTY_TOKENS, TOKEN_DECIMALS))

    // Calculate actual transfer amount - use full penalty or available balance, whichever is smaller
    const transferAmount = currentBalance < penaltyAmountBigInt ? currentBalance : penaltyAmountBigInt

    // If user has no balance, nothing to transfer
    if (transferAmount === BigInt(0)) {
      return NextResponse.json({
        transactionIds: [],
        amount: toBaseUnits(PENALTY_TOKENS, TOKEN_DECIMALS),
        actualAmount: '0'
      })
    }

    // Transfer tokens from player to treasury using player's auth token
    const result = await transferTokens(
      playerAddress,
      env.TREASURY_WALLET_ADDRESS,
      transferAmount.toString(),
      TOKEN_CONTRACT_ADDRESS,
      CHAIN_ID,
      authToken
    )

    return NextResponse.json({ 
      transactionIds: result.transactionIds,
      amount: toBaseUnits(PENALTY_TOKENS, TOKEN_DECIMALS),
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