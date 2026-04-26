const fs = require('fs');
console.log('=== GABOOSE FIX ALL ===\n');

// FIX 1: Calendar block past dates
console.log('--- FIX 1: Calendar ---');
try {
  let src = fs.readFileSync('src/components/booking-dialog.tsx', 'utf8');
  let old1 = 'disabled={(date) => { if (!formData.checkIn) return false; const [y,m,d] = formData.checkIn.split("-").map(Number); const checkIn = new Date(y, m-1, d); checkIn.setHours(0,0,0,0); const d2 = new Date(date); d2.setHours(0,0,0,0); return d2 <= checkIn; }}';
  let new1 = 'disabled={(date) => { const today = new Date(); today.setHours(0,0,0,0); const d2 = new Date(date); d2.setHours(0,0,0,0); return d2 < today; }}';
  if (src.includes(old1)) {
    src = src.replace(old1, new1);
    fs.writeFileSync('src/components/booking-dialog.tsx', src, 'utf8');
    console.log('  [OK] Check-in now blocks past dates');
  } else {
    console.log('  [SKIP] Already fixed or pattern changed');
  }
} catch(e) { console.log('  [ERROR] ' + e.message); }

// FIX 2: Add image to MenuItem schema
console.log('\n--- FIX 2: Schema ---');
try {
  let s = fs.readFileSync('prisma/schema.prisma', 'utf8');
  if (!s.includes('image') && s.includes('model MenuItem')) {
    s = s.replace(/(  price\s+Float\n)/, '$1  image         String?\n');
    fs.writeFileSync('prisma/schema.prisma', s, 'utf8');
    console.log('  [OK] Added image field to MenuItem');
  } else {
    console.log('  [SKIP] Already has image field');
  }
} catch(e) { console.log('  [ERROR] ' + e.message); }

// FIX 3: Admin menu route with PUT + image
console.log('\n--- FIX 3: Admin menu route ---');
try {
  fs.writeFileSync('src/app/api/admin/menu/route.ts', [
    "import { NextRequest, NextResponse } from 'next/server'",
    "import { db } from '@/lib/db'",
    "import { getAuthUser } from '@/lib/auth'",
    "import { put } from '@vercel/blob'",
    "",
    "export async function GET(request: NextRequest) {",
    "  try {",
    "    const user = getAuthUser(request)",
    "    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
    "    const { searchParams } = new URL(request.url)",
    "    const category = searchParams.get('category')",
    "    const where: any = {}",
    "    if (category) where.category = category",
    "    const items = await db.menuItem.findMany({ where, orderBy: { sortOrder: 'asc' } })",
    "    return NextResponse.json(items)",
    "  } catch (error) {",
    "    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })",
    "  }",
    "}",
    "",
    "export async function POST(request: NextRequest) {",
    "  try {",
    "    const user = getAuthUser(request)",
    "    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
    "    let data: any = {}",
    "    let imageUrl: string | null = null",
    "    const ct = request.headers.get('content-type') || ''",
    "    if (ct.includes('multipart/form-data')) {",
    "      const fd = await request.formData()",
    "      const img = fd.get('image') as File | null",
    "      data = { category: fd.get('category') || 'breakfast', name: fd.get('name'), nameSo: fd.get('nameSo') || '', description: fd.get('description'), descriptionSo: fd.get('descriptionSo') || '', price: fd.get('price'), available: fd.get('available') !== 'false', sortOrder: fd.get('sortOrder') || '0' }",
    "      if (img && img.size > 0) {",
    "        const ext = img.name.split('.').pop() || 'jpg'",
    "        const blob = await put('menu-' + Date.now() + '.' + ext, img, { access: 'public' })",
    "        imageUrl = blob.url",
    "      }",
    "    } else {",
    "      data = await request.json()",
    "      imageUrl = data.image || null",
    "    }",
    "    const item = await db.menuItem.create({",
    "      data: { category: data.category || 'breakfast', name: data.name, nameSo: data.nameSo || '', description: data.description, descriptionSo: data.descriptionSo || '', price: parseFloat(data.price), available: data.available !== false, sortOrder: parseInt(data.sortOrder) || 0, image: imageUrl }",
    "    })",
    "    return NextResponse.json(item, { status: 201 })",
    "  } catch (error) {",
    "    console.error('Menu create error:', error)",
    "    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })",
    "  }",
    "}",
    "",
    "export async function PUT(request: NextRequest) {",
    "  try {",
    "    const user = getAuthUser(request)",
    "    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })",
    "    let data: any = {}",
    "    let imageUrl: string | undefined = undefined",
    "    const ct = request.headers.get('content-type') || ''",
    "    if (ct.includes('multipart/form-data')) {",
    "      const fd = await request.formData()",
    "      const img = fd.get('image') as File | null",
    "      data = { id: fd.get('id'), category: fd.get('category'), name: fd.get('name'), nameSo: fd.get('nameSo'), description: fd.get('description'), descriptionSo: fd.get('descriptionSo'), price: fd.get('price'), available: fd.get('available'), sortOrder: fd.get('sortOrder') }",
    "      if (img && img.size > 0) {",
    "        const ext = img.name.split('.').pop() || 'jpg'",
    "        const blob = await put('menu-' + Date.now() + '.' + ext, img, { access: 'public' })",
    "        imageUrl = blob.url",
    "      }",
    "    } else {",
    "      data = await request.json()",
    "      if (data.image !== undefined) imageUrl = data.image",
    "    }",
    "    if (!data.id) return NextResponse.json({ error: 'ID required' }, { status: 400 })",
    "    const update: any = {}",
    "    if (data.category !== undefined) update.category = data.category",
    "    if (data.name !== undefined) update.name = data.name",
    "    if (data.nameSo !== undefined) update.nameSo = data.nameSo",
    "    if (data.description !== undefined) update.description = data.description",
    "    if (data.descriptionSo !== undefined) update.descriptionSo = data.descriptionSo",
    "    if (data.price !== undefined) update.price = parseFloat(data.price)",
    "    if (data.available !== undefined) update.available = data.available === true || data.available === 'true'",
    "    if (data.sortOrder !== undefined) update.sortOrder = parseInt(data.sortOrder)",
    "    if (imageUrl !== undefined) update.image = imageUrl",
    "    const item = await db.menuItem.update({ where: { id: data.id }, data: update })",
    "    return NextResponse.json(item)",
    "  } catch (error) {",
    "    console.error('Menu update error:', error)",
    "    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })",
    "  }",
    "}"
  ].join('\n'), 'utf8');
  console.log('  [OK] Admin menu route updated with PUT + image support');
} catch(e) { console.log('  [ERROR] ' + e.message); }

// FIX 4: Page.tsx show menu images
console.log('\n--- FIX 4: Page.tsx menu images ---');
try {
  let page = fs.readFileSync('src/app/page.tsx', 'utf8');
  if (!page.includes('item.image')) {
    let old = '<h4 className="font-semibold" style={{ color:';
    let idx = page.indexOf(old);
    if (idx > -1) {
      let before = page.substring(0, idx);
      let after = page.substring(idx);
      page = before + "{item.image ? <img src={item.image} alt={item.name} className=\"w-full h-20 object-cover rounded-lg mb-2\" /> : null}\n                          " + after;
      fs.writeFileSync('src/app/page.tsx', page, 'utf8');
      console.log('  [OK] Menu items now show images');
    } else {
      console.log('  [WARN] Pattern not found');
    }
  } else {
    console.log('  [SKIP] Already has image rendering');
  }
} catch(e) { console.log('  [ERROR] ' + e.message); }

console.log('\n=== ALL FIXES APPLIED ===');