import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { updateBooking } from '../../actions'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const res = await updateBooking(formData, true)
    if (res instanceof Response) {
      if (!res.ok) {
        const text = await res.text()
        return NextResponse.json({ ok: false, error: text || 'Update failed' }, { status: res.status })
      }
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'NEXT_REDIRECT') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Update booking route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 })
  }
}
