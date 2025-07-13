import { NextRequest, NextResponse } from 'next/server'
import { listTransactions } from '@/lib/thirdweb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const transactions = await listTransactions(page, limit)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error getting transactions:', error)
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    )
  }
} 