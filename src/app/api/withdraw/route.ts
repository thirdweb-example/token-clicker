import { NextRequest, NextResponse } from 'next/server'
import { getTokenBalance, transferTokens, getUserDetails } from '@/lib/thirdweb'
import { verifySessionAndCsrf } from '@/lib/auth'
import { TOKEN_CONTRACT_ADDRESS, CHAIN_ID } from '@/lib/constants'

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

    const fromAddress = userDetails.address
    if (!fromAddress) {
      return NextResponse.json(
        { error: 'No wallet address found for user' },
        { status: 400 }
      )
    }

    const { recipientAddress } = await request.json()

    if (!recipientAddress || typeof recipientAddress !== 'string') {
      return NextResponse.json(
        { error: 'Recipient address is required' },
        { status: 400 }
      )
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 }
      )
    }

    // Determine full balance to withdraw
    const balance = await getTokenBalance(
      fromAddress,
      TOKEN_CONTRACT_ADDRESS,
      CHAIN_ID
    )

    const amount = balance?.data || '0'
    if (amount === '0') {
      return NextResponse.json({ transactionIds: [], amount: '0' })
    }

    // Execute transfer from the user's wallet (requires auth token)
    const result = await transferTokens(
      fromAddress,
      recipientAddress,
      amount,
      TOKEN_CONTRACT_ADDRESS,
      CHAIN_ID,
      authToken
    )

    return NextResponse.json({ transactionIds: result.transactionIds, amount })
  } catch (error) {
    console.error('Error processing withdraw:', error)
    return NextResponse.json(
      { error: 'Failed to process withdraw' },
      { status: 500 }
    )
  }
}


