'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Building2, Calendar, Users, Phone, CreditCard, Camera,
  Upload, CheckCircle2, Loader2, Globe, ArrowLeft, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/lib/language'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

export default function BookingConfirmationPage() {
  const { t, lang } = useLanguage()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentSettings, setPaymentSettings] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    senderName: '',
    amount: '',
    accountName: '',
    notes: '',
  })

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data)
        if (data.totalAmount) {
          setFormData(prev => ({ ...prev, amount: String(data.totalAmount) }))
        }
      } else {
        toast.error('Booking not found')
      }
    } catch {
      toast.error('Failed to fetch booking')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  const fetchPaymentSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/site-content/payment')
      if (res.ok) {
        const data = await res.json()
        const settings: Record<string, string> = {}
        for (const item of data) {
          settings[item.key] = lang === 'so' && item.valueSo ? item.valueSo : item.value
        }
        setPaymentSettings(settings)
      }
    } catch {
      // Use hardcoded defaults if API fails
      setPaymentSettings({
        'payment.bank1_name': 'Telebirr',
        'payment.bank1_account': '0915210607',
        'payment.bank1_holder': 'Gaboose Hotel',
        'payment.bank2_name': 'ebirr',
        'payment.bank2_account': '0915210607',
        'payment.bank2_holder': 'Gaboose Hotel',
        'payment.bank3_name': 'Kaafi',
        'payment.bank3_account': '0915210607',
        'payment.bank3_holder': 'Gaboose Hotel',
        'payment.instructions': lang === 'so'
          ? 'Dhig lacagta oo dhamaystiran si kastaba ha ahaatee accountka hoose, kadibna soo geli sawirka waraaqaha lacag bixinta.'
          : 'Send the full amount to any of the accounts below, then upload a screenshot of your payment receipt.',
      })
    }
  }, [lang])

  useEffect(() => { fetchBooking() }, [fetchBooking])
  useEffect(() => { fetchPaymentSettings() }, [fetchPaymentSettings])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!imageFile || !formData.senderName || !bookingId) {
      toast.error('Please fill in all required fields')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      fd.append('senderName', formData.senderName)
      if (formData.amount) fd.append('amount', formData.amount)
      if (formData.accountName) fd.append('accountName', formData.accountName)
      if (formData.notes) fd.append('notes', formData.notes)

      const res = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: 'POST',
        body: fd,
      })

      if (res.ok) {
        setUploaded(true)
        toast.success('Payment proof uploaded successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to upload payment proof')
      }
    } catch {
      toast.error('Failed to upload payment proof')
    } finally {
      setUploading(false)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  function getRoomPrice(roomType: string) {
    const roomPrices: Record<string, number> = {
      standardSingle: 25,
      standardDouble: 40,
      family: 55,
      deluxe: 70,
    }
    return roomPrices[roomType] || 0
  }

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#08080A' }}>
        <Card style={cardStyle} className="max-w-md mx-4">
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#C4A03C' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>No Booking ID</h2>
            <p style={{ color: '#A09890' }}>Please access this page from your booking confirmation.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/'} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (uploaded) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#08080A' }}>
        <Card style={cardStyle} className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#22C55E' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>
              {lang === 'so' ? 'Waad ku guuleysatay!' : 'Payment Submitted!'}
            </h2>
            <p className="mb-6" style={{ color: '#A09890' }}>
              {lang === 'so'
                ? 'Lacag bixintaba waa la soo gelay. Dalabkaaga waa la xaqiiji doonaa.'
                : 'Your payment is being reviewed. We\'ll confirm your booking shortly.'}
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/'} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
              {lang === 'so' ? 'Bogga Hore' : 'Go Home'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12" style={{ backgroundColor: '#08080A' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-8 h-8" style={{ color: '#C4A03C' }} />
            <span className="text-2xl font-bold" style={{ color: '#C4A03C' }}>Gaboose Hotel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#fff' }}>
            {lang === 'so' ? 'Xaqiijinta Dalabka' : 'Booking Confirmation'}
          </h1>
          <p className="mt-2" style={{ color: '#A09890' }}>
            {lang === 'so' ? 'La xaqiiji dalabkaaga oo bixi lacagta' : 'Confirm your booking and make payment'}
          </p>
        </div>

        {/* Booking Details */}
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#C4A03C' }}>
              <Calendar className="w-4 h-4" />
              {lang === 'so' ? 'Faahfaahinta Dalabka' : 'Booking Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" style={{ backgroundColor: '#08080A' }} />
                <Skeleton className="h-6 w-1/2" style={{ backgroundColor: '#08080A' }} />
                <Skeleton className="h-6 w-2/3" style={{ backgroundColor: '#08080A' }} />
              </div>
            ) : booking ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <p className="text-xs" style={{ color: '#A09890' }}>
                      <Users className="w-3 h-3 inline mr-1" />
                      {lang === 'so' ? 'Magaca' : 'Guest Name'}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#fff' }}>{booking.name}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <p className="text-xs" style={{ color: '#A09890' }}>
                      <Phone className="w-3 h-3 inline mr-1" />
                      {lang === 'so' ? 'Taleefan' : 'Phone'}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#fff' }}>{booking.phone}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <p className="text-xs" style={{ color: '#A09890' }}>{lang === 'so' ? 'Qolka' : 'Room'}</p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#fff' }}>{booking.roomType}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <p className="text-xs" style={{ color: '#A09890' }}>{lang === 'so' ? 'Dadka' : 'Guests'}</p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#fff' }}>{booking.guests}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <p className="text-xs" style={{ color: '#A09890' }}>{lang === 'so' ? 'Gelitaan' : 'Check-in'}</p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#fff' }}>{formatDate(booking.checkIn)}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <p className="text-xs" style={{ color: '#A09890' }}>{lang === 'so' ? 'Baxitaan' : 'Check-out'}</p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#fff' }}>{formatDate(booking.checkOut)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg flex items-center justify-between mt-2" style={{ backgroundColor: 'rgba(196,160,60,0.08)', border: '1px solid rgba(196,160,60,0.2)' }}>
                  <span className="text-sm" style={{ color: '#A09890' }}>{lang === 'so' ? 'Wadarta' : 'Total Amount'}</span>
                  <span className="text-xl font-bold" style={{ color: '#C4A03C' }}>
                    {(booking.totalAmount || getRoomPrice(booking.roomType) * Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))))} ETB
                  </span>
                </div>
                {booking.paymentProof && (
                  <div className="p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                    <Lock className="w-4 h-4" style={{ color: '#EAB308' }} />
                    <span className="text-sm" style={{ color: '#EAB308' }}>
                      {lang === 'so' ? 'Lacag bixintaba waa la soo gelay - waa la fiirinayaa' : 'Payment proof submitted — under review'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-4" style={{ color: '#A09890' }}>Booking not found</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card style={cardStyle}>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#C4A03C' }}>
              <CreditCard className="w-4 h-4" />
              {lang === 'so' ? 'Furaha Lacag Bixinta' : 'Payment Instructions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentSettings['payment.instructions'] && (
              <p className="text-sm" style={{ color: '#B8B0A4' }}>
                {paymentSettings['payment.instructions']}
              </p>
            )}

            {/* Bank Account 1 - Telebirr */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#08080A', border: '1px solid #1E1E24' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
                  <Globe className="w-4 h-4" style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>{paymentSettings['payment.bank1_name'] || 'Telebirr'}</p>
                </div>
              </div>
              <div className="space-y-1.5 ml-10">
                <p className="text-sm font-mono" style={{ color: '#C4A03C' }}>{paymentSettings['payment.bank1_account'] || '0915210607'}</p>
                <p className="text-xs" style={{ color: '#A09890' }}>{paymentSettings['payment.bank1_holder'] || 'Gaboose Hotel'}</p>
              </div>
            </div>

            {/* Bank Account 2 - ebirr */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#08080A', border: '1px solid #1E1E24' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(168,85,247,0.15)' }}>
                  <CreditCard className="w-4 h-4" style={{ color: '#A855F7' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>{paymentSettings['payment.bank2_name'] || 'ebirr'}</p>
                </div>
              </div>
              <div className="space-y-1.5 ml-10">
                <p className="text-sm font-mono" style={{ color: '#C4A03C' }}>{paymentSettings['payment.bank2_account'] || '0915210607'}</p>
                <p className="text-xs" style={{ color: '#A09890' }}>{paymentSettings['payment.bank2_holder'] || 'Gaboose Hotel'}</p>
              </div>
            </div>

            {/* Bank Account 3 - Kaafi */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#08080A', border: '1px solid #1E1E24' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                  <Phone className="w-4 h-4" style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>{paymentSettings['payment.bank3_name'] || 'Kaafi'}</p>
                </div>
              </div>
              <div className="space-y-1.5 ml-10">
                <p className="text-sm font-mono" style={{ color: '#C4A03C' }}>{paymentSettings['payment.bank3_account'] || '0915210607'}</p>
                <p className="text-xs" style={{ color: '#A09890' }}>{paymentSettings['payment.bank3_holder'] || 'Gaboose Hotel'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Payment Proof */}
        {!booking?.paymentProof && (
          <Card style={cardStyle}>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#C4A03C' }}>
                <Upload className="w-4 h-4" />
                {lang === 'so' ? 'Soo Geli Sawirka Lacag Bixinta' : 'Upload Payment Receipt'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label className="text-sm" style={{ color: '#B8B0A4' }}>
                    {lang === 'so' ? 'Sawirka Waraaqaha Lacag Bixinta *' : 'Payment Receipt Screenshot *'}
                  </Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: '#1E1E24' }}>
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(null); setImageFile(null) }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:border-[#C4A03C]/50" style={{ borderColor: '#1E1E24', backgroundColor: '#08080A' }}>
                        <Camera className="w-8 h-8 mb-2" style={{ color: '#A09890' }} />
                        <p className="text-sm" style={{ color: '#A09890' }}>
                          {lang === 'so' ? 'Taabo si aad u doorato sawir' : 'Click to select image'}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#5A5650' }}>JPG, PNG up to 5MB</p>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Sender Name */}
                <div>
                  <Label style={{ color: '#B8B0A4' }}>
                    {lang === 'so' ? 'Magaca Lacag Bixiyaaga *' : 'Sender Name *'}
                  </Label>
                  <Input
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    required
                    placeholder={lang === 'so' ? 'Magacaaga oo dhamaystiran' : 'Your full name as shown on the transfer'}
                    style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}
                  />
                </div>

                {/* Amount */}
                <div>
                  <Label style={{ color: '#B8B0A4' }}>
                    {lang === 'so' ? 'Lacagta La Diray' : 'Amount Sent (ETB)'}
                  </Label>
                  <Input
                    type="number"
                    step={0.01}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}
                  />
                </div>

                {/* Account Selection */}
                <div>
                  <Label style={{ color: '#B8B0A4' }}>
                    {lang === 'so' ? 'Accountka La Diray' : 'Sent to Account'}
                  </Label>
                  <Select value={formData.accountName} onValueChange={(v) => setFormData({ ...formData, accountName: v })}>
                    <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                      <SelectValue placeholder={lang === 'so' ? 'Dooro accountka' : 'Select account'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Telebirr">
                        {paymentSettings['payment.bank1_name'] || 'Telebirr'} — {paymentSettings['payment.bank1_account'] || '0915210607'}
                      </SelectItem>
                      <SelectItem value="ebirr">
                        {paymentSettings['payment.bank2_name'] || 'ebirr'} — {paymentSettings['payment.bank2_account'] || '0915210607'}
                      </SelectItem>
                      <SelectItem value="Kaafi">
                        {paymentSettings['payment.bank3_name'] || 'Kaafi'} — {paymentSettings['payment.bank3_account'] || '0915210607'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label style={{ color: '#B8B0A4' }}>
                    {lang === 'so' ? 'Faallo' : 'Notes (Optional)'}
                  </Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={lang === 'so' ? 'Faallo kale...' : 'Any additional notes...'}
                    rows={2}
                    style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !imageFile}
                  className="w-full bg-[#C4A03C] hover:bg-[#D4B050] text-[#08080A] font-semibold py-5"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {lang === 'so' ? 'Soo Gelinaya...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {lang === 'so' ? 'Soo Geli Lacag Bixinta' : 'Submit Payment Proof'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Back link */}
        <div className="text-center pt-4">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: '#A09890' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'so' ? 'Bogga Hore' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  )
}
