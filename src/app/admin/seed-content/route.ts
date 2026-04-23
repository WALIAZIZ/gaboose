import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const results: Record<string, number> = {}

    // ---- SEED ROOMS ----
    const defaultRooms = [
      {
        name: 'Standard Single',
        nameSo: 'Qolka Qofkale',
        description: 'A cozy room perfect for solo travelers looking for comfort and convenience.',
        descriptionSo: 'Qol yar oo raaxo badan oo loogu talagalay safarayaal qofkale ah.',
        price: 25,
        image: '/images/room-1.jpg',
        features: JSON.stringify(['Single Bed', 'Private Bathroom', 'Fan', 'Free WiFi']),
        maxGuests: 1,
        available: true,
        sortOrder: 0,
      },
      {
        name: 'Standard Double',
        nameSo: 'Qolka Labada Qof',
        description: 'Comfortable double room ideal for couples or friends traveling together.',
        descriptionSo: 'Qol laba qof oo raaxo badan oo loogu talagalay lammaane ama saaxiibbada safarka.',
        price: 40,
        image: '/images/room-2.jpg',
        features: JSON.stringify(['Double Bed', 'Private Bathroom', 'Fan', 'Free WiFi']),
        maxGuests: 2,
        available: true,
        sortOrder: 1,
      },
      {
        name: 'Family Room',
        nameSo: 'Qolka Qoyska',
        description: 'Spacious family room with extra bedding, perfect for small families.',
        descriptionSo: 'Qol ballaaran oo leh qol dheeraad ah, oo ku saabsan qoysyada yar.',
        price: 55,
        image: '/images/room-4.jpg',
        features: JSON.stringify(['1 Double + 1 Single Bed', 'Private Bathroom', 'AC', 'Free WiFi']),
        maxGuests: 4,
        available: true,
        sortOrder: 2,
      },
      {
        name: 'Deluxe Room',
        nameSo: 'Qolka Saadaalka ah',
        description: 'Our premium room with all amenities for a truly comfortable stay.',
        descriptionSo: 'Qolkeena ugu fiican oo leh dhammaan adeegyada si aad u raaxayso.',
        price: 70,
        image: '/images/room-5.jpg',
        features: JSON.stringify(['King Bed', 'Private Bathroom', 'AC', 'TV', 'Free WiFi', 'Mini Fridge']),
        maxGuests: 2,
        available: true,
        sortOrder: 3,
      },
    ]

    const existingRooms = await db.hotelRoom.count()
    if (existingRooms === 0) {
      for (const room of defaultRooms) {
        await db.hotelRoom.create({ data: room })
      }
      results.rooms = defaultRooms.length
    } else {
      results.rooms = existingRooms
    }

    // ---- SEED MENU ITEMS ----
    const defaultMenuItems = [
      { category: 'breakfast', name: 'Ethiopian Breakfast', nameSo: 'Quraacan Itoobiyaan', description: 'Traditional injera with various dishes, shiro, and vegetables.', descriptionSo: 'Canjeero tradishan ah oo leh cunto badan, shiro, iyo khudaar.', price: 8, available: true, sortOrder: 0 },
      { category: 'breakfast', name: 'Continental Breakfast', nameSo: 'Quraacan Bariga Afrika', description: 'Bread, eggs, butter, jam, and fresh juice.', descriptionSo: 'Fool, ukun, subag, jam, iyo jus cusub.', price: 10, available: true, sortOrder: 1 },
      { category: 'breakfast', name: 'Light Breakfast', nameSo: 'Quraacan Faydali', description: 'Tea or coffee with bread and butter.', descriptionSo: 'Shah ama bun macaan oo leh fool iyo subag.', price: 5, available: true, sortOrder: 2 },
      { category: 'breakfast', name: 'Fruit Platter', nameSo: 'Furidda Miirta', description: 'Seasonal fresh fruits served with honey.', descriptionSo: 'Miir cusub oo xilli ah oo lagu dhammeeyey malab.', price: 4, available: true, sortOrder: 3 },
      { category: 'breakfast', name: 'Coffee Ceremony', nameSo: 'Bun-qaloon', description: 'Traditional Ethiopian coffee ceremony experience.', descriptionSo: 'Bun-qaloon tradishan ah oo Itoobiyaan.', price: 3, available: true, sortOrder: 4 },
      { category: 'drinks', name: 'Macchiato', nameSo: 'Makyato', description: 'Espresso with a small amount of milk foam.', descriptionSo: 'Kahwa oo leh caano yar oo buuxa.', price: 2, available: true, sortOrder: 0 },
      { category: 'drinks', name: 'Tea', nameSo: 'Shah', description: 'Traditional Somali/Ethiopian tea with spices.', descriptionSo: 'Shah tradishan oo Soomaali/Itoobiyaan ah.', price: 1.5, available: true, sortOrder: 1 },
      { category: 'drinks', name: 'Fresh Juice', nameSo: 'Jus Cusub', description: 'Freshly squeezed juice from seasonal fruits.', descriptionSo: 'Jus cusub oo ka samaysan miir xilli ah.', price: 3, available: true, sortOrder: 2 },
      { category: 'drinks', name: 'Water Bottle', nameSo: 'Biyaha Lagu Xirayo', description: 'Mineral water bottle.', descriptionSo: 'Biyo macaan oo lagu xirayo.', price: 0.5, available: true, sortOrder: 3 },
      { category: 'drinks', name: 'Soft Drinks', nameSo: 'Cabitaanka Cagaaran', description: 'Assorted soft drinks and sodas.', descriptionSo: 'Cabitaan kala duwan oo cagaaran ah.', price: 1, available: true, sortOrder: 4 },
      { category: 'drinks', name: 'Sparkling Water', nameSo: 'Biyo Bubbles Ah', description: 'Carbonated sparkling water.', descriptionSo: 'Biyo oo leh bubbles.', price: 1.5, available: true, sortOrder: 5 },
    ]

    const existingMenu = await db.menuItem.count()
    if (existingMenu === 0) {
      for (const item of defaultMenuItems) {
        await db.menuItem.create({ data: item })
      }
      results.menuItems = defaultMenuItems.length
    } else {
      results.menuItems = existingMenu
    }

    // ---- SEED GALLERY ----
    const defaultGallery = [
      { title: 'Gaboose Hotel Entrance', category: 'hotel', imageUrl: '/images/hotel-1.jpg', sortOrder: 0 },
      { title: 'Hotel Interior', category: 'hotel', imageUrl: '/images/hotel-2.jpg', sortOrder: 1 },
      { title: 'Hotel Lobby', category: 'hotel', imageUrl: '/images/hotel-3.jpg', sortOrder: 2 },
      { title: 'Hotel Courtyard', category: 'hotel', imageUrl: '/images/hotel-4.jpg', sortOrder: 3 },
      { title: 'Hotel Exterior View', category: 'hotel', imageUrl: '/images/hotel-5.jpg', sortOrder: 4 },
      { title: 'Hotel Building', category: 'hotel', imageUrl: '/images/hotel-6.jpg', sortOrder: 5 },
      { title: 'Standard Room', category: 'room', imageUrl: '/images/room-1.jpg', sortOrder: 6 },
      { title: 'Double Room', category: 'room', imageUrl: '/images/room-2.jpg', sortOrder: 7 },
      { title: 'Triple Room', category: 'room', imageUrl: '/images/room-3.jpg', sortOrder: 8 },
      { title: 'Family Room', category: 'room', imageUrl: '/images/room-4.jpg', sortOrder: 9 },
      { title: 'Deluxe Room', category: 'room', imageUrl: '/images/room-5.jpg', sortOrder: 10 },
      { title: 'Restaurant', category: 'restaurant', imageUrl: '/images/restaurant-real.jpg', sortOrder: 11 },
    ]

    const existingGallery = await db.hotelImage.count()
    if (existingGallery === 0) {
      for (const img of defaultGallery) {
        await db.hotelImage.create({ data: img })
      }
      results.galleryImages = defaultGallery.length
    } else {
      results.galleryImages = existingGallery
    }

    // ---- SEED SITE CONTENT ----
    const defaultSiteContent = [
      { key: 'hero.image', value: '/images/hotel-5.jpg', valueSo: '/images/hotel-5.jpg' },
      { key: 'restaurant.image', value: '/images/restaurant-real.jpg', valueSo: '/images/restaurant-real.jpg' },
      { key: 'contact.phoneVal', value: '+251 91 521 0607', valueSo: '+251 91 521 0607' },
      { key: 'contact.emailVal', value: 'gaboose-hotel1@hotmail.com', valueSo: 'gaboose-hotel1@hotmail.com' },
      { key: 'contact.addressVal', value: 'Magaalo Cusub, Kabridahar\nSomali Region, Ethiopia', valueSo: 'Magaalo Cusub, Kabridahar\nGobolka Soomaalida, Itoobiya' },
      { key: 'contact.mapUrl', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.0!2d44.2813788!3d6.7318303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s6.7318303%2C44.2813788!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set', valueSo: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.0!2d44.2813788!3d6.7318303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s6.7318303%2C44.2813788!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set' },
      { key: 'social.instagram', value: '', valueSo: '' },
      { key: 'social.facebook', value: '', valueSo: '' },
      { key: 'social.telegram', value: '', valueSo: '' },
      { key: 'about.title', value: 'Welcome to Gaboose Hotel', valueSo: 'Ku soo dhawow Gaboose Hotel' },
      { key: 'about.description', value: 'Located in the heart of Kabridahar, Gaboose Hotel offers comfortable rooms, delicious dining, and warm hospitality. Whether you are traveling for business or leisure, we make every stay memorable.', valueSo: 'Ku yaalla magaalada Kabridahar, Gaboose Hotel wuxuu bixiyaa qamooyin raaxo badan, cunto fiican, iyo marti-sare. Ama safar ganacsi ama nasasho aad rabto, waxaanu ka dhigi kasta xusuus leh.' },
      { key: 'hotel.name', value: 'GABOOSE HOTEL', valueSo: 'HOTELKA GABOOSE' },
      { key: 'hotel.tagline', value: 'Comfort & Hospitality in Kabridahar', valueSo: 'Raaxo & Marti-sare Ku Yaalla Kabridahar' },
      { key: 'hours.restaurant', value: 'Open 24 Hours', valueSo: 'Waa Fur 24 Saacaddood' },
      { key: 'hours.reception', value: '24/7 Front Desk', valueSo: 'Dhakhaar 24/7' },
    ]

    let siteContentCreated = 0
    for (const item of defaultSiteContent) {
      const existing = await db.siteContent.findUnique({ where: { key: item.key } })
      if (!existing) {
        await db.siteContent.create({ data: item })
        siteContentCreated++
      }
    }
    results.siteContent = siteContentCreated

    return NextResponse.json({
      success: true,
      message: 'Default content seeded successfully',
      results,
    })
  } catch (error: any) {
    console.error('Seed content error:', error)
    return NextResponse.json(
      { error: 'Failed to seed content', details: error.message },
      { status: 500 }
    )
  }
}

// GET returns current content counts so admin can see what needs seeding
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let rooms = 0, menuItems = 0, galleryImages = 0, siteContent = 0
    try {
      [rooms, menuItems, galleryImages, siteContent] = await Promise.all([
        db.hotelRoom.count(),
        db.menuItem.count(),
        db.hotelImage.count(),
        db.siteContent.count(),
      ])
    } catch {
      // Database not ready yet
    }

    return NextResponse.json({
      rooms,
      menuItems,
      galleryImages,
      siteContent,
      hasContent: rooms > 0 || menuItems > 0 || galleryImages > 0,
    })
  } catch (error: any) {
    return NextResponse.json({
      rooms: 0, menuItems: 0, galleryImages: 0, siteContent: 0, hasContent: false,
    })
  }
}