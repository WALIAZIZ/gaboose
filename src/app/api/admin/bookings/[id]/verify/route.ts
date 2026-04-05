import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { verified, notes } = await request.json()

    // Find payment proof
    const paymentProof = await db.paymentProof.findUnique({ where: { bookingId: id } })
    if (!paymentProof) {
      return NextResponse.json({ error: 'Payment proof not found' }, { status: 404 })
    }

    // Update payment proof
    await db.paymentProof.update({
      where: { bookingId: id },
      data: {
        verified,
        verifiedBy: user.name,
        verifiedAt: verified ? new Date() : null,
        notes: notes || paymentProof.notes,
      },
    })

    // Update booking status
    if (verified) {
      await db.booking.update({
        where: { id },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      })
    }

    return NextResponse.json({ success: true, verified })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
