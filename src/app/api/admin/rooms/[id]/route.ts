import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const room = await db.hotelRoom.findUnique({ where: { id } })
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    return NextResponse.json(room)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const data = await request.json()
    const room = await db.hotelRoom.update({
      where: { id },
      data: {
        name: data.name,
        nameSo: data.nameSo,
        description: data.description,
        descriptionSo: data.descriptionSo,
        price: parseFloat(data.price),
        image: data.image,
        features: JSON.stringify(data.features || []),
        maxGuests: parseInt(data.maxGuests) || 2,
        available: data.available,
        sortOrder: parseInt(data.sortOrder) || 0,
      },
    })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Room update error:', error)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await db.hotelRoom.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}
