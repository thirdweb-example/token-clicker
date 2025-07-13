import { NextRequest, NextResponse } from 'next/server'
import { getTransaction } from '@/lib/thirdweb'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const transaction = await getTransaction(id)

    // Return response with no-cache headers
    return NextResponse.json(
      { result: transaction },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Error getting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to get transaction' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        }
      }
    )
  }
} 