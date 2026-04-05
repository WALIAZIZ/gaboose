import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const image = await db.hotelImage.findUnique({ where: { id } })
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    return NextResponse.json(image)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const data = await request.json()
    const image = await db.hotelImage.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        imageUrl: data.imageUrl,
        sortOrder: parseInt(data.sortOrder) || 0,
      },
    })
    return NextResponse.json(image)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await db.hotelImage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
