import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const totalBookings = await db.booking.count()
    const pendingBookings = await db.booking.count({ where: { status: 'pending' } })
    const confirmedBookings = await db.booking.count({ where: { status: 'confirmed' } })
    const completedBookings = await db.booking.count({ where: { status: 'completed' } })

    // Today's check-ins
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    const todayCheckIns = await db.booking.count({
      where: { checkIn: { gte: startOfDay, lte: endOfDay } },
    })

    // Unread messages
    const unreadMessages = await db.contactMessage.count({ where: { read: false } })

    // Room stats
    const totalRooms = await db.hotelRoom.count()
    const availableRooms = await db.hotelRoom.count({ where: { available: true } })

    // Revenue this month
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    const monthRevenue = await db.revenue.aggregate({
      _sum: { amount: true },
      where: { date: { gte: firstOfMonth, lte: lastOfMonth } },
    })

    // Recent bookings
    const recentBookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Notes count
    const totalNotes = await db.dashboardNote.count()

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      todayCheckIns,
      unreadMessages,
      totalRooms,
      availableRooms,
      monthRevenue: monthRevenue._sum.amount || 0,
      recentBookings,
      totalNotes,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
