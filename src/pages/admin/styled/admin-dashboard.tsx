"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BookingsSection, type BookingItem, type UnavailableDate } from "./sections/bookings-section"

export function AdminDashboard({
  bookings,
  unavailable,
  bookingsActions,
  onLogout,
}: {
  bookings: BookingItem[]
  unavailable: UnavailableDate[]
  bookingsActions: {
    onBlock: (dateMs: number, reason?: string) => Promise<void>
    onUnblock: (dateMs: number) => Promise<void>
    isLoading?: boolean
  }
  onLogout?: () => void
}) {
  const { toast } = useToast()

  const safeLogout = useMemo(() => {
    return () => {
      onLogout?.()
      toast({ title: "Logged out" })
    }
  }, [onLogout, toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border bg-card p-3 sm:p-4">
        <div>
          <p className="text-sm text-muted-foreground">Manage bookings</p>
          <h2 className="text-lg sm:text-xl font-semibold">Booking Manager</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={safeLogout} aria-label="Log out">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <BookingsSection
          bookings={bookings}
          unavailable={unavailable}
          isLoading={bookingsActions.isLoading}
          onUnavailBlock={bookingsActions.onBlock}
          onUnavailUnblock={bookingsActions.onUnblock}
        />
      </div>


    </div>
  )
}


