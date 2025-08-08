import { NextRequest, NextResponse } from 'next/server'
import { CHAIN_ID, SCORE_CONTRACT_ADDRESS } from '@/lib/constants'
import { getTokenOwners } from '@/lib/thirdweb'

// Ensure this route is always dynamic and never cached
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(_request: NextRequest) {
  try {
    const result = await getTokenOwners(CHAIN_ID, SCORE_CONTRACT_ADDRESS, 3)
    const owners = Array.isArray(result?.owners) ? result.owners : []
    owners.sort((a: any, b: any) => {
      try {
        return (BigInt(b.amount || '0') > BigInt(a.amount || '0')) ? 1 : (BigInt(b.amount || '0') < BigInt(a.amount || '0') ? -1 : 0)
      } catch {
        return 0
      }
    })
    const topOwners = owners.slice(0, 3)
    return NextResponse.json(
      { owners: topOwners },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  }
}


