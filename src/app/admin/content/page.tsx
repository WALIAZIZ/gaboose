'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Save, RefreshCw, FileText, Download, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

interface SiteContentItem {
  id: string
  key: string
  value: string
  valueSo: string
}

const contentSections = [
  { prefix: 'nav.', label: 'Navigation' },
  { prefix: 'hero.', label: 'Hero Section' },
  { prefix: 'about.', label: 'About Section' },
  { prefix: 'rooms.', label: 'Rooms Section' },
  { prefix: 'restaurant.', label: 'Restaurant Section' },
  { prefix: 'gallery.', label: 'Gallery Section' },
  { prefix: 'contact.', label: 'Contact Section' },
  { prefix: 'footer.', label: 'Footer' },
  { prefix: 'booking.', label: 'Booking' },
  { prefix: 'payment.', label: 'Payment' },
  { prefix: 'toast.', label: 'Toast Messages' },
  { prefix: 'menu.', label: 'Menu' },
]

// Import translations from language.tsx
// These match the keys in src/lib/language.tsx
const codeTranslations: Record<string, { en: string; so: string }> = {
  'nav.home': { en: 'Home', so: 'Bogga Hore' },
  'nav.rooms': { en: 'Rooms', so: 'Qolalka' },
  'nav.restaurant': { en: 'Restaurant', so: 'Cuntada' },
  'nav.gallery': { en: 'Gallery', so: 'Sawirada' },
  'nav.contact': { en: 'Contact', so: 'Naga La Xiriir' },
  'nav.bookNow': { en: 'Book Now', so: 'Dalbo Hadda' },
  'hero.title': { en: 'Welcome to', so: 'Khusuusan' },
  'hero.brand': { en: 'Gaboose', so: 'Gaboose' },
  'hero.subtitle': { en: 'Hotel', so: 'Hotel' },
  'hero.desc': { en: 'Your Comfortable Stay in Kabridahar — Warm hospitality, clean rooms, and freshly made meals await you.', so: 'Deggaada Raaxada ah ee Kabridahar — Matashada qoto dheer, qolal daacan, iyo cuntada cusub idinku sugayo.' },
  'hero.bookNow': { en: 'Book Now', so: 'Dalbo Hadda' },
  'hero.viewRooms': { en: 'View Rooms', so: 'Arag Qolalka' },
  'hero.rooms': { en: '15 Rooms', so: '15 Qol' },
  'hero.restaurant': { en: 'Restaurant', so: 'Cuntada' },
  'hero.alwaysOpen': { en: 'Always Open', so: 'Weli Fur' },
  'about.badge': { en: 'About Us', so: 'Ku Saabsan' },
  'about.title': { en: 'A Warm Welcome Awaits', so: 'Soo Dhawown Cagaaran Ah' },
  'about.desc': { en: 'Gaboose Hotel and Restaurant is a cozy boutique hotel nestled in the heart of Kabridahar. We offer 15 comfortable rooms, a welcoming restaurant serving fresh Ethiopian and continental cuisine, and genuine Somali hospitality.', so: 'Gaboose Hotel iyo Cuntada waa hotel yar oo ku yaala bartamaha Kabridahar. Waxaan bixinaa 15 qol oo raaxo badan, cuntoyin cusub oo Itoobiya iyo qoraal ah, iyo matasha Soomaaliyeed.' },
  'about.rooms': { en: 'Comfortable Rooms', so: 'Qolal Raaxo Badan' },
  'about.roomsDesc': { en: 'Clean, well-maintained rooms with private bathrooms and free WiFi. From cozy singles to family-friendly spaces.', so: 'Qolal daacan oo nadiif ah oo leh musqul gaar ah iyo WiFi oo bilaash ah. Qolal yaryar ilaa qolal waalidku isticmaali karaan.' },
  'about.breakfast': { en: 'Fresh Breakfast', so: 'Quraacda Cusub' },
  'about.breakfastDesc': { en: 'Start your day with authentic Ethiopian breakfast or a full continental spread, made fresh every morning.', so: 'Bilaow maalinta quraacda Itoobiyaaniga ah ama quraacda qoraaliga oo dhamaystiran, oo maalinta kasta cusub.' },
  'about.atmosphere': { en: 'Relaxed Atmosphere', so: 'Degmo Wanaagsan' },
  'about.atmosphereDesc': { en: 'Unwind in our comfortable restaurant and outdoor courtyard. A peaceful retreat after a day of travel.', so: 'Ka raaxaysow cuntagayaga iyo barxadda hoosteeda. Degmo nabadgeli ah ka dib maalinta safarka.' },
  'rooms.badge': { en: 'Our Rooms', so: 'Qolalkayaga' },
  'rooms.title': { en: 'Choose Your Perfect Room', so: 'Dooro Qolkaaga' },
  'rooms.desc': { en: "We offer a variety of room types to suit every traveler's needs. All rooms come with clean linens, daily housekeeping, and friendly service.", so: 'Waxaan bixinaa noocyeyn kala duwan oo qolal ah oo uu qabo si kastaba ha ahaatee. Dhammaan qolalka waxay leeyihiin dhar nadiif ah, xidhmada maalinta, iyo adeeg wanaagsan.' },
  'rooms.bookThis': { en: 'Book This Room', so: 'Dalbo Qolkan' },
  'room.standardSingle': { en: 'Standard Single', so: 'Qolka Qofkale' },
  'room.standardSingleDesc': { en: 'A cozy room perfect for solo travelers looking for comfort and convenience.', so: 'Qol yar oo raaxo badan oo loogu talagalay safarayaal qofkale ah.' },
  'room.standardDouble': { en: 'Standard Double', so: 'Qolka Labada Qof' },
  'room.standardDoubleDesc': { en: 'Comfortable double room ideal for couples or friends traveling together.', so: 'Qol laba qof oo raaxo badan oo loogu talagalay lammaane ama saaxiibbada safarka.' },
  'room.family': { en: 'Family Room', so: 'Qolka Qoyska' },
  'room.familyDesc': { en: 'Spacious family room with extra bedding, perfect for small families.', so: 'Qol ballaaran oo leh qol dheeraad ah, oo ku saabsan qoysyada yar.' },
  'room.deluxe': { en: 'Deluxe Room', so: 'Qolka Saadaalka ah' },
  'room.deluxeDesc': { en: 'Our premium room with all amenities for a truly comfortable stay.', so: 'Qolkeena ugu fiican oo leh dhammaan adeegyada si aad u raaxayso.' },
  'restaurant.badge': { en: 'Restaurant', so: 'Cuntada' },
  'restaurant.title': { en: 'Savor the Flavor', so: 'Raaxay Cuntada' },
  'restaurant.desc': { en: 'Our restaurant serves fresh, delicious meals throughout the day. Enjoy traditional Ethiopian dishes, continental breakfast, refreshing drinks, and the famous Ethiopian coffee ceremony.', so: 'Cuntagayagu waxay bixisaa cuntada cusub iyo macaan. Ku raaxaysow cuntada Itoobiyaanka, quraacda qoraaliga, cabitaan cusub, iyo seremoniyadda buniga Itoobiya ee caanka ah.' },
  'restaurant.name': { en: 'Our Restaurant', so: 'Cuntagayaga' },
  'restaurant.open': { en: 'Open daily — breakfast, lunch & dinner', so: 'Maalinta oo dhan waa furan — quraac, hurdada & qashinka' },
  'menu.breakfast': { en: 'Breakfast Menu', so: 'Liiska Quraacda' },
  'menu.breakfastDrinks': { en: 'Breakfast & Drinks', so: 'Quraac & Caanaha' },
  'menu.ethiopianBreakfast': { en: 'Ethiopian Breakfast', so: 'Quraacda Itoobiya' },
  'menu.ethiopianBreakfastDesc': { en: 'Injera with various traditional dishes', so: 'Injira oo la qoto booday oo dhaqameed ah' },
  'menu.continental': { en: 'Full Continental Breakfast', so: 'Quraacda Badan' },
  'menu.continentalDesc': { en: 'Eggs, toast, juice, tea/coffee & fruits', so: 'Ulo, toos, jusi, shaah/bun & miro' },
  'menu.lightBreakfast': { en: 'Light Breakfast', so: 'Quraacda Yar' },
  'menu.lightBreakfastDesc': { en: 'Bread, eggs, and tea or coffee', so: 'Qooleey, ulo, iyo shaah ama bun' },
  'menu.fruitPlatter': { en: 'Fresh Fruit Platter', so: 'Tafaarirka Mirooyinka Cusub' },
  'menu.fruitPlatterDesc': { en: 'Seasonal fresh fruits beautifully arranged', so: 'Mirooyinka xilliiga ah oo qurux badan' },
  'menu.coffeeCeremony': { en: 'Ethiopian Coffee Ceremony', so: 'Seremoniyadda Buniga Itoobiya' },
  'menu.coffeeCeremonyDesc': { en: 'Traditional coffee ceremony experience', so: 'Tajribada seremoniyadda buniga dhaqameedka' },
  'menu.macchiato': { en: 'Ethiopian Coffee (Macchiato)', so: 'Buniga Itoobiya (Macchiato)' },
  'menu.tea': { en: 'Tea (Shahi)', so: 'Shaah' },
  'menu.juice': { en: 'Fresh Juice (Mango/Orange/Banana)', so: 'Jusi Cusub (Mango/Liin/Moos)' },
  'menu.water': { en: 'Bottled Water', so: 'Biyo Aan Xirmooyinka Ka Bixin' },
  'menu.softDrinks': { en: 'Soft Drinks (Pepsi/Coca/Fanta)', so: 'Cabitaan (Pepsi/Coca/Fanta)' },
  'menu.sparkling': { en: 'Sparkling Water', so: 'Biyo Bubbles Gaar ah' },
  'gallery.badge': { en: 'Gallery', so: 'Sawirada' },
  'gallery.title': { en: 'Take a Look Around', so: 'Fiiri Si Aad U Aragto' },
  'gallery.desc': { en: 'Browse through our hotel, rooms, and restaurant. Click any image to see it in full size.', so: 'Fiiri si aad u aragto hotelkeena, qolalka, iyo cuntada. Taabo sawir kastaa si aad u arkid mid ka weyn.' },
  'contact.badge': { en: 'Contact', so: 'La Xiriir' },
  'contact.title': { en: 'Get in Touch', so: 'Naga La Xiriir' },
  'contact.desc': { en: "Have a question or want to make a reservation? Reach out to us — we'd love to hear from you.", so: "Su'aal ama dalab qol ayaa leedahay? Nala soo xiriir — waan ku raaxayn doonaa." },
  'contact.sendMsg': { en: 'Send Us a Message', so: 'Ii Dir Farriin' },
  'contact.form.name': { en: 'Full Name *', so: 'Magaca Buuxa *' },
  'contact.form.email': { en: 'Email *', so: 'Imayl *' },
  'contact.form.phone': { en: 'Phone', so: 'Taleefan' },
  'contact.form.message': { en: 'Message *', so: 'Farriin *' },
  'contact.form.send': { en: 'Send Message', so: 'Dir Farriinta' },
  'contact.form.sending': { en: 'Sending...', so: 'Diraya...' },
  'contact.info': { en: 'Contact Information', so: 'Macluumaadka La Xiriirka' },
  'contact.address': { en: 'Address', so: 'Cinwaanka' },
  'contact.addressVal': { en: 'Magaalo Cusub, Kabridahar\nSomali Region, Ethiopia', so: 'Magaalo Cusub, Kabridahar\nGobolka Soomaalida, Itoobiya' },
  'contact.phone': { en: 'Phone', so: 'Taleefan' },
  'contact.email': { en: 'Email', so: 'Imayl' },
  'contact.hours': { en: 'Opening Hours', so: 'Saacadaha Furitaanka' },
  'contact.hoursVal': { en: 'Always Open — 24/7', so: 'Weli Furan — 24/7' },
  'contact.namePlaceholder': { en: 'Your name', so: 'Magacaaga' },
  'contact.emailPlaceholder': { en: 'you@email.com', so: 'email@ku.com' },
  'contact.phonePlaceholder': { en: '+251...', so: '+251...' },
  'contact.messagePlaceholder': { en: 'How can we help you?', so: 'Sideen ku caawin karnaa?' },
  'booking.title': { en: 'Book Your Stay', so: 'Dalbo Deggaadaaga' },
  'booking.desc': { en: 'Fill in the details below to reserve your room at Gaboose Hotel.', so: 'Buuxi macluumaadka hoose si aad u kaydiso qolkaaga Gaboose Hotel.' },
  'booking.name': { en: 'Full Name *', so: 'Magaca Buuxa *' },
  'booking.namePlaceholder': { en: 'Your full name', so: 'Magacaaga oo buuxa' },
  'booking.phone': { en: 'Phone Number *', so: 'Lambarka Taleefanka *' },
  'booking.phonePlaceholder': { en: '+251 9XX XXX XXX', so: '+251 9XX XXX XXX' },
  'booking.room': { en: 'Room Type *', so: 'Nooca Qolka *' },
  'booking.selectRoom': { en: 'Select a room type', so: 'Dooro nooca qolka' },
  'booking.checkin': { en: 'Check-in *', so: 'Gelitaan *' },
  'booking.checkout': { en: 'Check-out *', so: 'Baxitaan *' },
  'booking.guests': { en: 'Number of Guests', so: 'Tirada Dadka' },
  'booking.notes': { en: 'Special Requests', so: 'Codsi Gaar ah' },
  'booking.notesPlaceholder': { en: 'Any special requests or notes...', so: 'Waxaad codsanaysaa ama faallo...' },
  'booking.total': { en: 'Estimated Total', so: 'Wadarta Qiyaasteed' },
  'booking.submit': { en: 'Confirm Booking', so: 'Xaqiiji Dalabka' },
  'booking.submitting': { en: 'Submitting...', so: 'Diiwaangelin...' },
  'booking.night': { en: 'night', so: 'habeen' },
  'booking.nights': { en: 'nights', so: 'habeenood' },
  'booking.guest': { en: 'Guest', so: 'qof' },
  'booking.guestsCount': { en: 'Guests', so: 'dad' },
  'booking.perNight': { en: '/night', so: '/habeen' },
  'booking.success': { en: 'Booking Submitted Successfully!', so: 'Dalabka Waa Lagu Diwaangelisay!' },
  'booking.successDesc': { en: 'Your booking ID is: {id}. Please proceed to payment to confirm your reservation.', so: 'Lambarka dalabkaaga waa: {id}. Fadlan sii wad lacag bixinta si aad u xaqiijiso dalabkaaga.' },
  'booking.proceedPayment': { en: 'Proceed to Payment', so: 'Sii Wad Lacag Bixinta' },
  'booking.payLater': { en: 'Pay Later', so: 'Lacag Bixinta Dambe' },
  'booking.bookingId': { en: 'Booking ID', so: 'Lambarka Dalabka' },
  'footer.brand': { en: 'GABOOSE HOTEL', so: 'GABOOSE HOTEL' },
  'footer.desc': { en: 'Your comfortable stay in Kabridahar. Warm hospitality, clean rooms, and freshly made meals.', so: 'Deggaada raaxada ah ee Kabridahar. Matashada qoto dheer, qolal daacan, iyo cuntada cusub.' },
  'footer.quickLinks': { en: 'Quick Links', so: 'La Xidhiidh Si Culus' },
  'footer.contactUs': { en: 'Contact Us', so: 'Nala Soo Xiriir' },
  'footer.copyright': { en: 'Gaboose Hotel and Restaurant. All rights reserved.', so: 'Gaboose Hotel iyo Cuntada. Xuquuqda dhammaan waa la ilaaliyaa.' },
  'footer.location': { en: 'Magaalo Cusub, Kabridahar, Somali Region, Ethiopia', so: 'Magaalo Cusub, Kabridahar, Gobolka Soomaalida, Itoobiya' },
  'toast.required': { en: 'Please fill in all required fields', so: 'Fadlan buuxi meelaha dhammaan loo baahan yahay' },
  'toast.bookingSuccess': { en: 'Booking submitted successfully! We will contact you shortly.', so: 'Dalabka wuu guuleystay! Waan ku soo laaban doonaa.' },
  'toast.bookingFail': { en: 'Failed to submit booking', so: 'Dalabku waa fashilmay' },
  'toast.contactSuccess': { en: 'Message sent! We will get back to you soon.', so: 'Farriintii way dirantay! Waan ku soo laaban doonaa.' },
  'toast.contactFail': { en: 'Failed to send message', so: 'Dirista farriinta waa fashilmay' },
  'toast.networkError': { en: 'Network error. Please try again.', so: 'Khalad khadka. Fadlan isku day mar kale.' },
}

export default function ContentPage() {
  const [contents, setContents] = useState<SiteContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [edited, setEdited] = useState<Record<string, { value: string; valueSo: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/content')
      if (res.ok) setContents(await res.json())
    } catch { toast.error('Failed to fetch content') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchContents() }, [fetchContents])

  function getGroupedContents() {
    const groups: Record<string, SiteContentItem[]> = {}
    for (const section of contentSections) {
      const items = contents.filter((c) => c.key.startsWith(section.prefix))
      if (items.length > 0) groups[section.label] = items
    }
    // Items not matching any section
    const matched = contents.filter((c) => contentSections.some((s) => c.key.startsWith(s.prefix)))
    const others = contents.filter((c) => !matched.includes(c))
    if (others.length > 0) groups['Other'] = others
    return groups
  }

  async function saveContent(key: string) {
    const data = edited[key]
    if (!data) return
    setSaving(key)
    try {
      const res = await adminFetch('/api/admin/content', {
        method: 'PUT',
        body: JSON.stringify({ key, value: data.value, valueSo: data.valueSo }),
      })
      if (res.ok) {
        toast.success('Saved')
        const newEdited = { ...edited }
        delete newEdited[key]
        setEdited(newEdited)
        fetchContents()
      }
    } catch { toast.error('Failed to save') }
    finally { setSaving(null) }
  }

  async function syncFromCode() {
    setSyncing(true)
    try {
      let count = 0
      for (const [key, translation] of Object.entries(codeTranslations)) {
        const res = await adminFetch('/api/admin/content', {
          method: 'PUT',
          body: JSON.stringify({ key, value: translation.en, valueSo: translation.so }),
        })
        if (res.ok) count++
      }
      toast.success(`Synced ${count} translations from code`)
      setShowSyncDialog(false)
      fetchContents()
    } catch {
      toast.error('Failed to sync translations')
    } finally {
      setSyncing(false)
    }
  }

  const grouped = getGroupedContents()
  const totalTranslations = Object.keys(codeTranslations).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Site Content</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>
            Edit translations and content for the website ({contents.length} entries in database, {totalTranslations} available in code)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSyncDialog(true)}
            style={{ borderColor: '#C4A03C', color: '#C4A03C' }}
          >
            <Download className="w-4 h-4 mr-2" /> Sync from Code
          </Button>
          <Button variant="outline" size="sm" onClick={fetchContents} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>Sync Translations from Code</DialogTitle>
            <DialogDescription style={{ color: '#A09890' }}>
              This will import all {totalTranslations} translation keys from the source code into the database.
              Existing translations in the database will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
              <p className="text-sm" style={{ color: '#A09890' }}>
                This will sync the following sections:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {contentSections.map(s => (
                  <Badge key={s.prefix} className="text-[10px]" style={{ backgroundColor: 'rgba(196,160,60,0.12)', color: '#C4A03C' }}>
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={syncFromCode} disabled={syncing} className="flex-1" style={{ backgroundColor: '#C4A03C', color: '#000' }}>
                {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                {syncing ? 'Syncing...' : `Sync ${totalTranslations} Keys`}
              </Button>
              <Button variant="outline" onClick={() => setShowSyncDialog(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" style={{ backgroundColor: '#111114' }} />)}
        </div>
      ) : contents.length === 0 ? (
        <Card style={cardStyle}>
          <CardContent className="text-center py-16" style={{ color: '#A09890' }}>
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No site content in database yet.</p>
            <p className="text-sm mt-2">Click &quot;Sync from Code&quot; to import all translations from the source code.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([section, items]) => (
          <Card key={section} style={cardStyle}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold" style={{ color: '#C4A03C' }}>{section}</CardTitle>
                <Badge className="text-[10px]" style={{ backgroundColor: '#1E1E24', color: '#A09890' }}>
                  {items.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const isEdited = !!edited[item.key]
                const current = edited[item.key] || { value: item.value, valueSo: item.valueSo }
                return (
                  <div key={item.id} className="space-y-2 p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-mono" style={{ color: '#C4A03C' }}>{item.key}</Label>
                      {isEdited && (
                        <Button size="sm" onClick={() => saveContent(item.key)} disabled={saving === item.key}
                          style={{ backgroundColor: '#C4A03C', color: '#000' }} className="h-7 px-3 text-xs">
                          {saving === item.key ? 'Saving...' : <><Save className="w-3 h-3 mr-1" /> Save</>}
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase" style={{ color: '#A09890' }}>English</p>
                        <Textarea
                          value={current.value}
                          onChange={(e) => setEdited({ ...edited, [item.key]: { ...current, value: e.target.value } })}
                          className="text-sm min-h-[60px]"
                          style={{ backgroundColor: '#111114', borderColor: '#1E1E24', color: '#fff' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase" style={{ color: '#A09890' }}>Somali</p>
                        <Textarea
                          value={current.valueSo}
                          onChange={(e) => setEdited({ ...edited, [item.key]: { ...current, valueSo: e.target.value } })}
                          className="text-sm min-h-[60px]"
                          style={{ backgroundColor: '#111114', borderColor: '#1E1E24', color: '#fff' }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
