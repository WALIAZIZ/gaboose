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
    const items = await db.menuItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await request.json()
    const item = await db.menuItem.create({
      data: {
        category: data.category || 'breakfast',
        name: data.name,
        nameSo: data.nameSo || '',
        description: data.description,
        descriptionSo: data.descriptionSo || '',
        price: parseFloat(data.price),
        available: data.available !== false,
        sortOrder: parseInt(data.sortOrder) || 0,
        image: data.image || null,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Menu create error:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await request.json()
    if (!data.id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const update: any = {}
    if (data.category !== undefined) update.category = data.category
    if (data.name !== undefined) update.name = data.name
    if (data.nameSo !== undefined) update.nameSo = data.nameSo
    if (data.description !== undefined) update.description = data.description
    if (data.descriptionSo !== undefined) update.descriptionSo = data.descriptionSo
    if (data.price !== undefined) update.price = parseFloat(data.price)
    if (data.available !== undefined) update.available = data.available
    if (data.sortOrder !== undefined) update.sortOrder = parseInt(data.sortOrder)
    if (data.image !== undefined) update.image = data.image
    const item = await db.menuItem.update({
      where: { id: data.id },
      data: update,
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Menu update error:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.menuItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}