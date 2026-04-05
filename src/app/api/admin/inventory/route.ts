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

    const items = await db.inventoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, nameSo, category, quantity, unit, minQuantity, costPerUnit, supplier, lastRestocked, notes } = body

    if (!name || !nameSo || !category || !quantity || !unit || !costPerUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const item = await db.inventoryItem.create({
      data: {
        name,
        nameSo,
        category,
        quantity: Number(quantity),
        unit,
        minQuantity: Number(minQuantity) || 5,
        costPerUnit: Number(costPerUnit),
        supplier: supplier || null,
        lastRestocked: lastRestocked ? new Date(lastRestocked) : new Date(),
        notes: notes || null,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Inventory create error:', error)
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 })
  }
}
