import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const contents = await db.siteContent.findMany({ orderBy: { key: 'asc' } })
    return NextResponse.json(contents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { key, value, valueSo } = await request.json()
    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 })

    const content = await db.siteContent.upsert({
      where: { key },
      update: { value: value || '', valueSo: valueSo || '' },
      create: { key, value: value || '', valueSo: valueSo || '' },
    })
    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
