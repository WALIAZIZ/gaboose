const fs = require('fs');
const path = require('path');

const dir = 'src/app/api/bookings';
const files = fs.readdirSync(dir);
let idDir = null;
for (let f of files) {
  if (f.startsWith('[')) { idDir = path.join(dir, f); break; }
}
const routePath = path.join(idDir, 'payment', 'route.ts');

const newRoute = `import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Step 1: Find booking
    const booking = await db.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Step 2: Parse form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const senderName = formData.get('senderName') as string
    const amount = formData.get('amount') as string
    const accountName = formData.get('accountName') as string
    const notes = formData.get('notes') as string

    if (!imageFile || !senderName) {
      return NextResponse.json({ error: 'Image and sender name are required' }, { status: 400 })
    }

    // Step 3: Upload to Vercel Blob (private store)
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const filename = 'payment-' + id + '-' + Date.now() + '.' + ext
    const blob = await put(filename, imageFile)
    const imageUrl = blob.url

    // Step 4: Create payment proof in database
    const paymentProof = await db.paymentProof.create({
      data: {
        bookingId: id,
        imageUrl: imageUrl,
        senderName: senderName,
        amount: amount ? parseFloat(amount) : null,
        accountName: accountName || null,
        notes: notes || null,
      },
    })

    // Step 5: Update booking status
    await db.booking.update({
      where: { id },
      data: { paymentStatus: 'pending' },
    })

    return NextResponse.json(paymentProof, { status: 201 })
  } catch (error) {
    console.error('Payment proof error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to upload: ' + msg }, { status: 500 })
  }
}
`;

fs.writeFileSync(routePath, newRoute, 'utf8');
console.log('FIXED: Payment route rewritten with clean syntax');
console.log('Route saved to:', routePath);