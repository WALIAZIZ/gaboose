import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

// Allowed image MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

// Max file size: 5MB before compression
const MAX_SIZE = 5 * 1024 * 1024

// Target max dimension for resizing large images
const MAX_DIMENSION = 1920

// Quality for JPEG/WebP compression (0.0 - 1.0)
const COMPRESSION_QUALITY = 0.82

/**
 * Resize image using canvas if it exceeds MAX_DIMENSION.
 * Falls back to returning original bytes if canvas is unavailable (Edge runtime).
 */
async function compressImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  // Only compress JPEG and PNG (convert PNG to WebP for smaller size)
  if (mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
    return { buffer, mimeType }
  }

  try {
    // Dynamic import for environments where canvas is available
    const { ImageCanvas } = await import('canvas' as any).catch(() => ({})) as any

    // If canvas module is not available, try browser-style approach
    // In Node.js 18+, we can use the built-in Image constructor with OffscreenCanvas
    const { createCanvas } = await import('canvas' as any).catch(() => {
      return { createCanvas: null }
    })

    if (!createCanvas) {
      // No canvas module — return original
      return { buffer, mimeType }
    }

    const img = new (await import('canvas' as any)).Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
    })
    // @ts-ignore
    img.src = buffer

    let width = img.width
    let height = img.height

    // Scale down if image is too large
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)

    const outBuffer = canvas.toBuffer('image/jpeg', { quality: COMPRESSION_QUALITY })
    return { buffer: outBuffer, mimeType: 'image/jpeg' }
  } catch {
    // Canvas not available or processing failed — return original
    return { buffer, mimeType }
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG` },
        { status: 400 }
      )
    }

    // Validate file name has extension
    const fileName = file.name || 'upload'
    if (!fileName.includes('.')) {
      return NextResponse.json({ error: 'File must have an extension' }, { status: 400 })
    }

    // Validate file size
    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 5MB` },
        { status: 400 }
      )
    }

    // Read file bytes
    const bytes = await file.arrayBuffer()
    const rawBuffer = Buffer.from(bytes)

    // Try to compress/resize the image
    const { buffer: finalBuffer, mimeType: finalMimeType } = await compressImage(rawBuffer, file.type)

    // Convert to base64 data URL
    const base64 = finalBuffer.toString('base64')
    const dataUrl = `data:${finalMimeType};base64,${base64}`

    const originalSize = file.size
    const finalSize = finalBuffer.length
    const compressionSaved = originalSize > finalSize
      ? Math.round((1 - finalSize / originalSize) * 100)
      : 0

    return NextResponse.json({
      url: dataUrl,
      meta: {
        fileName,
        originalSize: `${(originalSize / 1024).toFixed(0)}KB`,
        finalSize: `${(finalSize / 1024).toFixed(0)}KB`,
        compressed: compressionSaved > 0,
        compressionSaved: `${compressionSaved}%`,
      },
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    )
  }
}