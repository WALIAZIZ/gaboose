import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const images = await db.hotelImage.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
