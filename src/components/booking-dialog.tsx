'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import { CalendarDays, Loader2, CheckCircle2, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
// Rooms fetched from API
import { useLanguage } from '@/lib/language'

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedRoomId?: string
  preselectedRoomName?: string
}

export function BookingDialog({
  open,
  onOpenChange,
  preselectedRoomId,
}: BookingDialogProps) {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [dynamicRooms, setDynamicRooms] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    roomType: preselectedRoomId || '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    notes: '',
  })

  // Reset step when dialog opens
  useEffect(() => {
    if (open) {
      setStep('form')
      setBookingId('')
      setTotalAmount(0)
    }
  }, [open])

  // Sync preselected room when prop changes
  useEffect(() => {
    if (preselectedRoomId) {
      setFormData((prev) => ({ ...prev, roomType: preselectedRoomId }))
    }
  }, [preselectedRoomId])

  useEffect(() => {
    fetch('/api/public/rooms')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setDynamicRooms(data)
      })
      .catch(() => {})
  }, [])

  const allRooms = dynamicRooms.length > 0 ? dynamicRooms : [];
    const selectedRoom = allRooms.find((r) => r.id === formData.roomType)
  const estimatedNights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0
    const diff = new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [formData.checkIn, formData.checkOut])

  const estimatedTotal = selectedRoom ? selectedRoom.price * estimatedNights : 0

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.roomType || !formData.checkIn || !formData.checkOut) {
      toast.error(t('toast.required'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        const total = selectedRoom ? selectedRoom.price * estimatedNights : 0
        setBookingId(data.bookingId)
        setTotalAmount(total)
        setStep('success')
      } else {
        toast.error(t('toast.bookingFail'))
      }
    } catch {
      toast.error(t('toast.networkError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProceedToPayment = () => {
    onOpenChange(false)
    router.push(`/booking-confirmation?bookingId=${bookingId}`)
  }

  const handleClose = () => {
    setStep('form')
    setBookingId('')
    setTotalAmount(0)
    setFormData({
      name: '',
      phone: '',
      roomType: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      notes: '',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-lg bg-[#0F0F12] border-[#1E1E24]">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#C4A03C] flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {t('booking.title')}
              </DialogTitle>
              <DialogDescription className="text-[#A09890]">
                {t('booking.desc')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Info */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="booking-name" className="text-[#B8B0A4]">{t('booking.name')}</Label>
                  <Input
                    id="booking-name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder={t('booking.namePlaceholder')}
                    required
                    className="mt-1 bg-[#08080A] border-[#1E1E24] text-white placeholder:text-[#5A5650] focus:border-[#C4A03C]/50"
                  />
                </div>
                <div>
                  <Label htmlFor="booking-phone" className="text-[#B8B0A4]">{t('booking.phone')}</Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={t('booking.phonePlaceholder')}
                    required
                    className="mt-1 bg-[#08080A] border-[#1E1E24] text-white placeholder:text-[#5A5650] focus:border-[#C4A03C]/50"
                  />
                </div>
              </div>

              {/* Room & Dates */}
              <div className="space-y-3">
                <div>
                  <Label className="text-[#B8B0A4]">{t('booking.room')}</Label>
                  <Select
                    value={formData.roomType}
                    onValueChange={(value) => handleChange('roomType', value)}
                  >
                    <SelectTrigger className="w-full mt-1 bg-[#08080A] border-[#1E1E24] text-white">
                      <SelectValue placeholder={t('booking.selectRoom')} />
                    </SelectTrigger>
                    <SelectContent>
                      {dynamicRooms.length > 0 ? dynamicRooms.map((room: any) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} — {room.price} ETB{t('booking.perNight')}
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#B8B0A4]">{t('booking.checkin')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                          style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: formData.checkIn ? '#fff' : '#5A5650' }}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" style={{ color: '#C4A03C' }} />
                          {formData.checkIn ? format(new Date(formData.checkIn), 'PPP') : t('booking.checkin')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" style={{ backgroundColor: '#111114', border: '1px solid #2A2A30', borderRadius: '12px' }}>
                        <CalendarPicker
                          mode="single"
                          selected={formData.checkIn ? new Date(formData.checkIn) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const dateStr = format(date, 'yyyy-MM-dd')
                              handleChange('checkIn', dateStr)
                              if (formData.checkOut && new Date(formData.checkOut) <= date) {
                                handleChange('checkOut', '')
                              }
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="bg-transparent"
                          classNames={{
                            day_selected: 'bg-[#C4A03C] text-[#08080A] hover:bg-[#D4B050] focus:bg-[#D4B050] rounded-md',
                            day_today: 'bg-[#C4A03C]/20 text-[#C4A03C] font-bold ring-1 ring-[#C4A03C]/50 rounded-md',
                            day_outside: 'text-[#3A3630] opacity-50',
                            day_disabled: 'text-[#3A3630] opacity-30 line-through',
                            day_hidden: 'invisible',
                            day: 'text-[#E8E0D8] hover:bg-[#1E1E24] rounded-md transition-colors w-8 h-8 font-medium',
                            button_previous: 'text-[#C4A03C] hover:bg-[#C4A03C]/15 hover:text-[#C4A03C]',
                            button_next: 'text-[#C4A03C] hover:bg-[#C4A03C]/15 hover:text-[#C4A03C]',
                            caption_label: 'text-[#fff] font-semibold',
                            caption: 'pb-2 pt-1',
                            nav: 'space-x-4',
                            weekday: 'text-[#C4A03C]/70 text-xs font-medium uppercase',
                            month: 'space-y-2',
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell: 'text-[#C4A03C]/70 rounded-md w-8 font-normal text-xs',
                            row: 'flex w-full mt-0',
                            cell: 'text-center p-0 relative h-8 w-8',
                            range_middle: 'bg-[#C4A03C]/20',
                            range_start: 'bg-[#C4A03C] text-[#08080A] rounded-l-md',
                            range_end: 'bg-[#C4A03C] text-[#08080A] rounded-r-md',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-[#B8B0A4]">{t('booking.checkout')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                          style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: formData.checkOut ? '#fff' : '#5A5650' }}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" style={{ color: '#C4A03C' }} />
                          {formData.checkOut ? format(new Date(formData.checkOut), 'PPP') : t('booking.checkout')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" style={{ backgroundColor: '#111114', border: '1px solid #2A2A30', borderRadius: '12px' }}>
                        <CalendarPicker
                          mode="single"
                          selected={formData.checkOut ? new Date(formData.checkOut) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              handleChange('checkOut', format(date, 'yyyy-MM-dd'))
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date(new Date().setHours(0, 0, 0, 0))
                            const minDate = formData.checkIn ? new Date(formData.checkIn) : today
                            minDate.setDate(minDate.getDate() + 1)
                            return date < minDate
                          }}
                          className="bg-transparent"
                          classNames={{
                            day_selected: 'bg-[#C4A03C] text-[#08080A] hover:bg-[#D4B050] focus:bg-[#D4B050] rounded-md',
                            day_today: 'bg-[#C4A03C]/20 text-[#C4A03C] font-bold ring-1 ring-[#C4A03C]/50 rounded-md',
                            day_outside: 'text-[#3A3630] opacity-50',
                            day_disabled: 'text-[#3A3630] opacity-30 line-through',
                            day_hidden: 'invisible',
                            day: 'text-[#E8E0D8] hover:bg-[#1E1E24] rounded-md transition-colors w-8 h-8 font-medium',
                            button_previous: 'text-[#C4A03C] hover:bg-[#C4A03C]/15 hover:text-[#C4A03C]',
                            button_next: 'text-[#C4A03C] hover:bg-[#C4A03C]/15 hover:text-[#C4A03C]',
                            caption_label: 'text-[#fff] font-semibold',
                            caption: 'pb-2 pt-1',
                            nav: 'space-x-4',
                            weekday: 'text-[#C4A03C]/70 text-xs font-medium uppercase',
                            month: 'space-y-2',
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell: 'text-[#C4A03C]/70 rounded-md w-8 font-normal text-xs',
                            row: 'flex w-full mt-0',
                            cell: 'text-center p-0 relative h-8 w-8',
                            range_middle: 'bg-[#C4A03C]/20',
                            range_start: 'bg-[#C4A03C] text-[#08080A] rounded-l-md',
                            range_end: 'bg-[#C4A03C] text-[#08080A] rounded-r-md',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

              </div>

              {/* Special Requests */}
              <div>
                <Label htmlFor="booking-notes" className="text-[#B8B0A4]">{t('booking.notes')}</Label>
                <Textarea
                  id="booking-notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder={t('booking.notesPlaceholder')}
                  className="mt-1 bg-[#08080A] border-[#1E1E24] text-white placeholder:text-[#5A5650] focus:border-[#C4A03C]/50"
                  rows={3}
                />
              </div>

              {/* Price Estimate */}
              {selectedRoom && estimatedNights > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#111114] border border-[#C4A03C]/30 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-[#A09890]">
                      {t('room.' + selectedRoom.id)} × {estimatedNights} {estimatedNights === 1 ? t('booking.night') : t('booking.nights')}
                    </span>
                    <Badge className="bg-[#C4A03C] text-[#08080A] font-semibold">{selectedRoom.price} ETB{t('booking.perNight')}</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#1E1E24]">
                    <span className="font-semibold text-[#C4A03C]">{t('booking.total')}</span>
                    <span className="font-bold text-lg text-[#C4A03C]">{estimatedTotal} ETB</span>
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#C4A03C] hover:bg-[#D4B050] text-[#08080A] transition-colors py-5 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('booking.submitting')}
                  </>
                ) : (
                  t('booking.submit')
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex flex-col items-center text-center pt-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: '#22C55E' }} />
                </motion.div>
                <DialogTitle className="text-xl font-bold text-[#C4A03C]">
                  {t('booking.success')}
                </DialogTitle>
                <DialogDescription className="text-[#A09890] mt-2">
                  {t('booking.successDesc').replace('{id}', bookingId)}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#08080A', border: '1px solid #1E1E24' }}>
                <p className="text-xs mb-1" style={{ color: '#A09890' }}>{t('booking.bookingId')}</p>
                <p className="text-lg font-bold font-mono" style={{ color: '#C4A03C' }}>{bookingId}</p>
              </div>

              {totalAmount > 0 && (
                <div className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(196,160,60,0.08)', border: '1px solid rgba(196,160,60,0.2)' }}>
                  <span className="text-sm" style={{ color: '#A09890' }}>{t('booking.total')}</span>
                  <span className="text-xl font-bold" style={{ color: '#C4A03C' }}>{totalAmount} ETB</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#C4A03C] hover:bg-[#D4B050] text-[#08080A] font-semibold py-5"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('booking.proceedPayment')}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: '#1E1E24', color: '#A09890' }}
                >
                  {t('booking.payLater')}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
