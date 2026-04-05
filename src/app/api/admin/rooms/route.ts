import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rooms = await db.hotelRoom.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const room = await db.hotelRoom.create({
      data: {
        name: data.name,
        nameSo: data.nameSo || '',
        description: data.description,
        descriptionSo: data.descriptionSo || '',
        price: parseFloat(data.price),
        image: data.image || '',
        features: JSON.stringify(data.features || []),
        maxGuests: parseInt(data.maxGuests) || 2,
        available: data.available !== false,
        sortOrder: parseInt(data.sortOrder) || 0,
      },
    })
    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Room create error:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
