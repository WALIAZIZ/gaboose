import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) where.category = category

    const images = await db.hotelImage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const image = await db.hotelImage.create({
      data: {
        title: data.title || '',
        category: data.category || 'gallery',
        imageUrl: data.imageUrl,
        sortOrder: parseInt(data.sortOrder) || 0,
      },
    })
    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Image create error:', error)
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 })
  }
}
