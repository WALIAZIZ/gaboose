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
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Menu create error:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}
