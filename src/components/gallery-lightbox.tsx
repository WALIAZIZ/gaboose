'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const galleryImages = [
  { src: '/images/hotel-1.jpg', alt: 'Gaboose Hotel Entrance' },
  { src: '/images/hotel-2.jpg', alt: 'Hotel Interior' },
  { src: '/images/hotel-3.jpg', alt: 'Hotel Lobby' },
  { src: '/images/hotel-4.jpg', alt: 'Hotel Courtyard' },
  { src: '/images/hotel-5.jpg', alt: 'Hotel Exterior View' },
  { src: '/images/hotel-6.jpg', alt: 'Hotel Building' },
  { src: '/images/room-3.jpg', alt: 'Standard Room' },
  { src: '/images/room-1.jpg', alt: 'Guest Room' },
  { src: '/images/room-4.jpg', alt: 'Family Room' },
]

export function GalleryLightbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryImages.map((image, index) => (
          <motion.div
            key={image.src}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer overflow-hidden rounded-xl border border-[#1E1E24]"
            onClick={() => openLightbox(index)}
          >
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium text-white">{image.alt}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#08080A] border-[#1E1E24] sm:max-w-4xl">
          <DialogTitle className="sr-only">
            {galleryImages[currentIndex]?.alt}
          </DialogTitle>
          <div className="relative">
            <div className="relative w-full aspect-video">
              <Image
                src={galleryImages[currentIndex]?.src}
                alt={galleryImages[currentIndex]?.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/60 inline-block px-3 py-1 rounded-full">
                {galleryImages[currentIndex]?.alt}
              </p>
            </div>
            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#C4A03C] hover:text-[#08080A] text-white rounded-full p-2 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#C4A03C] hover:text-[#08080A] text-white rounded-full p-2 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
