'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, BedDouble, Users, Wind, Wifi, Tv, Snowflake, Refrigerator } from 'lucide-react'
import { useLanguage } from '@/lib/language'

export interface RoomType {
  id: string
  name: string
  nameSo: string
  price: number
  image: string
  description: string
  descriptionSo: string
  features: { icon: string; label: string }[]
  maxGuests: number
}

const FALLBACK_ROOMS: RoomType[] = [
  {
    id: 'standardSingle',
    name: 'Standard Single',
    nameSo: '',
    price: 25,
    image: '/images/room-1.jpg',
    description: 'A cozy room perfect for solo travelers looking for comfort and convenience.',
    descriptionSo: '',
    features: [
      { icon: 'BedDouble', label: 'Single Bed' },
      { icon: 'Check', label: 'Private Bathroom' },
      { icon: 'Wind', label: 'Fan' },
      { icon: 'Wifi', label: 'Free WiFi' },
    ],
    maxGuests: 1,
  },
  {
    id: 'standardDouble',
    name: 'Standard Double',
    nameSo: '',
    price: 40,
    image: '/images/room-2.jpg',
    description: 'Comfortable double room ideal for couples or friends traveling together.',
    descriptionSo: '',
    features: [
      { icon: 'BedDouble', label: 'Double Bed' },
      { icon: 'Check', label: 'Private Bathroom' },
      { icon: 'Wind', label: 'Fan' },
      { icon: 'Wifi', label: 'Free WiFi' },
    ],
    maxGuests: 2,
  },
  {
    id: 'family',
    name: 'Family Room',
    nameSo: '',
    price: 55,
    image: '/images/room-4.jpg',
    description: 'Spacious family room with extra bedding, perfect for small families.',
    descriptionSo: '',
    features: [
      { icon: 'Users', label: '1 Double + 1 Single Bed' },
      { icon: 'Check', label: 'Private Bathroom' },
      { icon: 'Snowflake', label: 'AC' },
      { icon: 'Wifi', label: 'Free WiFi' },
    ],
    maxGuests: 4,
  },
  {
    id: 'deluxe',
    name: 'Deluxe Room',
    nameSo: '',
    price: 70,
    image: '/images/room-5.jpg',
    description: 'Our premium room with all amenities for a truly comfortable stay.',
    descriptionSo: '',
    features: [
      { icon: 'BedDouble', label: 'King Bed' },
      { icon: 'Check', label: 'Private Bathroom' },
      { icon: 'Snowflake', label: 'AC' },
      { icon: 'Tv', label: 'TV' },
      { icon: 'Wifi', label: 'Free WiFi' },
      { icon: 'Refrigerator', label: 'Mini Fridge' },
    ],
    maxGuests: 2,
  },
]

const ICON_MAP: Record<string, any> = {
  BedDouble, Users, Wind, Wifi, Tv, Snowflake, Refrigerator, Check,
}

function getIcon(iconName: string) {
  const Comp = ICON_MAP[iconName] || Check
  return <Comp className="h-4 w-4" />
}

function mapDbRoom(r: any): RoomType {
  let features: { icon: string; label: string }[] = []
  try {
    const parsed = JSON.parse(r.features || '[]')
    if (Array.isArray(parsed)) features = parsed
  } catch {}
  return {
    id: r.id,
    name: r.name,
    nameSo: r.nameSo || '',
    price: r.price,
    image: r.image || '/images/room-1.jpg',
    description: r.description || '',
    descriptionSo: r.descriptionSo || '',
    features,
    maxGuests: r.maxGuests || 2,
  }
}

interface RoomCardProps {
  onBookRoom: (roomId: string, roomName: string) => void
}

export function RoomCard({ onBookRoom }: RoomCardProps) {
  const { t, lang } = useLanguage()
  const [rooms, setRooms] = useState<RoomType[]>(FALLBACK_ROOMS)

  useEffect(() => {
    fetch('/api/public/rooms')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data.map(mapDbRoom))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {rooms.map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden group hover:shadow-lg hover:shadow-[#C4A03C]/10 transition-all duration-300 border-[#1E1E24] bg-[#111114] py-0 gap-0">
            <div className="relative overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <Badge className="absolute top-3 right-3 bg-[#C4A03C] text-[#08080A] text-sm px-3 py-1 font-semibold">
                {room.price} ETB/night
              </Badge>
            </div>
            <CardContent className="p-5">
              <h3 className="text-xl font-bold text-white mb-2">
                {lang === 'so' && room.nameSo ? room.nameSo : room.name}
              </h3>
              <p className="text-[#A09890] text-sm mb-4">
                {lang === 'so' && room.descriptionSo ? room.descriptionSo : room.description}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {room.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[#B8B0A4]">
                    <span className="text-[#C4A03C]">{getIcon(feature.icon)}</span>
                    {feature.label}
                  </div>
                ))}
              </div>
              <Button
                onClick={() => onBookRoom(room.id, room.name)}
                className="w-full bg-[#C4A03C] hover:bg-[#D4B050] text-[#08080A] transition-colors font-semibold"
              >
                {t('rooms.bookThis')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export const rooms = FALLBACK_ROOMS
