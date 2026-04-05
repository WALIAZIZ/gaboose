import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') || 'payment'

    const contents = await db.siteContent.findMany({
      where: { key: { startsWith: prefix } },
      orderBy: { key: 'asc' },
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Site content fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
