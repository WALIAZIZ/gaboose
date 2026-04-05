import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (category) where.category = category
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) }
    } else if (startDate) {
      where.date = { gte: new Date(startDate) }
    } else if (endDate) {
      where.date = { lte: new Date(endDate) }
    }

    const revenueEntries = await db.revenue.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(revenueEntries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const revenue = await db.revenue.create({
      data: {
        category: data.category || 'other',
        description: data.description,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        createdBy: user.id,
      },
    })
    return NextResponse.json(revenue, { status: 201 })
  } catch (error) {
    console.error('Revenue create error:', error)
    return NextResponse.json({ error: 'Failed to create revenue entry' }, { status: 500 })
  }
}
