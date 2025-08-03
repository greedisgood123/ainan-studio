import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { saveToSupabase, type SignupData } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

// Form validation schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number')
})

type SignupFormData = z.infer<typeof signupSchema>

interface SignupFormProps {
  packageName: string
  isOpen: boolean
  onClose: () => void
}

export const SignupForm = ({ packageName, isOpen, onClose }: SignupFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    const signupData: SignupData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      package_name: packageName
    }

    const result = await saveToSupabase(signupData)

    if (result.success) {
      setSubmitMessage({ type: 'success', text: 'Thank you! Your information has been submitted successfully.' })
      reset()
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        setSubmitMessage(null)
      }, 2000)
    } else {
      setSubmitMessage({ 
        type: 'error', 
        text: result.error || 'Something went wrong. Please try again.' 
      })
    }

    setIsSubmitting(false)
  }

  const handleClose = () => {
    reset()
    setSubmitMessage(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Get Started with {packageName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your full name"
                className="mt-1"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter your email address"
                className="mt-1"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="Enter your phone number"
                className="mt-1"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Selected package display */}
          <div className="bg-accent/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Selected Package:</p>
            <p className="font-semibold text-foreground">{packageName}</p>
          </div>

          {/* Submit message */}
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

          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          We'll contact you within 24 hours to discuss your requirements and schedule your session.
        </p>
      </DialogContent>
    </Dialog>
  )
}