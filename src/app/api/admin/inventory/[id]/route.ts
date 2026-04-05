import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const item = await db.inventoryItem.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.nameSo !== undefined && { nameSo: body.nameSo }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.quantity !== undefined && { quantity: Number(body.quantity) }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.minQuantity !== undefined && { minQuantity: Number(body.minQuantity) }),
        ...(body.costPerUnit !== undefined && { costPerUnit: Number(body.costPerUnit) }),
        ...(body.supplier !== undefined && { supplier: body.supplier }),
        ...(body.lastRestocked !== undefined && { lastRestocked: body.lastRestocked ? new Date(body.lastRestocked) : null }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Inventory update error:', error)
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await db.inventoryItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Inventory delete error:', error)
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
  }
}
