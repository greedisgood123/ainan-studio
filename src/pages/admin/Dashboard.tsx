import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./styled/app-sidebar";
import { AdminDashboard } from "./styled/admin-dashboard";
import { CleanupDashboard } from "./CleanupDashboard";
import { useAuth } from "@/lib/auth";

// Import the new admin API hooks
import {
  useAdminProfile,
  useClientLogos,
  useCreateClientLogo,
  useUpdateClientLogo,
  useDeleteClientLogo,
  usePortfolioAdmin,
  useCreatePortfolioAlbum,
  useUpdatePortfolioAlbum,
  useDeletePortfolioAlbum,
  useAddPortfolioPhoto,
  usePackagesAdmin,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  useBookingsAdmin,
  useUnavailableDates,
  useBlockDate,
  useUnblockDate,
  useGalleryAdmin,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  useSetHeroVideo,
  useFileUploadWithProgress,
} from "@/hooks/useAdminApi";

// Type imports (keeping the same interfaces)
import type { PortfolioItem as StyledPortfolioItem, CreatePortfolioPayload as CreatePortfolioPayloadStyled, UpdatePortfolioPayload as UpdatePortfolioPayloadStyled } from "./styled/sections/portfolio-section";
import type { LogoItem as StyledLogoItem, CreateLogoPayload as CreateLogoPayloadStyled, UpdateLogoPayload as UpdateLogoPayloadStyled } from "./styled/sections/logos-section";
import type { GalleryItem as StyledGalleryItem, CreateGalleryPayload as CreateGalleryPayloadStyled, UpdateGalleryPayload as UpdateGalleryPayloadStyled } from "./styled/sections/gallery-section";
import type { BookingItem as StyledBookingItem, UnavailableDate as StyledUnavailableDate } from "./styled/sections/bookings-section";
import type { PackageItem as StyledPackageItem, CreatePackagePayload as CreatePackagePayloadStyled, UpdatePackagePayload as UpdatePackagePayloadStyled } from "./styled/sections/packages-section";

const Dashboard = () => {
  const { isAuthenticated, logout } = useAuth();
  
  // Admin profile
  const { data: me } = useAdminProfile();
  
  // Data queries
  const { data: logos, refetch: refetchLogos } = useClientLogos();
  const { data: portfolio, refetch: refetchPortfolio } = usePortfolioAdmin();
  const { data: packages, refetch: refetchPackages } = usePackagesAdmin();
  const { data: bookings, refetch: refetchBookings } = useBookingsAdmin();
  const { data: unavailable, refetch: refetchUnavailable } = useUnavailableDates();
  const { data: galleryData, refetch: refetchGallery } = useGalleryAdmin();
  
  // Mutations
  const createLogo = useCreateClientLogo();
  const updateLogo = useUpdateClientLogo();
  const removeLogo = useDeleteClientLogo();
  const createAlbum = useCreatePortfolioAlbum();
  const updateAlbum = useUpdatePortfolioAlbum();
  const removeAlbum = useDeletePortfolioAlbum();
  const addPhoto = useAddPortfolioPhoto();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const removePackage = useDeletePackage();
  const blockDate = useBlockDate();
  const unblockDate = useUnblockDate();
  const createGalleryItem = useCreateGalleryItem();
  const updateGalleryItem = useUpdateGalleryItem();
  const removeGalleryItem = useDeleteGalleryItem();
  const setHeroVideo = useSetHeroVideo();
  
  // File upload utility
  const { uploadFile, progress } = useFileUploadWithProgress();

  // These can be removed as they're not used in the new implementation
  // const [newName, setNewName] = useState("");
  // const [newOrder, setNewOrder] = useState<number>(0);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  // const [newCategory, setNewCategory] = useState<string>("Livefeed");
  // const categories = ["Weddings", "Corporate", "Livefeed"] as const;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = "#/admin/login";
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !me) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Transform data for styled components
  const portfolioData: StyledPortfolioItem[] = (Array.isArray(portfolio) ? portfolio : []).map((p: any) => ({
    _id: p.id?.toString() || p._id,
    title: p.title,
    description: p.description,
    category: p.category,
    coverUrl: p.coverImageUrl || p.cover_image_url,
    order: p.orderIndex || p.order_index || p.order || 0,
    isPublished: p.isPublished || p.is_published,
  }));

  const logosData: StyledLogoItem[] = (Array.isArray(logos) ? logos : []).map((l: any) => ({
    _id: l.id?.toString() || l._id,
    name: l.name,
    logoUrl: l.logoUrl || l.logo_url,
    order: l.orderIndex || l.order_index || l.order || 0,
  }));

  const bookingsData: StyledBookingItem[] = (Array.isArray(bookings) ? bookings : []).map((b: any) => ({
    _id: b.id?.toString() || b._id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    desiredDateMs: b.desiredDateMs || b.desired_date,
    packageName: b.packageName || b.package_name,
    status: b.status,
    createdAt: b.createdAt || b.created_at,
  }));

  const unavailableData: StyledUnavailableDate[] = (Array.isArray(unavailable) ? unavailable : []).map((u: any) => ({
    _id: u.id?.toString() || u._id,
    dateMs: u.dateMs || u.date_ms,
    reason: u.reason,
  }));

  const packagesData: StyledPackageItem[] = (Array.isArray(packages) ? packages : []).map((p: any) => ({
    _id: p.id?.toString() || p._id,
    title: p.title,
    price: p.price,
    description: p.description,
    features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
    addOns: Array.isArray(p.addOns) ? p.addOns : (Array.isArray(p.add_ons) ? p.add_ons : JSON.parse(p.add_ons || '[]')),
    isPopular: p.isPopular || p.is_popular,
    badge: p.badge,
    order: p.orderIndex || p.order_index || p.order || 0,
    isPublished: p.isPublished || p.is_published,
  }));

  const galleryItems: StyledGalleryItem[] = (Array.isArray(galleryData) ? galleryData : []).map((g: any) => ({
    _id: g.id?.toString() || g._id,
    title: g.title,
    description: g.description,
    badge: g.badge,
    iconName: g.iconName || g.icon_name,
    imageUrl: g.imageUrl || g.image_url,
    order: g.orderIndex || g.order_index || g.order || 0,
    isPublished: g.isPublished || g.is_published,
  }));

  // Portfolio actions
  const portfolioActions = {
    onCreate: async (payload: CreatePortfolioPayloadStyled) => {
      try {
        await createAlbum.mutate({
          title: payload.title,
          description: payload.description,
          category: payload.category,
          file: payload.file,
          order: payload.order ?? 0,
          isPublished: payload.isPublished ?? true,
        });
        refetchPortfolio();
      } catch (error) {
        console.error('Failed to create portfolio album:', error);
      }
    },
    onUpdate: async (update: UpdatePortfolioPayloadStyled) => {
      try {
        await updateAlbum.mutate({
          id: update.id,
          title: (update as any).title,
          description: (update as any).description,
          category: (update as any).category,
          file: (update as any).file,
          order: (update as any).order,
          isPublished: (update as any).isPublished,
        });
        refetchPortfolio();
      } catch (error) {
        console.error('Failed to update portfolio album:', error);
      }
    },
    onDelete: async (id: string) => {
      try {
        await removeAlbum.mutate(id);
        refetchPortfolio();
      } catch (error) {
        console.error('Failed to delete portfolio album:', error);
      }
    },
    isLoading: portfolio === undefined,
    uploadToStorage: async (file: File | Blob, onProgress?: (pct: number) => void) => {
      try {
        const result = await uploadFile(file as File, 'portfolio');
        return (result as any).url || result;
      } catch (error) {
        console.error('Failed to upload file:', error);
        throw error;
      }
    },
    createFromStorage: async (meta: {
      title: string;
      description: string;
      category: string;
      storageId: string;
      order?: number;
      isPublished?: boolean;
    }) => {
      // Implementation if needed
    },
    addPhotoToAlbum: async (albumId: string, file: File, order: number) => {
      try {
        await addPhoto.mutate({
          albumId,
          file,
          order,
        });
        refetchPortfolio();
      } catch (error) {
        console.error('Failed to add photo to album:', error);
      }
    },
  };

  // Logo actions
  const logoActions = {
    onCreate: async (payload: CreateLogoPayloadStyled) => {
      try {
        await createLogo.mutate({
          name: payload.name,
          file: payload.file,
          order: payload.order ?? 0,
        });
        refetchLogos();
      } catch (error) {
        console.error('Failed to create logo:', error);
      }
    },
    onUpdate: async (update: UpdateLogoPayloadStyled) => {
      try {
        await updateLogo.mutate({
          id: update.id,
          name: (update as any).name,
          file: (update as any).file,
          order: (update as any).order,
        });
        refetchLogos();
      } catch (error) {
        console.error('Failed to update logo:', error);
      }
    },
    onDelete: async (id: string) => {
      try {
        await removeLogo.mutate(id);
        refetchLogos();
      } catch (error) {
        console.error('Failed to delete logo:', error);
      }
    },
    isLoading: logos === undefined,
  };

  // Gallery actions
  const galleryActions = {
    onCreate: async (payload: CreateGalleryPayloadStyled) => {
      try {
        await createGalleryItem.mutate({
          title: payload.title,
          description: payload.description,
          badge: payload.badge || 'Service',
          iconName: payload.iconName || 'Camera',
          file: payload.file,
          order: payload.order ?? 0,
          isPublished: payload.isPublished ?? true,
        });
        refetchGallery();
      } catch (error) {
        console.error('Failed to create gallery item:', error);
      }
    },
    onUpdate: async (update: UpdateGalleryPayloadStyled) => {
      try {
        await updateGalleryItem.mutate({
          id: update.id,
          title: (update as any).title,
          description: (update as any).description,
          badge: (update as any).badge,
          iconName: (update as any).iconName,
          file: (update as any).file,
          order: (update as any).order,
          isPublished: (update as any).isPublished,
        });
        refetchGallery();
      } catch (error) {
        console.error('Failed to update gallery item:', error);
      }
    },
    onDelete: async (id: string) => {
      try {
        await removeGalleryItem.mutate(id);
        refetchGallery();
      } catch (error) {
        console.error('Failed to delete gallery item:', error);
      }
    },
    isLoading: galleryData === undefined,
  };

  // Booking actions
  const bookingsActions = {
    onBlock: async (dateMs: number, reason?: string) => {
      try {
        await blockDate.mutate({ dateMs, reason });
        refetchUnavailable();
      } catch (error) {
        console.error('Failed to block date:', error);
      }
    },
    onUnblock: async (dateMs: number) => {
      try {
        await unblockDate.mutate(dateMs);
        refetchUnavailable();
      } catch (error) {
        console.error('Failed to unblock date:', error);
      }
    },
    isLoading: bookings === undefined || unavailable === undefined,
  };

  // Package actions
  const packagesActions = {
    onCreate: async (payload: CreatePackagePayloadStyled) => {
      try {
        await createPackage.mutate(payload);
        refetchPackages();
      } catch (error) {
        console.error('Failed to create package:', error);
      }
    },
    onUpdate: async (update: UpdatePackagePayloadStyled) => {
      try {
        await updatePackage.mutate(update);
        refetchPackages();
      } catch (error) {
        console.error('Failed to update package:', error);
      }
    },
    onDelete: async (id: string) => {
      try {
        await removePackage.mutate(id);
        refetchPackages();
      } catch (error) {
        console.error('Failed to delete package:', error);
      }
    },
    isLoading: packages === undefined,
  };

  // Settings actions
  const settingsActions = {
    onSetHero: async (payload: { mp4?: File; webm?: File; poster?: File }) => {
      try {
        await setHeroVideo.mutate(payload);
        // Optionally show success message
      } catch (error) {
        console.error('Failed to set hero video:', error);
      }
    },
  };

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
            </div>
          </div>
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="cleanup">Cleanup & Optimization</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <AdminDashboard
                portfolio={portfolioData}
                logos={logosData}
                gallery={galleryItems}
                bookings={bookingsData}
                unavailable={unavailableData}
                packages={packagesData}
                portfolioActions={portfolioActions}
                logoActions={logoActions}
                galleryActions={galleryActions}
                bookingsActions={bookingsActions}
                packagesActions={packagesActions}
                settingsActions={settingsActions}
                onLogout={logout}
              />
            </TabsContent>
            
            <TabsContent value="cleanup">
              <CleanupDashboard adminToken="" />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;


