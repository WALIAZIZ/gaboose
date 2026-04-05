import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const revenue = await db.revenue.findUnique({ where: { id } })
    if (!revenue) return NextResponse.json({ error: 'Revenue not found' }, { status: 404 })
    return NextResponse.json(revenue)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const data = await request.json()
    const revenue = await db.revenue.update({
      where: { id },
      data: {
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
      },
    })
    return NextResponse.json(revenue)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update revenue' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await db.revenue.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete revenue' }, { status: 500 })
  }
}
