import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    // Delete all data EXCEPT Admin users and SiteContent
    await db.$transaction([
      db.paymentProof.deleteMany(),
      db.booking.deleteMany(),
      db.contactMessage.deleteMany(),
      db.hotelRoom.deleteMany(),
      db.menuItem.deleteMany(),
      db.hotelImage.deleteMany(),
      db.expense.deleteMany(),
      db.revenue.deleteMany(),
      db.dashboardNote.deleteMany(),
      db.inventoryItem.deleteMany(),
    ])

    return NextResponse.json({
      success: true,
      message: 'All data cleared successfully. Admin accounts and site settings were preserved.',
    })
  } catch (error) {
    console.error('Clear data error:', error)
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
  }
}
