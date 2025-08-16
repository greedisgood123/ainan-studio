"use client"

import { useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  PortfolioSection,
  type PortfolioItem,
  type CreatePortfolioPayload,
  type UpdatePortfolioPayload,
} from "./sections/portfolio-section"
import { LogosSection, type LogoItem, type CreateLogoPayload, type UpdateLogoPayload } from "./sections/logos-section"
import { GallerySection, type GalleryItem, type CreateGalleryPayload, type UpdateGalleryPayload } from "./sections/gallery-section"

// Re-export types for convenience
export type { GalleryItem, CreateGalleryPayload, UpdateGalleryPayload }
import { BookingsSection, type BookingItem, type UnavailableDate } from "./sections/bookings-section"
import { PackagesSection, type PackageItem, type CreatePackagePayload, type UpdatePackagePayload } from "./sections/packages-section"
import { SettingsSection } from "@/pages/admin/styled/sections/settings-section"

export function AdminDashboard({
  portfolio,
  logos,
  gallery,
  bookings,
  unavailable,
  packages,
  settingsActions,
  portfolioActions,
  logoActions,
  galleryActions,
  bookingsActions,
  packagesActions,
  onLogout,
}: {
  portfolio: PortfolioItem[]
  logos: LogoItem[]
  gallery: GalleryItem[]
  bookings: BookingItem[]
  unavailable: UnavailableDate[]
  packages: PackageItem[]
  settingsActions: {
    onSetHero: (payload: { mp4?: File; webm?: File; poster?: File }) => Promise<void>
    isLoading?: boolean
  }
  portfolioActions: {
    onCreate: (payload: CreatePortfolioPayload) => Promise<void>
    onUpdate: (payload: UpdatePortfolioPayload) => Promise<void>
    onDelete: (id: string) => Promise<void>
    isLoading?: boolean
  }
  logoActions: {
    onCreate: (payload: CreateLogoPayload) => Promise<void>
    onUpdate: (payload: UpdateLogoPayload) => Promise<void>
    onDelete: (id: string) => Promise<void>
    isLoading?: boolean
  }
  galleryActions: {
    onCreate: (payload: CreateGalleryPayload) => Promise<void>
    onUpdate: (payload: UpdateGalleryPayload) => Promise<void>
    onDelete: (id: string) => Promise<void>
    isLoading?: boolean
  }
  bookingsActions: {
    onBlock: (dateMs: number, reason?: string) => Promise<void>
    onUnblock: (dateMs: number) => Promise<void>
    isLoading?: boolean
  }
  packagesActions: {
    onCreate: (payload: CreatePackagePayload) => Promise<void>
    onUpdate: (payload: UpdatePackagePayload) => Promise<void>
    onDelete: (id: string) => Promise<void>
    isLoading?: boolean
  }
  onLogout?: () => void
}) {
  const { toast } = useToast()
  // Defensive guards in case props are passed during HMR/partial renders
  const onSetHero = settingsActions?.onSetHero ?? (async () => {})
  const settingsIsLoading = settingsActions?.isLoading ?? false

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
          <p className="text-sm text-muted-foreground">Manage content</p>
          <h2 className="text-lg sm:text-xl font-semibold">Content Manager</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={safeLogout} aria-label="Log out">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="portfolio" id="portfolio">
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="gallery" id="gallery">
            Gallery
          </TabsTrigger>
          <TabsTrigger value="logos" id="logos">
            Client Logos
          </TabsTrigger>
          <TabsTrigger value="bookings" id="bookings">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="packages" id="packages">
            Packages
          </TabsTrigger>
          <TabsTrigger value="settings" id="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <PortfolioSection data={portfolio} {...portfolioActions} />
        </TabsContent>

        <TabsContent value="gallery">
          <GallerySection data={gallery} {...galleryActions} />
        </TabsContent>

        <TabsContent value="logos">
          <LogosSection data={logos} {...logoActions} />
        </TabsContent>


        <TabsContent value="bookings">
          <BookingsSection
            bookings={bookings}
            unavailable={unavailable}
            isLoading={bookingsActions.isLoading}
            onUnavailBlock={bookingsActions.onBlock}
            onUnavailUnblock={bookingsActions.onUnblock}
          />
        </TabsContent>

        <TabsContent value="packages">
          <PackagesSection data={packages} {...packagesActions} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsSection onSetHero={onSetHero} isLoading={settingsIsLoading} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-center py-4">
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </div>
    </div>
  )
}


