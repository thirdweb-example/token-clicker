import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookies } from '@/lib/auth'

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ success: true })
  clearSessionCookies(res)
  return res
}


