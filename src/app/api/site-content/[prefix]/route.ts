import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { prefix: string } }
) {
  try {
    const prefix = params.prefix;
    let data: Record<string, any> = {};

    switch (prefix) {
      case 'hero':
        const heroContent = await db.heroContent.findFirst();
        data = heroContent ? {
          title: heroContent.title,
          subtitle: heroContent.subtitle,
          imageUrl: heroContent.imageUrl
        } : {};
        break;
      case 'rooms':
        const rooms = await db.room.findMany({ orderBy: { order: 'asc' } });
        data = rooms;
        break;
      case 'services':
        const services = await db.service.findMany({ orderBy: { order: 'asc' } });
        data = services;
        break;
      case 'gallery':
        const gallery = await db.galleryItem.findMany({ orderBy: { order: 'asc' } });
        data = gallery;
        break;
      case 'testimonials':
        const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
        data = testimonials;
        break;
      case 'contact':
        const contact = await db.contactInfo.findFirst();
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}