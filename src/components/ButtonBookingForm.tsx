import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { apiClient } from '@/lib/api'

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  desiredDate: z.date().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface ButtonBookingFormProps {
  packageName?: string
  isOpen: boolean
  onClose: () => void
}

export const ButtonBookingForm = ({ packageName, isOpen, onClose }: ButtonBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Static unavailable dates - no backend needed for calendar
  const staticUnavailableDays = [
    // Next 2 weekends
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7).getTime(), // Next Saturday
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 8).getTime(), // Next Sunday
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14).getTime(), // Following Saturday
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 15).getTime(), // Following Sunday
    // Some weekdays for demo
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3).getTime(), // 3 days from now
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 10).getTime(), // 10 days from now
  ]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const isDateBlocked = (d?: Date) => {
    if (!d) return false
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    return staticUnavailableDays.includes(start)
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const desired = selectedDate ?? data.desiredDate
      if (!desired) throw new Error('Please select a desired date')
      if (isDateBlocked(desired)) {
        setSubmitMessage({ type: 'error', text: 'This date is unavailable. Please choose another date.' })
        setIsSubmitting(false)
        return
      }
      
      const desiredDateMs = new Date(desired.getFullYear(), desired.getMonth(), desired.getDate()).getTime()
      
      // Submit booking to backend
      await apiClient.post('/api/bookings', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        desiredDateMs,
        packageName,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })
      
      setSubmitMessage({ type: 'success', text: 'Thank you! Your booking request was submitted. We will contact you within 24 hours to confirm your appointment.' })
      reset()
      setSelectedDate(undefined)
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose()
        setSubmitMessage(null)
      }, 3000)
      
    } catch (error) {
      console.error('Booking submission error:', error)
      setSubmitMessage({ 
        type: 'error', 
        text: 'Sorry, something went wrong. Please try again or contact us directly.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setSubmitMessage(null)
    setSelectedDate(undefined)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[min(92vw,640px)] sm:max-w-[640px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-center text-[clamp(1.25rem,2vw+0.5rem,1.75rem)]">Book {packageName ? `— ${packageName}` : 'Our Service'}</DialogTitle>
          <DialogDescription className="text-center text-[clamp(0.9rem,1vw+0.4rem,1rem)]">
            Tell us your details and preferred date. We’ll confirm availability shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 mt-4 sm:mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
              <Input id="name" {...register('name')} placeholder="Enter your full name" className="mt-1" disabled={isSubmitting} />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <Input id="email" type="email" {...register('email')} placeholder="Enter your email address" className="mt-1" disabled={isSubmitting} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
              <Input id="phone" type="tel" {...register('phone')} placeholder="Enter your phone number" className="mt-1" disabled={isSubmitting} />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium">Desired Booking Date *</Label>
              <div className="mt-2 border rounded-md p-3 sm:p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    console.log('[Booking] onSelect', d)
                    // Ignore clicks on blocked days
                    if (d && !isDateBlocked(d)) {
                      setSelectedDate(d)
                      if (submitMessage?.type === 'error') setSubmitMessage(null)
                    }
                    if (d && isDateBlocked(d)) {
                      setSubmitMessage({ type: 'error', text: 'This date is unavailable. Please choose another date.' })
                    }
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  disabled={(date: any) => {
                    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
                    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
                    if (start < todayStart) return true
                    const blocked = isDateBlocked(date)
                    if (blocked) {
                      // Debug: show which days are blocked
                      console.debug('[Booking] disabled day (blocked):', new Date(start).toDateString())
                    }
                    return blocked
                  }}
                  // Visual indicator for blocked dates
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  modifiers={{ unavailable: (date: any) => isDateBlocked(date) }}
                  modifiersClassNames={{
                    unavailable: 'bg-destructive/20 text-destructive line-through hover:bg-destructive/20',
                  }}
                  initialFocus
                />
              </div>
              {selectedDate && isDateBlocked(selectedDate) && (
                <p className="text-xs text-red-600 mt-2">This date is unavailable. Please choose another date.</p>
              )}
              {(!selectedDate && errors.desiredDate) && <p className="text-sm text-red-500 mt-1">{errors.desiredDate.message}</p>}
            </div>
          </div>

          {submitMessage && (
            <Alert className={submitMessage.type === 'success' ? 'border-green-500' : 'border-red-500'}>
              {submitMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={submitMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {submitMessage.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="sticky bottom-0 bg-background/90 backdrop-blur border-t pt-3">
            <Button type="submit" className="w-full text-[clamp(0.95rem,1vw+0.5rem,1.1rem)] py-2" size="lg" disabled={isSubmitting || isDateBlocked(selectedDate)}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>) : 'Submit Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


