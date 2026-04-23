import { Suspense } from 'react'
import BookingConfirmationContent from './booking-content'

export const dynamic = 'force-dynamic'

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#08080A' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#C4A03C' }} />
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  )
}