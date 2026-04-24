import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const rooms = await db.hotelRoom.findMany({
      where: { available: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
