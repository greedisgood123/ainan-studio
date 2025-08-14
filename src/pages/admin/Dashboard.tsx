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
  const bookings = useQuery(api.bookings.listAdmin, token ? { token } : "skip");
  const unavailable = useQuery(api.unavailableDates.list, token ? { token } : "skip");
  const createLogo = useMutation(api.clientLogos.create);
  const updateLogo = useMutation(api.clientLogos.update);
  const removeLogo = useMutation(api.clientLogos.remove);
  const getUploadUrl = useMutation(api.files.getUploadUrl);
  const portfolio = useQuery(api.portfolio.listAdmin, token ? { token } : "skip");
  const createAlbum = useMutation(api.portfolio.createAlbum);
  const updateAlbum = useMutation(api.portfolio.updateAlbum);
  const removeAlbum = useMutation(api.portfolio.removeAlbum);
  const addPhoto = useMutation(api.portfolio.addPhoto);
  const blockDate = useMutation(api.unavailableDates.block);
  const unblockDate = useMutation(api.unavailableDates.unblock);
  const packages = useQuery(api.packages.listAdmin, token ? { token } : "skip");
  const createPackage = useMutation(api.packages.create);
  const updatePackage = useMutation(api.packages.update);
  const removePackage = useMutation(api.packages.remove);
  const setHeroVideo = useMutation(api.siteSettings.setHeroVideo);

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
    coverUrl: p.coverUrl ?? (p.coverImageStorageId ? `/_storage/${p.coverImageStorageId}` : undefined),
    order: p.order,
    isPublished: p.isPublished,
  }));

  const logosData: StyledLogoItem[] = (logos || []).map((l: any) => ({
    _id: l._id,
    name: l.name,
    logoUrl: l.logoStorageId ? `/_storage/${l.logoStorageId}` : undefined,
    order: l.order,
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
      await createAlbum({
        token: token!,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        coverImageStorageId: storageId as Id<'_storage'> | undefined,
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
        await updateAlbum({ token: token!, id: update.id as Id<'portfolio_albums'>, coverImageStorageId: json.storageId as Id<'_storage'> });
      }
      const { id, file: _f, ...rest } = update as any;
      if (Object.keys(rest).length > 0) {
        await updateAlbum({ token: token!, id: id as Id<'portfolio_albums'>, ...(rest as any) });
      }
    },
    onDelete: async (id: string) => {
      await removeAlbum({ token: token!, id: id as Id<'portfolio_albums'> });
    },
    isLoading: portfolio === undefined,
    uploadToStorage: async (file: File | Blob, onProgress?: (pct: number) => void) => {
      const { uploadUrl } = await getUploadUrl({ token: token! });
      return await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", (file as Blob).type || "application/octet-stream");
        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              onProgress(pct);
            }
          };
        }
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve(json.storageId as string);
          } catch (e) {
            reject(e);
          }
        };
        xhr.send(file);
      });
    },
    createFromStorage: async (meta: {
      title: string;
      description: string;
      category: string;
      storageId: string;
      order?: number;
      isPublished?: boolean;
    }) => {
      // kept for compatibility if needed
    },
    addPhotoToAlbum: async (albumId: string, storageId: string, order: number) => {
      await addPhoto({ token: token!, albumId: albumId as Id<'portfolio_albums'>, imageStorageId: storageId as Id<'_storage'>, order });
    },
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

  const settingsActions = {
    onSetHero: async (payload: { mp4?: File; webm?: File; poster?: File }) => {
      const uploads: { mp4StorageId?: string; webmStorageId?: string; posterStorageId?: string } = {};
      try {
        if (payload.mp4) {
          const { uploadUrl } = await getUploadUrl({ token: token! });
          const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': payload.mp4.type }, body: payload.mp4 });
          const json = await res.json();
          uploads.mp4StorageId = json.storageId as string;
        }
        if (payload.webm) {
          const { uploadUrl } = await getUploadUrl({ token: token! });
          const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': payload.webm.type }, body: payload.webm });
          const json = await res.json();
          uploads.webmStorageId = json.storageId as string;
        }
        if (payload.poster) {
          const { uploadUrl } = await getUploadUrl({ token: token! });
          const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': payload.poster.type }, body: payload.poster });
          const json = await res.json();
          uploads.posterStorageId = json.storageId as string;
        }
        await setHeroVideo({ token: token!, ...(uploads as any) });
      } catch (err) {
        // swallow to avoid crashing the dashboard, surface via console for now
        console.error('Failed to set hero media:', err);
        throw err;
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
          <AdminDashboard
            portfolio={portfolioData}
            logos={logosData}
            bookings={bookingsData}
            unavailable={unavailableData}
            packages={packagesData}
            portfolioActions={portfolioActions}
            logoActions={logoActions}
            bookingsActions={bookingsActions}
            packagesActions={packagesActions}
            settingsActions={settingsActions}
            onLogout={() => { localStorage.removeItem("admin_token"); window.location.hash = "#/admin/login"; }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;


