import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET all admin users (only for admin role)
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const admins = await db.admin.findMany({
      select: { id: true, username: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(admins)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}

// Change password
export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, userId, newPassword, currentPassword, username, name, role } = await request.json()

    if (action === 'changePassword') {
      // Verify current password
      const admin = await db.admin.findUnique({ where: { id: user.id } })
      if (!admin) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const isValid = await bcrypt.compare(currentPassword, admin.password)
      if (!isValid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await db.admin.update({ where: { id: user.id }, data: { password: hashedPassword } })
      return NextResponse.json({ success: true })
    }

    if (action === 'updateUser' && user.role === 'admin') {
      const updateData: any = {}
      if (username) updateData.username = username
      if (name) updateData.name = name
      if (role) updateData.role = role
      if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10)

      const updatedAdmin = await db.admin.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, username: true, name: true, role: true, createdAt: true },
      })
      return NextResponse.json(updatedAdmin)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// Create admin user (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { username, password, name, role } = await request.json()
    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Username, password, and name are required' }, { status: 400 })
    }

    const existing = await db.admin.findUnique({ where: { username } })
    if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = await db.admin.create({
      data: { username, password: hashedPassword, name, role: role || 'employee' },
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    })
    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { id } = await request.json()
    if (id === user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

    await db.admin.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 })
  }
}
