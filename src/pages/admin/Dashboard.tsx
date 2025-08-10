import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./styled/app-sidebar";
import { AdminDashboard } from "./styled/admin-dashboard";
import type { PortfolioItem as StyledPortfolioItem, CreatePortfolioPayload as CreatePortfolioPayloadStyled, UpdatePortfolioPayload as UpdatePortfolioPayloadStyled } from "./styled/sections/portfolio-section";
import type { LogoItem as StyledLogoItem, CreateLogoPayload as CreateLogoPayloadStyled, UpdateLogoPayload as UpdateLogoPayloadStyled } from "./styled/sections/logos-section";
import type { GalleryItem as StyledGalleryItem, CreateGalleryPayload as CreateGalleryPayloadStyled, UpdateGalleryPayload as UpdateGalleryPayloadStyled } from "./styled/sections/gallery-section";
import type { BookingItem as StyledBookingItem, UnavailableDate as StyledUnavailableDate } from "./styled/sections/bookings-section";
import type { PackageItem as StyledPackageItem, CreatePackagePayload as CreatePackagePayloadStyled, UpdatePackagePayload as UpdatePackagePayloadStyled } from "./styled/sections/packages-section";
import type { Id } from "../../../convex/_generated/dataModel";

const Dashboard = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : null;
  const me = useQuery(api.auth.me, token ? { token } : "skip");
  const logos = useQuery(api.clientLogos.list, {});
  const gallery = useQuery(api.gallery.listAdmin, token ? { token } : "skip");
  const bookings = useQuery(api.bookings.listAdmin, token ? { token } : "skip");
  const unavailable = useQuery(api.unavailableDates.list, token ? { token } : "skip");
  const createLogo = useMutation(api.clientLogos.create);
  const updateLogo = useMutation(api.clientLogos.update);
  const removeLogo = useMutation(api.clientLogos.remove);
  const getUploadUrl = useMutation(api.files.getUploadUrl);
  const createGallery = useMutation(api.gallery.create);
  const updateGallery = useMutation(api.gallery.update);
  const removeGallery = useMutation(api.gallery.remove);
  const portfolio = useQuery(api.portfolio.listAdmin, token ? { token } : "skip");
  const createPortfolio = useMutation(api.portfolio.create);
  const updatePortfolio = useMutation(api.portfolio.update);
  const removePortfolio = useMutation(api.portfolio.remove);
  const blockDate = useMutation(api.unavailableDates.block);
  const unblockDate = useMutation(api.unavailableDates.unblock);
  const packages = useQuery(api.packages.listAdmin, token ? { token } : "skip");
  const createPackage = useMutation(api.packages.create);
  const updatePackage = useMutation(api.packages.update);
  const removePackage = useMutation(api.packages.remove);

  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const [newCategory, setNewCategory] = useState<string>("Livefeed");
  const categories = ["Weddings", "Corporate", "Livefeed"] as const;

  useEffect(() => {
    if (me === null) {
      window.location.hash = "#/admin/login";
    }
  }, [me]);

  if (me === undefined) return null; // loading
  if (me === null) return null; // redirected

  const handleCreate = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];
    const { uploadUrl } = await getUploadUrl({ token: token! });
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await res.json();
    await createLogo({ token: token!, name: newName || file.name, logoStorageId: storageId, order: Number(newOrder) || 0 });
    setNewName("");
    setNewOrder(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Map data to styled components' types
  const portfolioData: StyledPortfolioItem[] = (portfolio || []).map((p: any) => ({
    _id: p._id,
    title: p.title,
    description: p.description,
    category: p.category,
    imageUrl: p.imageUrl ?? (p.imageStorageId ? `/_storage/${p.imageStorageId}` : undefined),
    order: p.order,
    isPublished: p.isPublished,
  }));

  const logosData: StyledLogoItem[] = (logos || []).map((l: any) => ({
    _id: l._id,
    name: l.name,
    logoUrl: l.logoStorageId ? `/_storage/${l.logoStorageId}` : undefined,
    order: l.order,
  }));

  const galleryData: StyledGalleryItem[] = (gallery || []).map((g: any) => ({
    _id: g._id,
    title: g.title,
    description: g.description,
    badge: g.badge,
    iconName: g.iconName,
    imageUrl: g.imageStorageId ? `/_storage/${g.imageStorageId}` : undefined,
    order: g.order,
    isPublished: g.isPublished,
  }));

  const bookingsData: StyledBookingItem[] = (bookings || []).map((b: any) => ({
    _id: b._id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    desiredDateMs: b.desiredDateMs,
    packageName: b.packageName,
    status: b.status,
    createdAt: b.createdAt,
  }));

  const unavailableData: StyledUnavailableDate[] = (unavailable || []).map((u: any) => ({
    _id: u._id,
    dateMs: u.dateMs,
    reason: u.reason,
  }));

  const packagesData: StyledPackageItem[] = (packages || []).map((p: any) => ({
    _id: p._id,
    title: p.title,
    price: p.price,
    description: p.description,
    features: p.features,
    addOns: p.addOns,
    isPopular: p.isPopular,
    badge: p.badge,
    order: p.order,
    isPublished: p.isPublished,
  }));

  const portfolioActions = {
    onCreate: async (payload: CreatePortfolioPayloadStyled) => {
      const file = payload.file;
      let storageId: string | undefined = undefined;
      if (file) {
        const { uploadUrl } = await getUploadUrl({ token: token! });
        const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        const json = await res.json();
        storageId = json.storageId;
      }
      await createPortfolio({
        token: token!,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        imageStorageId: storageId as Id<"_storage">,
        order: payload.order ?? 0,
        isPublished: payload.isPublished ?? true,
      });
    },
    onUpdate: async (update: UpdatePortfolioPayloadStyled) => {
      if ((update as any).file) {
        const file = (update as any).file as File;
        const { uploadUrl } = await getUploadUrl({ token: token! });
        const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        const json = await res.json();
        await updatePortfolio({ token: token!, id: update.id as Id<"portfolio_items">, imageStorageId: json.storageId as Id<"_storage"> });
      }
      const { id, file: _f, ...rest } = update as any;
      if (Object.keys(rest).length > 0) {
        await updatePortfolio({ token: token!, id: id as Id<"portfolio_items">, ...(rest as any) });
      }
    },
    onDelete: async (id: string) => {
      await removePortfolio({ token: token!, id: id as Id<"portfolio_items"> });
    },
    isLoading: portfolio === undefined,
  };

  const logoActions = {
    onCreate: async (payload: CreateLogoPayloadStyled) => {
      const file = payload.file;
      if (!file) return;
      const { uploadUrl } = await getUploadUrl({ token: token! });
      const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const json = await res.json();
      await createLogo({ token: token!, name: payload.name, logoStorageId: json.storageId as Id<"_storage">, order: payload.order ?? 0 });
    },
    onUpdate: async (update: UpdateLogoPayloadStyled) => {
      if ((update as any).file) {
        const file = (update as any).file as File;
        const { uploadUrl } = await getUploadUrl({ token: token! });
        const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        const json = await res.json();
        await updateLogo({ token: token!, id: update.id as Id<"client_logos">, logoStorageId: json.storageId as Id<"_storage"> });
      }
      const { id, file: _f, ...rest } = update as any;
      if (Object.keys(rest).length > 0) {
        await updateLogo({ token: token!, id: id as Id<"client_logos">, ...(rest as any) });
      }
    },
    onDelete: async (id: string) => {
      await removeLogo({ token: token!, id: id as Id<"client_logos"> });
    },
    isLoading: logos === undefined,
  };

  const galleryActions = {
    onCreate: async (payload: CreateGalleryPayloadStyled) => {
      const file = payload.file;
      let storageId: string | undefined = undefined;
      if (file) {
        const { uploadUrl } = await getUploadUrl({ token: token! });
        const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        const json = await res.json();
        storageId = json.storageId;
      }
      await createGallery({
        token: token!,
        title: payload.title,
        description: payload.description,
        badge: payload.badge ?? 'Badge',
        iconName: payload.iconName ?? 'Play',
        order: payload.order ?? 0,
        isPublished: payload.isPublished ?? true,
        imageStorageId: storageId as Id<"_storage"> | undefined,
      });
    },
    onUpdate: async (update: UpdateGalleryPayloadStyled) => {
      if ((update as any).file) {
        const file = (update as any).file as File;
        const { uploadUrl } = await getUploadUrl({ token: token! });
        const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        const json = await res.json();
        await updateGallery({ token: token!, id: update.id as Id<"gallery_items">, imageStorageId: json.storageId as Id<"_storage"> });
      }
      const { id, file: _f, ...rest } = update as any;
      if (Object.keys(rest).length > 0) {
        await updateGallery({ token: token!, id: id as Id<"gallery_items">, ...(rest as any) });
      }
    },
    onDelete: async (id: string) => {
      await removeGallery({ token: token!, id: id as Id<"gallery_items"> });
    },
    isLoading: gallery === undefined,
  };

  const bookingsActions = {
    onBlock: async (dateMs: number, reason?: string) => {
      await blockDate({ token: token!, dateMs, reason });
    },
    onUnblock: async (dateMs: number) => {
      await unblockDate({ token: token!, dateMs });
    },
    isLoading: bookings === undefined || unavailable === undefined,
  };

  const packagesActions = {
    onCreate: async (payload: CreatePackagePayloadStyled) => {
      await createPackage({ token: token!, ...payload });
    },
    onUpdate: async (update: UpdatePackagePayloadStyled) => {
      const { id, ...rest } = update as any;
      if (Object.keys(rest).length > 0) {
        await updatePackage({ token: token!, id: id as any, ...(rest as any) });
      }
    },
    onDelete: async (id: string) => {
      await removePackage({ token: token!, id: id as any });
    },
    isLoading: packages === undefined,
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
          <AdminDashboard
            portfolio={portfolioData}
            logos={logosData}
            gallery={galleryData}
            bookings={bookingsData}
            unavailable={unavailableData}
            packages={packagesData}
            portfolioActions={portfolioActions}
            logoActions={logoActions}
            galleryActions={galleryActions}
            bookingsActions={bookingsActions}
            packagesActions={packagesActions}
            onLogout={() => { localStorage.removeItem("admin_token"); window.location.hash = "#/admin/login"; }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;


