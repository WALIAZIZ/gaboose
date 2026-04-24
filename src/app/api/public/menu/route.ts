import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const where: any = { available: true }
    if (category) where.category = category
    const items = await db.menuItem.findMany({ where, orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
