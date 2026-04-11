'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'

type Language = 'en' | 'so'

interface LanguageContextType {
  lang: Language
  t: (key: string) => string
  toggleLanguage: () => void
}

export const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.rooms': 'Rooms',
    'nav.restaurant': 'Restaurant',
    'nav.gallery': 'Gallery',
    'nav.contact': 'Contact',
    'nav.bookNow': 'Book Now',
    'hero.title': 'Welcome to',
    'hero.brand': 'Gaboose',
    'hero.subtitle': 'Hotel',
    'hero.desc': 'Your Comfortable Stay in Kabridahar — Warm hospitality, clean rooms, and freshly made meals await you.',
    'hero.bookNow': 'Book Now',
    'hero.viewRooms': 'View Rooms',
    'hero.rooms': '15 Rooms',
    'hero.restaurant': 'Restaurant',
    'hero.alwaysOpen': 'Always Open',
    'about.badge': 'About Us',
    'about.title': 'A Warm Welcome Awaits',
    'about.desc': 'Gaboose Hotel and Restaurant is a cozy boutique hotel nestled in the heart of Kabridahar. We offer 15 comfortable rooms, a welcoming restaurant serving fresh Ethiopian and continental cuisine, and genuine Somali hospitality.',
    'about.rooms': 'Comfortable Rooms',
    'about.roomsDesc': 'Clean, well-maintained rooms with private bathrooms and free WiFi. From cozy singles to family-friendly spaces.',
    'about.breakfast': 'Fresh Breakfast',
    'about.breakfastDesc': 'Start your day with authentic Ethiopian breakfast or a full continental spread, made fresh every morning.',
    'about.atmosphere': 'Relaxed Atmosphere',
    'about.atmosphereDesc': 'Unwind in our comfortable restaurant and outdoor courtyard. A peaceful retreat after a day of travel.',
    'rooms.badge': 'Our Rooms',
    'rooms.title': 'Choose Your Perfect Room',
    'rooms.desc': 'We offer a variety of room types to suit every traveler\'s needs. All rooms come with clean linens, daily housekeeping, and friendly service.',
    'rooms.bookThis': 'Book This Room',
    'room.standardSingle': 'Standard Single',
    'room.standardSingleDesc': 'A cozy room perfect for solo travelers looking for comfort and convenience.',
    'room.standardDouble': 'Standard Double',
    'room.standardDoubleDesc': 'Comfortable double room ideal for couples or friends traveling together.',
    'room.family': 'Family Room',
    'room.familyDesc': 'Spacious family room with extra bedding, perfect for small families.',
    'room.deluxe': 'Deluxe Room',
    'room.deluxeDesc': 'Our premium room with all amenities for a truly comfortable stay.',
    'restaurant.badge': 'Restaurant',
    'restaurant.title': 'Savor the Flavor',
    'restaurant.desc': 'Our restaurant serves fresh, delicious meals throughout the day. Enjoy traditional Ethiopian dishes, continental breakfast, refreshing drinks, and the famous Ethiopian coffee ceremony.',
    'restaurant.name': 'Our Restaurant',
    'restaurant.open': 'Open daily — breakfast, lunch & dinner',
    'menu.breakfast': 'Breakfast Menu',
    'menu.breakfastDrinks': 'Breakfast & Drinks',
    'menu.ethiopianBreakfast': 'Ethiopian Breakfast',
    'menu.ethiopianBreakfastDesc': 'Injera with various traditional dishes',
    'menu.continental': 'Full Continental Breakfast',
    'menu.continentalDesc': 'Eggs, toast, juice, tea/coffee & fruits',
    'menu.lightBreakfast': 'Light Breakfast',
    'menu.lightBreakfastDesc': 'Bread, eggs, and tea or coffee',
    'menu.fruitPlatter': 'Fresh Fruit Platter',
    'menu.fruitPlatterDesc': 'Seasonal fresh fruits beautifully arranged',
    'menu.coffeeCeremony': 'Ethiopian Coffee Ceremony',
    'menu.coffeeCeremonyDesc': 'Traditional coffee ceremony experience',
    'menu.macchiato': 'Ethiopian Coffee (Macchiato)',
    'menu.tea': 'Tea (Shahi)',
    'menu.juice': 'Fresh Juice (Mango/Orange/Banana)',
    'menu.water': 'Bottled Water',
    'menu.softDrinks': 'Soft Drinks (Pepsi/Coca/Fanta)',
    'menu.sparkling': 'Sparkling Water',
    'gallery.badge': 'Gallery',
    'gallery.title': 'Take a Look Around',
    'gallery.desc': 'Browse through our hotel, rooms, and restaurant. Click any image to see it in full size.',
    'contact.badge': 'Contact',
    'contact.title': 'Get in Touch',
    'contact.desc': 'Have a question or want to make a reservation? Reach out to us — we\'d love to hear from you.',
    'contact.sendMsg': 'Send Us a Message',
    'contact.form.name': 'Full Name *',
    'contact.form.email': 'Email *',
    'contact.form.phone': 'Phone',
    'contact.form.message': 'Message *',
    'contact.form.send': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.info': 'Contact Information',
    'contact.address': 'Address',
    'contact.addressVal': 'Magaalo Cusub, Kabridahar\nSomali Region, Ethiopia',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.hours': 'Opening Hours',
    'contact.hoursVal': 'Always Open — 24/7',
    'contact.namePlaceholder': 'Your name',
    'contact.emailPlaceholder': 'you@email.com',
    'contact.phonePlaceholder': '+251...',
    'contact.messagePlaceholder': 'How can we help you?',
    'booking.title': 'Book Your Stay',
    'booking.desc': 'Fill in the details below to reserve your room at Gaboose Hotel.',
    'booking.name': 'Full Name *',
    'booking.namePlaceholder': 'Your full name',
    'booking.phone': 'Phone Number *',
    'booking.phonePlaceholder': '+251 9XX XXX XXX',
    'booking.room': 'Room Type *',
    'booking.selectRoom': 'Select a room type',
    'booking.checkin': 'Check-in *',
    'booking.checkout': 'Check-out *',
    'booking.guests': 'Number of Guests',
    'booking.notes': 'Special Requests',
    'booking.notesPlaceholder': 'Any special requests or notes...',
    'booking.total': 'Estimated Total',
    'booking.submit': 'Confirm Booking',
    'booking.submitting': 'Submitting...',
    'booking.night': 'night',
    'booking.nights': 'nights',
    'booking.guest': 'Guest',
    'booking.guestsCount': 'Guests',
    'booking.perNight': '/night',
    'footer.brand': 'GABOOSE HOTEL',
    'footer.desc': 'Your comfortable stay in Kabridahar. Warm hospitality, clean rooms, and freshly made meals.',
    'footer.quickLinks': 'Quick Links',
    'footer.contactUs': 'Contact Us',
    'footer.copyright': 'Gaboose Hotel and Restaurant. All rights reserved.',
    'footer.location': 'Magaalo Cusub, Kabridahar, Somali Region, Ethiopia',
    'toast.required': 'Please fill in all required fields',
    'toast.bookingSuccess': 'Booking submitted successfully! We will contact you shortly.',
    'toast.bookingFail': 'Failed to submit booking',
    'toast.contactSuccess': 'Message sent! We will get back to you soon.',
    'toast.contactFail': 'Failed to send message',
    'toast.networkError': 'Network error. Please try again.',
    'booking.success': 'Booking Submitted Successfully!',
    'booking.successDesc': 'Your booking ID is: {id}. Please proceed to payment to confirm your reservation.',
    'booking.proceedPayment': 'Proceed to Payment',
    'booking.payLater': 'Pay Later',
    'booking.bookingId': 'Booking ID',
  },
  so: {
    'nav.home': 'Bogga Hore',
    'nav.rooms': 'Qolalka',
    'nav.restaurant': 'Cuntada',
    'nav.gallery': 'Sawirada',
    'nav.contact': 'Naga La Xiriir',
    'nav.bookNow': 'Dalbo Hadda',
    'hero.title': 'Khusuusan',
    'hero.brand': 'Gaboose',
    'hero.subtitle': 'Hotel',
    'hero.desc': 'Deggaada Raaxada ah ee Kabridahar — Matashada qoto dheer, qolal daacan, iyo cuntada cusub idinku sugayo.',
    'hero.bookNow': 'Dalbo Hadda',
    'hero.viewRooms': 'Arag Qolalka',
    'hero.rooms': '15 Qol',
    'hero.restaurant': 'Cuntada',
    'hero.alwaysOpen': 'Weli Fur',
    'about.badge': 'Ku Saabsan',
    'about.title': 'Soo Dhawown Cagaaran Ah',
    'about.desc': 'Gaboose Hotel iyo Cuntada waa hotel yar oo ku yaala bartamaha Kabridahar. Waxaan bixinaa 15 qol oo raaxo badan, cuntoyin cusub oo Itoobiya iyo qoraal ah, iyo matasha Soomaaliyeed.',
    'about.rooms': 'Qolal Raaxo Badan',
    'about.roomsDesc': 'Qolal daacan oo nadiif ah oo leh musqul gaar ah iyo WiFi oo bilaash ah. Qolal yaryar ilaa qolal waalidku isticmaali karaan.',
    'about.breakfast': 'Quraacda Cusub',
    'about.breakfastDesc': 'Bilaow maalinta quraacda Itoobiyaaniga ah ama quraacda qoraaliga oo dhamaystiran, oo maalinta kasta cusub.',
    'about.atmosphere': 'Degmo Wanaagsan',
    'about.atmosphereDesc': 'Ka raaxaysow cuntagayaga iyo barxadda hoosteeda. Degmo nabadgeli ah ka dib maalinta safarka.',
    'rooms.badge': 'Qolalkayaga',
    'rooms.title': 'Dooro Qolkaaga',
    'rooms.desc': 'Waxaan bixinaa noocyeyn kala duwan oo qolal ah oo uu qabo si kastaba ha ahaatee. Dhammaan qolalka waxay leeyihiin dhar nadiif ah, xidhmada maalinta, iyo adeeg wanaagsan.',
    'rooms.bookThis': 'Dalbo Qolkan',
    'room.standardSingle': 'Qolka Qofkale',
    'room.standardSingleDesc': 'Qol yar oo raaxo badan oo loogu talagalay safarayaal qofkale ah.',
    'room.standardDouble': 'Qolka Labada Qof',
    'room.standardDoubleDesc': 'Qol laba qof oo raaxo badan oo loogu talagalay lammaane ama saaxiibbada safarka.',
    'room.family': 'Qolka Qoyska',
    'room.familyDesc': 'Qol ballaaran oo leh qol dheeraad ah, oo ku saabsan qoysyada yar.',
    'room.deluxe': 'Qolka Saadaalka ah',
    'room.deluxeDesc': 'Qolkeena ugu fiican oo leh dhammaan adeegyada si aad u raaxayso.',
    'restaurant.badge': 'Cuntada',
    'restaurant.title': 'Raaxay Cuntada',
    'restaurant.desc': 'Cuntagayagu waxay bixisaa cuntada cusub iyo macaan. Ku raaxaysow cuntada Itoobiyaanka, quraacda qoraaliga, cabitaan cusub, iyo seremoniyadda buniga Itoobiya ee caanka ah.',
    'restaurant.name': 'Cuntagayaga',
    'restaurant.open': 'Maalinta oo dhan waa furan — quraac, hurdada & qashinka',
    'menu.breakfast': 'Liiska Quraacda',
    'menu.breakfastDrinks': 'Quraac & Caanaha',
    'menu.ethiopianBreakfast': 'Quraacda Itoobiya',
    'menu.ethiopianBreakfastDesc': 'Injira oo la qoto booday oo dhaqameed ah',
    'menu.continental': 'Quraacda Badan',
    'menu.continentalDesc': 'Ulo, toos, jusi, shaah/bun & miro',
    'menu.lightBreakfast': 'Quraacda Yar',
    'menu.lightBreakfastDesc': 'Qooleey, ulo, iyo shaah ama bun',
    'menu.fruitPlatter': 'Tafaarirka Mirooyinka Cusub',
    'menu.fruitPlatterDesc': 'Mirooyinka xilliiga ah oo qurux badan',
    'menu.coffeeCeremony': 'Seremoniyadda Buniga Itoobiya',
    'menu.coffeeCeremonyDesc': 'Tajribada seremoniyadda buniga dhaqameedka',
    'menu.macchiato': 'Buniga Itoobiya (Macchiato)',
    'menu.tea': 'Shaah',
    'menu.juice': 'Jusi Cusub (Mango/Liin/Moos)',
    'menu.water': 'Biyo Aan Xirmooyinka Ka Bixin',
    'menu.softDrinks': 'Cabitaan (Pepsi/Coca/Fanta)',
    'menu.sparkling': 'Biyo Bubbles Gaar ah',
    'gallery.badge': 'Sawirada',
    'gallery.title': 'Fiiri Si Aad U Aragto',
    'gallery.desc': 'Fiiri si aad u aragto hotelkeena, qolalka, iyo cuntada. Taabo sawir kastaa si aad u arkid mid ka weyn.',
    'contact.badge': 'La Xiriir',
    'contact.title': 'Naga La Xiriir',
    'contact.desc': 'Su\'aal ama dalab qol ayaa leedahay? Nala soo xiriir — waan ku raaxayn doonaa.',
    'contact.sendMsg': 'Ii Dir Farriin',
    'contact.form.name': 'Magaca Buuxa *',
    'contact.form.email': 'Imayl *',
    'contact.form.phone': 'Taleefan',
    'contact.form.message': 'Farriin *',
    'contact.form.send': 'Dir Farriinta',
    'contact.form.sending': 'Diraya...',
    'contact.info': 'Macluumaadka La Xiriirka',
    'contact.address': 'Cinwaanka',
    'contact.addressVal': 'Magaalo Cusub, Kabridahar\nGobolka Soomaalida, Itoobiya',
    'contact.phone': 'Taleefan',
    'contact.email': 'Imayl',
    'contact.hours': 'Saacadaha Furitaanka',
    'contact.hoursVal': 'Weli Furan — 24/7',
    'contact.namePlaceholder': 'Magacaaga',
    'contact.emailPlaceholder': 'email@ku.com',
    'contact.phonePlaceholder': '+251...',
    'contact.messagePlaceholder': 'Sideen ku caawin karnaa?',
    'booking.title': 'Dalbo Deggaadaaga',
    'booking.desc': 'Buuxi macluumaadka hoose si aad u kaydiso qolkaaga Gaboose Hotel.',
    'booking.name': 'Magaca Buuxa *',
    'booking.namePlaceholder': 'Magacaaga oo buuxa',
    'booking.phone': 'Lambarka Taleefanka *',
    'booking.phonePlaceholder': '+251 9XX XXX XXX',
    'booking.room': 'Nooca Qolka *',
    'booking.selectRoom': 'Dooro nooca qolka',
    'booking.checkin': 'Gelitaan *',
    'booking.checkout': 'Baxitaan *',
    'booking.guests': 'Tirada Dadka',
    'booking.notes': 'Codsi Gaar ah',
    'booking.notesPlaceholder': 'Waxaad codsanaysaa ama faallo...',
    'booking.total': 'Wadarta Qiyaasteed',
    'booking.submit': 'Xaqiiji Dalabka',
    'booking.submitting': 'Diiwaangelin...',
    'booking.night': 'habeen',
    'booking.nights': 'habeenood',
    'booking.guest': 'qof',
    'booking.guestsCount': 'dad',
    'booking.perNight': '/habeen',
    'footer.brand': 'GABOOSE HOTEL',
    'footer.desc': 'Deggaada raaxada ah ee Kabridahar. Matashada qoto dheer, qolal daacan, iyo cuntada cusub.',
    'footer.quickLinks': 'La Xidhiidh Si Culus',
    'footer.contactUs': 'Nala Soo Xiriir',
    'footer.copyright': 'Gaboose Hotel iyo Cuntada. Xuquuqda dhammaan waa la ilaaliyaa.',
    'footer.location': 'Magaalo Cusub, Kabridahar, Gobolka Soomaalida, Itoobiya',
    'toast.required': 'Fadlan buuxi meelaha dhammaan loo baahan yahay',
    'toast.bookingSuccess': 'Dalabka wuu guuleystay! Waan ku soo laaban doonaa.',
    'toast.bookingFail': 'Dalabku waa fashilmay',
    'toast.contactSuccess': 'Farriintii way dirantay! Waan ku soo laaban doonaa.',
    'toast.contactFail': 'Dirista farriinta waa fashilmay',
    'toast.networkError': 'Khalad khadka. Fadlan isku day mar kale.',
    'booking.success': 'Dalabka Waa Lagu Diwaangelisay!',
    'booking.successDesc': 'Lambarka dalabkaaga waa: {id}. Fadlan sii wad lacag bixinta si aad u xaqiijiso dalabkaaga.',
    'booking.proceedPayment': 'Sii Wad Lacag Bixinta',
    'booking.payLater': 'Lacag Bixinta Dambe',
    'booking.bookingId': 'Lambarka Dalabka',
  },
}

// Section groupings for the translation editor
export const translationSections = [
  { id: 'nav', label: 'Navigation' },
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'menu', label: 'Menu' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
  { id: 'booking', label: 'Booking' },
  { id: 'footer', label: 'Footer' },
  { id: 'toast', label: 'Toast Messages' },
]

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en')
  const [customTranslations, setCustomTranslations] = useState<Record<string, string>>({})
  const customLoaded = useRef(false)

  // Fetch custom translations from database on mount
  useEffect(() => {
    if (customLoaded.current) return
    customLoaded.current = true

    async function fetchCustomTranslations() {
      try {
        const res = await fetch('/api/site-content/translations?prefix=lang.so.')
        if (res.ok) {
          const data: Array<{ key: string; value: string; valueSo: string }> = await res.json()
          const overrides: Record<string, string> = {}
          for (const item of data) {
            // key format: "lang.so.nav.home" -> translation key: "nav.home"
            if (item.key.startsWith('lang.so.')) {
              const transKey = item.key.slice('lang.so.'.length)
              if (item.valueSo) {
                overrides[transKey] = item.valueSo
              } else if (item.value) {
                overrides[transKey] = item.value
              }
            }
          }
          setCustomTranslations(overrides)
        }
      } catch {
        // Silently fail - use hardcoded translations
      }
    }
    fetchCustomTranslations()
  }, [])

  const t = useCallback((key: string): string => {
    if (lang === 'so') {
      // Check custom overrides first, then hardcoded
      return customTranslations[key] || translations[lang]?.[key] || translations['en']?.[key] || key
    }
    return translations[lang]?.[key] || translations['en']?.[key] || key
  }, [lang, customTranslations])

  const toggleLanguage = useCallback(() => {
    setLang(prev => prev === 'en' ? 'so' : 'en')
  }, [])

  // Update body class and html lang attribute when language changes
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    if (lang === 'so') {
      html.setAttribute('lang', 'so')
      body.classList.add('font-somali')
    } else {
      html.setAttribute('lang', 'en')
      body.classList.remove('font-somali')
    }
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
