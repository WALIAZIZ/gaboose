import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import sharp from 'sharp'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_INPUT_SIZE = 5 * 1024 * 1024
const MAX_DIMENSION = 1200
const JPEG_QUALITY = 75

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Use JPEG, PNG, WebP, or GIF.` },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    if (file.size > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max is 5MB.` },
        { status: 400 }
      )
    }

    const rawBytes = await file.arrayBuffer()
    let inputBuffer = Buffer.from(rawBytes)

    let pipeline = sharp(inputBuffer)
    const metadata = await pipeline.metadata()
    const width = metadata.width || 0
    const height = metadata.height || 0

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    const outputBuffer = await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer()

    const base64 = outputBuffer.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64}`

    return NextResponse.json({
      url: dataUrl,
      meta: {
        originalSize: `${(inputBuffer.length / 1024).toFixed(0)}KB`,
        compressedSize: `${(outputBuffer.length / 1024).toFixed(0)}KB`,
        saved: `${Math.round((1 - outputBuffer.length / inputBuffer.length) * 100)}%`,
        dimensions: `${width}x${height}`,
        resized: width > MAX_DIMENSION || height > MAX_DIMENSION,
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