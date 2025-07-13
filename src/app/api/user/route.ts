import { NextRequest, NextResponse } from 'next/server'
import { createWallet } from '@/lib/thirdweb'
import { User } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Create a wallet for the user using their username as identifier
    const walletResponse = await createWallet(username)

    const user: User = {
      id: username,
      username,
      walletAddress: walletResponse.address,
      smartWalletAddress: walletResponse.smartWalletAddress,
      createdAt: walletResponse.createdAt,
    }

    console.log('user', user)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 