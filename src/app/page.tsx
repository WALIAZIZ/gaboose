'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

import {
  Phone,
  Mail,
  MapPin,
  Clock,
  BedDouble,
  Coffee,
  Armchair,
  Menu,
  Star,
  Check,
  Calendar,
  Loader2,
  Instagram,
  Facebook,
  ChevronUp,
  Globe,
} from 'lucide-react'

import { useLanguage } from '@/lib/language'
import { RoomCard } from '@/components/room-card'
import { GalleryLightbox } from '@/components/gallery-lightbox'
import { BookingDialog } from '@/components/booking-dialog'

// ============================================================
// Navigation Links
// ============================================================
const navLinks = [
  { labelKey: 'nav.home', href: '#home' },
  { labelKey: 'nav.rooms', href: '#rooms' },
  { labelKey: 'nav.restaurant', href: '#restaurant' },
  { labelKey: 'nav.gallery', href: '#gallery' },
  { labelKey: 'nav.contact', href: '#contact' },
]

// ============================================================
// Fade-in section wrapper
// ============================================================
function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================================
// Main Page Component
// ============================================================
export default function Home() {
  const { t, lang, toggleLanguage } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [preselectedRoom, setPreselectedRoom] = useState<{ id: string; name: string } | undefined>(undefined)
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  // Dynamic site settings from admin API
  const [menuItems, setMenuItems] = useState<{breakfast: any[], drinks: any[]}>({breakfast: [], drinks: []})
  const [siteConfig, setSiteConfig] = useState({
    phone: '+251 91 521 0607',
    email: 'gaboose-hotel1@hotmail.com',
    heroImage: '/images/hotel-5.jpg',
    restaurantImage: '/images/restaurant-real.jpg',
  })



  useEffect(() => {
    fetch('/api/public/menu')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems({
            breakfast: data.filter((i: any) => i.category === 'breakfast'),
            drinks: data.filter((i: any) => i.category === 'drinks'),
          })
        }
      })
      .catch(() => {})
  }, [])

  // Scroll listener for navbar and back-to-top
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      setShowBackToTop(window.scrollY > 600)

      // Determine active section
      const sections = navLinks.map((l) => l.href.slice(1))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleBookRoom = (roomId: string, roomName: string) => {
    setPreselectedRoom({ id: roomId, name: roomName })
    setBookingOpen(true)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error(t('toast.required'))
      return
    }

    setContactSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(t('toast.contactSuccess'))
        setContactForm({ name: '', email: '', phone: '', message: '' })
      } else {
        toast.error(t('toast.contactFail'))
      }
    } catch {
      toast.error(t('toast.networkError'))
    } finally {
      setContactSubmitting(false)
    }
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      {/* ======================== NAVIGATION ======================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[var(--color-primary)]/20 nav-scrolled-shadow'
            : 'bg-transparent'
        }`}
        style={scrolled ? { backgroundColor: 'var(--color-nav-scrolled)', backdropFilter: 'blur(12px)' } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('#home')}
              className="flex items-center gap-2"
            >
              <span
                className={`text-xl lg:text-2xl font-extrabold tracking-[0.25em] transition-colors ${
                  scrolled ? 'text-[var(--color-primary)]' : 'text-[var(--color-hero-text)]'
                }`}
              >
                GABOOSE
              </span>
              <span
                className={`text-xs lg:text-sm font-light tracking-[0.3em] uppercase transition-colors ${
                  scrolled ? 'text-[var(--color-primary)]/70' : 'text-[var(--color-primary)]'
                }`}
              >
                HOTEL
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeSection === link.href.slice(1)
                      ? scrolled
                        ? 'bg-[var(--color-primary)] text-[var(--color-bg-main)]'
                        : 'bg-white/20 text-[var(--color-hero-text)]'
                      : scrolled
                        ? 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t(link.labelKey)}
                </button>
              ))}
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="ml-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
              >
                <Globe className="h-4 w-4 inline mr-1" />
                {lang === 'en' ? 'SO' : 'EN'}
              </button>
              <Button
                onClick={() => setBookingOpen(true)}
                className="ml-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-bg-main)] rounded-full px-5 font-semibold"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-1.5" />
                {t('nav.bookNow')}
              </Button>
            </nav>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      scrolled
                        ? 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                        : 'text-[var(--color-hero-text)] hover:bg-white/10'
                    }`}
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-[var(--color-bg-card)] border-[var(--color-primary)]/20">
                  <SheetHeader>
                    <SheetTitle className="text-[var(--color-primary)] text-lg">
                      GABOOSE HOTEL
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="flex items-center px-4 py-3 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] font-medium transition-colors text-left"
                        >
                          {t(link.labelKey)}
                        </button>
                      </SheetClose>
                    ))}
                    <Separator className="my-2 bg-[var(--color-border)]" />
                    {/* Mobile Language Toggle */}
                    <SheetClose asChild>
                      <button
                        onClick={toggleLanguage}
                        className="mx-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                      >
                        <Globe className="h-4 w-4" />
                        {lang === 'en' ? 'SO' : 'EN'}
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        onClick={() => setBookingOpen(true)}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-bg-main)] mx-4 font-semibold"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('nav.bookNow')}
                      </Button>
                    </SheetClose>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* ======================== HERO SECTION ======================== */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={siteConfig.heroImage}
            alt="Gaboose Hotel Exterior"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-overlay-gradient" style={{ background: 'linear-gradient(to bottom, var(--color-hero-gradient-from), var(--color-hero-gradient-via), var(--color-hero-gradient-to))' }} />
        </div>

        {/* Content */}
        <div className={`relative z-10 max-w-4xl mx-auto px-4 text-center ${lang === 'so' ? 'hero-somali-fix' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={`text-5xl sm:text-6xl md:text-8xl font-extrabold mb-4 leading-[1.05] tracking-tight ${lang === 'so' ? 'sm:text-4xl md:text-6xl lg:text-7xl' : ''}`} style={{ color: 'var(--color-hero-text)' }}>
              {t('hero.title')}{' '}
              <span className="text-[var(--color-primary)]">{t('hero.brand')}</span>{' '}
              {t('hero.subtitle')}
            </h1>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto font-light leading-relaxed" style={{ color: 'var(--color-hero-text-sub)' }}>
              {t('hero.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setBookingOpen(true)}
                size="lg"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-bg-main)] text-base px-8 py-6 rounded-full font-semibold"
                style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
              >
                <Calendar className="h-5 w-5 mr-2" />
                {t('hero.bookNow')}
              </Button>
              <Button
                onClick={() => scrollToSection('#rooms')}
                variant="outline"
                size="lg"
                className="border-[var(--color-primary)]/60 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg-main)] hover:border-[var(--color-primary)] text-base px-8 py-6 rounded-full backdrop-blur-sm transition-all duration-300 font-semibold"
              >
                {t('hero.viewRooms')}
              </Button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {[
                { icon: <BedDouble className="h-5 w-5" />, text: t('hero.rooms') },
                { icon: <Star className="h-5 w-5" />, text: t('hero.restaurant') },
                { icon: <Clock className="h-5 w-5" />, text: t('hero.alwaysOpen') },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--color-hero-text-icon)' }}
                >
                  <span className="text-[var(--color-primary)]">{item.icon}</span>
                  <span style={{ color: 'var(--color-hero-text-stat)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ======================== ABOUT SECTION ======================== */}
      <section className="py-20 lg:py-28 bg-[var(--color-bg-section)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <Badge className="bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30 mb-4">{t('about.badge')}</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {t('about.title')}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                {t('about.desc')}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BedDouble className="h-8 w-8" />,
                title: t('about.rooms'),
                description: t('about.roomsDesc'),
              },
              {
                icon: <Coffee className="h-8 w-8" />,
                title: t('about.breakfast'),
                description: t('about.breakfastDesc'),
              },
              {
                icon: <Armchair className="h-8 w-8" />,
                title: t('about.atmosphere'),
                description: t('about.atmosphereDesc'),
              },
            ].map((feature, index) => (
              <FadeInSection key={feature.title} delay={index * 0.15}>
                <Card className="text-center border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all duration-300 py-0 gap-0 h-full" style={{ '--tw-shadow-color': 'var(--color-primary)' } as React.CSSProperties}>
                  <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center mb-4 text-[var(--color-primary)]">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== ROOMS SECTION ======================== */}
      <section id="rooms" className="py-20 lg:py-28 bg-[var(--color-bg-main)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <Badge className="bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30 mb-4">{t('rooms.badge')}</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {t('rooms.title')}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                {t('rooms.desc')}
              </p>
            </div>
          </FadeInSection>

          <RoomCard onBookRoom={handleBookRoom} />
        </div>
      </section>

      {/* ======================== RESTAURANT SECTION ======================== */}
      <section id="restaurant" className="py-20 lg:py-28 bg-[var(--color-bg-section)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <Badge className="bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30 mb-4">
                <Coffee className="h-3 w-3 mr-1" />
                {t('restaurant.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {t('restaurant.title')}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                {t('restaurant.desc')}
              </p>
            </div>
          </FadeInSection>

          {/* Restaurant Image */}
          <FadeInSection>
            <div className="relative rounded-2xl overflow-hidden mb-12 shadow-xl shadow-black/40">
              <div className="aspect-[16/7] relative">
                <Image
                  src={siteConfig.restaurantImage}
                  alt="Gaboose Hotel Restaurant"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6" style={{ color: 'var(--color-hero-text)' }}>
                  <h3 className="text-2xl font-bold">{t('restaurant.name')}</h3>
                  <p className="opacity-70">{t('restaurant.open')}</p>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Menu Tabs */}
          <FadeInSection>
            <Tabs defaultValue="breakfast" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-[var(--color-bg-card)] p-1 rounded-lg h-auto border border-[var(--color-border)]">
                <TabsTrigger
                  value="breakfast"
                  className="py-3 text-base font-medium data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-bg-main)] rounded-md text-[var(--color-text-secondary)] data-[state=inactive]:hover:text-[var(--color-text-primary)]"
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  {t('menu.breakfast')}
                </TabsTrigger>
                <TabsTrigger
                  value="drinks"
                  className="py-3 text-base font-medium data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-bg-main)] rounded-md text-[var(--color-text-secondary)] data-[state=inactive]:hover:text-[var(--color-text-primary)]"
                >
                  {t('menu.breakfastDrinks')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="breakfast">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="/images/breakfast.png"
                        alt="Breakfast Spread"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {menuItems.breakfast.length > 0 ? menuItems.breakfast.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start p-4 bg-[var(--color-bg-card)] rounded-lg hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] transition-colors"
                      >
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{lang === 'so' && item.nameSo ? item.nameSo : item.name}</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">{lang === 'so' && item.descriptionSo ? item.descriptionSo : item.description}</p>
                        </div>
                        <Badge className="bg-[var(--color-primary)] text-[var(--color-bg-main)] shrink-0 ml-3 font-semibold">
                          {item.price} ETB
                        </Badge>
                      </div>
                    )) : [
                      { name: t('menu.ethiopianBreakfast'), desc: t('menu.ethiopianBreakfastDesc'), price: '8 ETB' },
                      { name: t('menu.continental'), desc: t('menu.continentalDesc'), price: '10 ETB' },
                      { name: t('menu.lightBreakfast'), desc: t('menu.lightBreakfastDesc'), price: '5 ETB' },
                      { name: t('menu.fruitPlatter'), desc: t('menu.fruitPlatterDesc'), price: '4 ETB' },
                      { name: t('menu.coffeeCeremony'), desc: t('menu.coffeeCeremonyDesc'), price: '3 ETB' },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-start p-4 bg-[var(--color-bg-card)] rounded-lg hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] transition-colors"
                      >
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.name}</h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
                        </div>
                        <Badge className="bg-[var(--color-primary)] text-[var(--color-bg-main)] shrink-0 ml-3 font-semibold">
                          {item.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="drinks">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="/images/drinks.png"
                        alt="Drinks"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {menuItems.drinks.length > 0 ? menuItems.drinks.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-4 bg-[var(--color-bg-card)] rounded-lg hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{lang === 'so' && item.nameSo ? item.nameSo : item.name}</span>
                        </div>
                        <Badge className="bg-[var(--color-primary)] text-[var(--color-bg-main)] shrink-0 ml-3 font-semibold">
                          {item.price} ETB
                        </Badge>
                      </div>
                    )) : [
                      { name: t('menu.macchiato'), price: '2 ETB' },
                      { name: t('menu.tea'), price: '1.50 ETB' },
                      { name: t('menu.juice'), price: '3 ETB' },
                      { name: t('menu.water'), price: '0.50 ETB' },
                      { name: t('menu.softDrinks'), price: '1 ETB' },
                      { name: t('menu.sparkling'), price: '1.50 ETB' },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center p-4 bg-[var(--color-bg-card)] rounded-lg hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                        </div>
                        <Badge className="bg-[var(--color-primary)] text-[var(--color-bg-main)] shrink-0 ml-3 font-semibold">
                          {item.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </FadeInSection>
        </div>
      </section>

      {/* ======================== GALLERY SECTION ======================== */}
      <section id="gallery" className="py-20 lg:py-28 bg-[var(--color-bg-main)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <Badge className="bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30 mb-4">{t('gallery.badge')}</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {t('gallery.title')}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                {t('gallery.desc')}
              </p>
            </div>
          </FadeInSection>

          <GalleryLightbox />
        </div>
      </section>

      {/* ======================== CONTACT SECTION ======================== */}
      <section id="contact" className="py-20 lg:py-28 bg-[var(--color-bg-section)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <Badge className="bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30 mb-4">{t('contact.badge')}</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {t('contact.title')}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                {t('contact.desc')}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <FadeInSection>
              <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] py-0 gap-0">
                <CardContent className="p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-6">{t('contact.sendMsg')}</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="contact-name" className="text-[var(--color-text-muted)]">{t('contact.form.name')}</Label>
                      <Input
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder={t('contact.namePlaceholder')}
                        required
                        className="mt-1 bg-[var(--color-bg-input)] border-[var(--color-border)] placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)]/50"
                        style={{ color: 'var(--color-text-primary)' }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-email" className="text-[var(--color-text-muted)]">{t('contact.form.email')}</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm((p) => ({ ...p, email: e.target.value }))
                          }
                          placeholder={t('contact.emailPlaceholder')}
                          required
                          className="mt-1 bg-[var(--color-bg-input)] border-[var(--color-border)] placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)]/50"
                          style={{ color: 'var(--color-text-primary)' }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-phone" className="text-[var(--color-text-muted)]">{t('contact.form.phone')}</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) =>
                            setContactForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          placeholder={t('contact.phonePlaceholder')}
                          className="mt-1 bg-[var(--color-bg-input)] border-[var(--color-border)] placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)]/50"
                          style={{ color: 'var(--color-text-primary)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contact-message" className="text-[var(--color-text-muted)]">{t('contact.form.message')}</Label>
                      <Textarea
                        id="contact-message"
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm((p) => ({ ...p, message: e.target.value }))
                        }
                        placeholder={t('contact.messagePlaceholder')}
                        required
                        className="mt-1 bg-[var(--color-bg-input)] border-[var(--color-border)] placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)]/50"
                        rows={5}
                        style={{ color: 'var(--color-text-primary)' }}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-bg-main)] py-5 font-semibold"
                      disabled={contactSubmitting}
                    >
                      {contactSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t('contact.form.sending')}
                        </>
                      ) : (
                        t('contact.form.send')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </FadeInSection>

            {/* Contact Info + Map */}
            <FadeInSection delay={0.15}>
              <div className="space-y-6">
                {/* Contact Details */}
                <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] py-0 gap-0">
                  <CardContent className="p-6 lg:p-8 space-y-5">
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{t('contact.info')}</h3>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('contact.address')}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
                          {t('contact.addressVal')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('contact.phone')}</p>
                        <a
                          href={"tel:" + siteConfig.phone.replace(/\s/g, "")}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          {siteConfig.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('contact.email')}</p>
                        <a
                          href={"mailto:" + siteConfig.email}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          {siteConfig.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('contact.hours')}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{t('contact.hoursVal')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Maps */}
                <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden py-0 gap-0">
                  <div className="aspect-video w-full">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.0!2d44.2813788!3d6.7318303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s6.7318303%2C44.2813788!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Gaboose Hotel Location"
                    />
                  </div>
                </Card>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ======================== FOOTER ======================== */}
      <footer className="bg-[var(--color-footer)] border-t border-[var(--color-bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2 tracking-[0.2em]">{t('footer.brand')}</h3>
              <p className="text-sm footer-text-muted leading-relaxed" style={{ color: 'var(--color-footer-text)' }}>
                {t('footer.desc')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-hero-text)' }}>{t('footer.quickLinks')}</h4>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm footer-text-muted hover:text-[var(--color-primary)] transition-colors text-left"
                    style={{ color: 'var(--color-footer-text)' }}
                  >
                    {t(link.labelKey)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-hero-text)' }}>{t('footer.contactUs')}</h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-footer-text)' }}>
                <a
                  href={"tel:" + siteConfig.phone.replace(/\s/g, "")}
                  className="flex items-center gap-2 hover:text-[var(--color-primary)] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {siteConfig.phone}
                </a>
                <a
                  href={"mailto:" + siteConfig.email}
                  className="flex items-center gap-2 hover:text-[var(--color-primary)] transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {siteConfig.email}
                </a>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Kabridahar, Ethiopia
                </div>
              </div>

              {/* Social */}
              <div className="flex gap-3 mt-5">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] flex items-center justify-center transition-all hover:text-[var(--color-social-hover-text)]"
                  style={{ color: 'var(--color-social-text)' }}
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] flex items-center justify-center transition-all hover:text-[var(--color-social-hover-text)]"
                  style={{ color: 'var(--color-social-text)' }}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-[var(--color-bg-card)]" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm footer-text-muted" style={{ color: 'var(--color-footer-text)', opacity: 0.6 }}>
            <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
            <p>{t('footer.location')}</p>
          </div>
        </div>
      </footer>

      {/* ======================== BOOKING DIALOG ======================== */}
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        preselectedRoomId={preselectedRoom?.id}
        preselectedRoomName={preselectedRoom?.name}
      />

      {/* ======================== BACK TO TOP ======================== */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-bg-main)] flex items-center justify-center transition-colors btn-back-to-top"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}
