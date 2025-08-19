"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export type BookingItem = {
  id: string
  name: string
  email: string
  phone: string
  desired_date: number
  package_name?: string
  status: string
  created_at: number
}

export type UnavailableDate = {
  date_ms: number
  reason?: string
}

export function BookingsSection({
  bookings = [],
  unavailable = [],
  isLoading = false,
  onUnavailBlock = async (_dateMs: number, _reason?: string) => {},
  onUnavailUnblock = async (_dateMs: number) => {},
}: {
  bookings?: BookingItem[]
  unavailable?: UnavailableDate[]
  isLoading?: boolean
  onUnavailBlock?: (dateMs: number, reason?: string) => Promise<void>
  onUnavailUnblock?: (dateMs: number) => Promise<void>
}) {
  const [selected, setSelected] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState<string>("")

  const unavailableSet = useMemo(() => new Set(unavailable.map(u => new Date(u.date_ms).toDateString())), [unavailable])

  const bookingsByDate = useMemo(() => {
    const m = new Map<string, BookingItem[]>()
    for (const b of bookings) {
      const key = new Date(b.desired_date).toDateString()
      m.set(key, [...(m.get(key) ?? []), b])
    }
    return m
  }, [bookings])

  const selectedKey = selected ? selected.toDateString() : undefined
  const selectedBookings = selectedKey ? bookingsByDate.get(selectedKey) ?? [] : []
  const isSelectedBlocked = selectedKey ? unavailableSet.has(selectedKey) : false

  const allBookingsSorted = useMemo(() =>
    [...bookings].sort((a, b) => (a.desired_date - b.desired_date) || (a.created_at - b.created_at))
  , [bookings])

  const blockedSorted = useMemo(() =>
    [...unavailable].sort((a, b) => a.date_ms - b.date_ms)
  , [unavailable])

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                modifiers={{
                  unavailable: (date: any) => unavailableSet.has(new Date(date).toDateString()),
                }}
                // disable past days
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                disabled={(date: any) => {
                  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
                  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
                  return start < todayStart
                }}
              />
            </div>
            <div className="space-y-3">
              <Label>Block/Unblock Selected Date</Label>
              <Input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      if (!selected) return
                      await onUnavailBlock(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).getTime(), reason || undefined)
                      setReason("")
                    } catch (e) {
                      // No toast hook in this component; keep it silent to avoid UI jumps
                      console.error('Failed to block date', e)
                    }
                  }}
                >
                  Block Date
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (!selected) return
                      await onUnavailUnblock(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).getTime())
                    } catch (e) {
                      console.error('Failed to unblock date', e)
                    }
                  }}
                >
                  Unblock
                </Button>
              </div>

              <div className="mt-4">
                <Label>Selected Date</Label>
                <div className="mt-2">
                  {selected ? (
                    <div className="flex items-center gap-2">
                      <Badge variant={isSelectedBlocked ? 'destructive' : 'secondary'}>
                        {selected.toDateString()} {isSelectedBlocked ? '(Blocked)' : ''}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Pick a date to view details</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">All Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : allBookingsSorted.length === 0 ? (
            <div className="text-sm text-muted-foreground">No bookings yet.</div>
          ) : (
            <div className="divide-y rounded border">
              {allBookingsSorted.map(b => (
                <div key={b.id} className="p-3 grid gap-2 sm:grid-cols-6">
                  <div className="text-sm font-medium">
                    {b.desired_date ? new Date(b.desired_date).toDateString() : 'Invalid Date'}
                  </div>
                  <div className="sm:col-span-2">
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.email} · {b.phone}</div>
                  </div>
                  <div>
                    <Badge variant="secondary">{b.package_name || 'General'}</Badge>
                  </div>
                  <div>
                    <Badge>{b.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground self-center">
                    {b.created_at ? new Date(b.created_at).toLocaleString() : 'Invalid Date'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockedSorted.length === 0 ? (
            <div className="text-sm text-muted-foreground">No blocked dates.</div>
          ) : (
            <div className="divide-y rounded border">
              {blockedSorted.map((d) => (
                <div key={d.date_ms} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{new Date(d.date_ms).toDateString()}</div>
                    {d.reason && <div className="text-xs text-muted-foreground">{d.reason}</div>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onUnavailUnblock?.(d.date_ms)}>Unblock</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


