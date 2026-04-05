import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check booking exists
    const booking = await db.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const senderName = formData.get('senderName') as string
    const amount = formData.get('amount') as string
    const accountName = formData.get('accountName') as string
    const notes = formData.get('notes') as string

    if (!imageFile || !senderName) {
      return NextResponse.json({ error: 'Image and sender name are required' }, { status: 400 })
    }

    // Save image
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const filename = `payment-${id}-${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'payments')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    const imageUrl = `/upload/payments/${filename}`

    // Create payment proof
    const paymentProof = await db.paymentProof.create({
      data: {
        bookingId: id,
        imageUrl,
        senderName,
        amount: amount ? parseFloat(amount) : null,
        accountName: accountName || null,
        notes: notes || null,
      },
    })

    // Update booking payment status
    await db.booking.update({
      where: { id },
      data: { paymentStatus: 'pending' },
    })

    return NextResponse.json(paymentProof, { status: 201 })
  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json({ error: 'Failed to upload payment proof' }, { status: 500 })
  }
}
