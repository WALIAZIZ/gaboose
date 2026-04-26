import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const where: any = {}
    if (category) where.category = category
    const items = await db.menuItem.findMany({ where, orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    let data: any = {}
    let imageUrl: string | null = null
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('multipart/form-data')) {
      const fd = await request.formData()
      const img = fd.get('image') as File | null
      data = { category: fd.get('category') || 'breakfast', name: fd.get('name'), nameSo: fd.get('nameSo') || '', description: fd.get('description'), descriptionSo: fd.get('descriptionSo') || '', price: fd.get('price'), available: fd.get('available') !== 'false', sortOrder: fd.get('sortOrder') || '0' }
      if (img && img.size > 0) {
        const ext = img.name.split('.').pop() || 'jpg'
        const blob = await put('menu-' + Date.now() + '.' + ext, img, { access: 'public' })
        imageUrl = blob.url
      }
    } else {
      data = await request.json()
      imageUrl = data.image || null
    }
    const item = await db.menuItem.create({
      data: { category: data.category || 'breakfast', name: data.name, nameSo: data.nameSo || '', description: data.description, descriptionSo: data.descriptionSo || '', price: parseFloat(data.price), available: data.available !== false, sortOrder: parseInt(data.sortOrder) || 0, image: imageUrl }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Menu create error:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    let data: any = {}
    let imageUrl: string | undefined = undefined
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('multipart/form-data')) {
      const fd = await request.formData()
      const img = fd.get('image') as File | null
      data = { id: fd.get('id'), category: fd.get('category'), name: fd.get('name'), nameSo: fd.get('nameSo'), description: fd.get('description'), descriptionSo: fd.get('descriptionSo'), price: fd.get('price'), available: fd.get('available'), sortOrder: fd.get('sortOrder') }
      if (img && img.size > 0) {
        const ext = img.name.split('.').pop() || 'jpg'
        const blob = await put('menu-' + Date.now() + '.' + ext, img, { access: 'public' })
        imageUrl = blob.url
      }
    } else {
      data = await request.json()
      if (data.image !== undefined) imageUrl = data.image
    }
    if (!data.id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const update: any = {}
    if (data.category !== undefined) update.category = data.category
    if (data.name !== undefined) update.name = data.name
    if (data.nameSo !== undefined) update.nameSo = data.nameSo
    if (data.description !== undefined) update.description = data.description
    if (data.descriptionSo !== undefined) update.descriptionSo = data.descriptionSo
    if (data.price !== undefined) update.price = parseFloat(data.price)
    if (data.available !== undefined) update.available = data.available === true || data.available === 'true'
    if (data.sortOrder !== undefined) update.sortOrder = parseInt(data.sortOrder)
    if (imageUrl !== undefined) update.image = imageUrl
    const item = await db.menuItem.update({ where: { id: data.id }, data: update })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Menu update error:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}