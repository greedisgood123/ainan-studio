import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

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
  const createBooking = useMutation(api.bookings.create)
  const unavailableDays = useQuery(api.unavailableDates.publicDays, {})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const desired = selectedDate ?? data.desiredDate
      if (!desired) throw new Error('Please select a desired date')
      const desiredDateMs = new Date(desired.getFullYear(), desired.getMonth(), desired.getDate()).getTime()
      await createBooking({
        name: data.name,
        email: data.email,
        phone: data.phone,
        desiredDateMs,
        packageName,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })
      setSubmitMessage({ type: 'success', text: 'Thank you! Your booking request was submitted.' })
      reset()
      setSelectedDate(undefined)
      setTimeout(() => {
        onClose()
        setSubmitMessage(null)
      }, 1500)
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err?.message || 'Something went wrong. Please try another date.' })
    }

    setIsSubmitting(false)
  }

  const handleClose = () => {
    reset()
    setSubmitMessage(null)
    setSelectedDate(undefined)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Book {packageName ? `— ${packageName}` : 'Our Service'}</DialogTitle>
          <DialogDescription className="text-center">
            Tell us your details and preferred date. We’ll confirm availability shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
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
              <div className="mt-2 border rounded-md p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  disabled={(date: any) => {
                    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
                    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
                    if (start < todayStart) return true
                    if (!unavailableDays) return false
                    return (unavailableDays as number[]).includes(start)
                  }}
                  initialFocus
                />
              </div>
              {selectedDate && unavailableDays && (unavailableDays as number[]).includes(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime()) && (
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

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || (!!selectedDate && !!unavailableDays && (unavailableDays as number[]).includes(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime()))}>
            {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>) : 'Submit Booking'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


