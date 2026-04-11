import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  { params }: { params: { prefix: string } }
) {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool as any);
    const prisma = new PrismaClient({ adapter });

    const prefix = params.prefix;
    let data: Record<string, any> = {};

    switch (prefix) {
      case 'hero':
        const heroContent = await prisma.heroContent.findFirst();
        data = heroContent ? {
          title: heroContent.title,
          subtitle: heroContent.subtitle,
          imageUrl: heroContent.imageUrl
        } : {};
        break;
      case 'rooms':
        const rooms = await prisma.room.findMany({ orderBy: { order: 'asc' } });
        data = rooms;
        break;
      case 'services':
        const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
        data = services;
        break;
      case 'gallery':
        const gallery = await prisma.galleryItem.findMany({ orderBy: { order: 'asc' } });
        data = gallery;
        break;
      case 'testimonials':
        const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
        data = testimonials;
        break;
      case 'contact':
        const contact = await prisma.contactInfo.findFirst();
        data = contact ? {
          address: contact.address,
          phone: contact.phone,
          email: contact.email,
          mapUrl: contact.mapUrl
        } : {};
        break;
      default:
        return NextResponse.json({ error: 'Invalid prefix' }, { status: 400 });
    }

    await prisma.$disconnect();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}