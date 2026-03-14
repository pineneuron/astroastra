import { NextResponse } from 'next/server'
import { getExchangeRates } from '@/lib/settings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const rates = await getExchangeRates()
    return NextResponse.json(rates)
  } catch (e) {
    console.error('Exchange rates error:', e)
    return NextResponse.json(
      { USD: 133, CAD: 100, GBP: 170, NPR: 1 },
      { status: 200 }
    )
  }
}
