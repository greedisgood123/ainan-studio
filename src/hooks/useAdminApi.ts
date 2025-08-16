/**
 * Admin-specific API hooks for dashboard functionality
 * These hooks provide admin API functionality for the local backend
 */

import { useState, useEffect, useCallback } from 'react';
import { apiHelpers, apiClient, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// Generic admin query hook with auth
function useAdminQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = [],
  options: { enabled?: boolean } = {}
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const { enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!enabled || !isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Admin API query error:', err);
    } finally {
      setLoading(false);
    }
  }, [queryFn, enabled, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Admin mutation hook
function useAdminMutation<TParams, TResult>(
  mutationFn: (params: TParams) => Promise<TResult>,
  options: {
    onSuccess?: (data: TResult, variables: TParams) => void;
    onError?: (error: Error, variables: TParams) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError } = options;

  const mutate = useCallback(async (params: TParams): Promise<TResult | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(params);
      onSuccess?.(result, params);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error.message);
      onError?.(error, params);
      console.error('Admin API mutation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError]);

  return {
    mutate,
    loading,
    error,
  };
}

// Auth hooks
export function useAdminProfile() {
  return useAdminQuery(() => apiHelpers.auth.getProfile());
}

// Client Logos hooks
export function useClientLogos() {
  return useAdminQuery(async () => {
    const response = await apiClient.get(api.clientLogos.list);
    return apiHelpers.handleResponse(response);
  });
}

export function useCreateClientLogo() {
  return useAdminMutation(async ({ name, file, order }: { name: string; file: File; order: number }) => {
    // Upload file first
    const uploadResponse = await apiClient.uploadFile(api.files.upload, file, { category: 'logos' });
    const uploadResult = await apiHelpers.handleResponse(uploadResponse);
    
    // Create logo record
    const createResponse = await apiClient.post(api.clientLogos.create, {
      name,
      logoUrl: uploadResult.url,
      order
    });
    return apiHelpers.handleResponse(createResponse);
  });
}

export function useUpdateClientLogo() {
  return useAdminMutation(async ({ id, name, file, order }: { id: string; name?: string; file?: File; order?: number }) => {
    let logoUrl;
    
    if (file) {
      const uploadResponse = await apiClient.uploadFile(api.files.upload, file, { category: 'logos' });
      const uploadResult = await apiHelpers.handleResponse(uploadResponse);
      logoUrl = uploadResult.url;
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (order !== undefined) updateData.order = order;
    
    const response = await apiClient.put(api.clientLogos.update(id), updateData);
    return apiHelpers.handleResponse(response);
  });
}

export function useDeleteClientLogo() {
  return useAdminMutation(async (id: string) => {
    const response = await apiClient.delete(api.clientLogos.delete(id));
    return apiHelpers.handleResponse(response);
  });
}

// Portfolio hooks
export function usePortfolioAdmin() {
  return useAdminQuery(async () => {
    const response = await apiClient.get(api.portfolio.admin);
    return apiHelpers.handleResponse(response);
  });
}

export function useCreatePortfolioAlbum() {
  return useAdminMutation(async ({ title, description, category, file, order, isPublished }: {
    title: string;
    description: string;
    category: string;
    file?: File;
    order?: number;
    isPublished?: boolean;
  }) => {
    let coverImageUrl;
    
    if (file) {
      const uploadResponse = await apiClient.uploadFile(api.files.upload, file, { category: 'portfolio' });
      const uploadResult = await apiHelpers.handleResponse(uploadResponse);
      coverImageUrl = uploadResult.url;
    }
    
    const response = await apiClient.post(api.portfolio.createAlbum, {
      title,
      description,
      category,
      coverImageUrl,
      order: order || 0,
      isPublished: isPublished !== false
    });
    return apiHelpers.handleResponse(response);
  });
}

export function useUpdatePortfolioAlbum() {
  return useAdminMutation(async ({ id, title, description, category, file, order, isPublished }: {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    file?: File;
    order?: number;
    isPublished?: boolean;
  }) => {
    let coverImageUrl;
    
    if (file) {
      const uploadResponse = await apiClient.uploadFile(api.files.upload, file, { category: 'portfolio' });
      const uploadResult = await apiHelpers.handleResponse(uploadResponse);
      coverImageUrl = uploadResult.url;
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (order !== undefined) updateData.order = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    const response = await apiClient.put(api.portfolio.updateAlbum(id), updateData);
    return apiHelpers.handleResponse(response);
  });
}

export function useDeletePortfolioAlbum() {
  return useAdminMutation(async (id: string) => {
    const response = await apiClient.delete(api.portfolio.deleteAlbum(id));
    return apiHelpers.handleResponse(response);
  });
}

export function useAddPortfolioPhoto() {
  return useAdminMutation(async ({ albumId, file, caption, order }: {
    albumId: string;
    file: File;
    caption?: string;
    order?: number;
  }) => {
    // Upload file first
    const uploadResponse = await apiClient.uploadFile(api.files.upload, file, { category: 'portfolio' });
    const uploadResult = await apiHelpers.handleResponse(uploadResponse);
    
    // Add photo to album
    const response = await apiClient.post(api.portfolio.addPhoto(albumId), {
      imageUrl: uploadResult.url,
      caption,
      order: order || 0
    });
    return apiHelpers.handleResponse(response);
  });
}

// Packages hooks
export function usePackagesAdmin() {
  return useAdminQuery(async () => {
    const response = await apiClient.get(api.packages.admin);
    return apiHelpers.handleResponse(response);
  });
}

export function useCreatePackage() {
  return useAdminMutation(async (packageData: {
    title: string;
    price: string;
    description: string;
    features: string[];
    addOns: Array<{ name: string; price: string }>;
    isPopular?: boolean;
    badge?: string;
    order?: number;
    isPublished?: boolean;
  }) => {
    const response = await apiClient.post(api.packages.create, packageData);
    return apiHelpers.handleResponse(response);
  });
}

export function useUpdatePackage() {
  return useAdminMutation(async ({ id, ...packageData }: { id: string } & Partial<{
    title: string;
    price: string;
    description: string;
    features: string[];
    addOns: Array<{ name: string; price: string }>;
    isPopular: boolean;
    badge: string;
    order: number;
    isPublished: boolean;
  }>) => {
    const response = await apiClient.put(api.packages.update(id), packageData);
    return apiHelpers.handleResponse(response);
  });
}

export function useDeletePackage() {
  return useAdminMutation(async (id: string) => {
    const response = await apiClient.delete(api.packages.delete(id));
    return apiHelpers.handleResponse(response);
  });
}

// Bookings hooks
export function useBookingsAdmin() {
  return useAdminQuery(async () => {
    const response = await apiClient.get(api.bookings.admin);
    return apiHelpers.handleResponse(response);
  });
}

export function useUnavailableDates() {
  return useAdminQuery(async () => {
    const response = await apiClient.get(api.unavailableDates.list);
    return apiHelpers.handleResponse(response);
  });
}

export function useBlockDate() {
  return useAdminMutation(async ({ dateMs, reason }: { dateMs: number; reason?: string }) => {
    const response = await apiClient.post(api.unavailableDates.block, { dateMs, reason });
    return apiHelpers.handleResponse(response);
  });
}

export function useUnblockDate() {
  return useAdminMutation(async (dateMs: number) => {
    const response = await apiClient.delete(api.unavailableDates.unblock(dateMs));
    return apiHelpers.handleResponse(response);
  });
}

// Gallery hooks (admin)
export function useGalleryAdmin() {
  return useAdminQuery(async () => {
    const response = await apiClient.get(api.gallery.admin);
    return apiHelpers.handleResponse(response);
  });
}

export function useCreateGalleryItem() {
  return useAdminMutation(async ({ title, description, badge, iconName, file, order, isPublished }: {
    title: string;
    description: string;
    badge: string;
    iconName: string;
    file?: File;
    order?: number;
    isPublished?: boolean;
  }) => {
    let imageUrl;
    
    if (file) {
      const uploadResponse = await apiClient.uploadFile(api.files.upload, file, { category: 'gallery' });
      const uploadResult = await apiHelpers.handleResponse(uploadResponse);
      imageUrl = uploadResult.url;
    }
    
    const response = await apiClient.post(api.gallery.create, {
      title,
      description,
      badge,
      iconName,
      imageUrl,
      orderIndex: order || 0,
      isPublished: isPublished !== false
    });
    return apiHelpers.handleResponse(response);
  });
}

export function useUpdateGalleryItem() {
  return useAdminMutation(async ({ id, title, description, badge, iconName, file, order, isPublished }: {
    id: string;
    title?: string;
    description?: string;
    badge?: string;
    iconName?: string;
    file?: File;
    order?: number;
    isPublished?: boolean;
  }) => {
    let imageUrl;
    
    if (file) {
      const uploadResponse = await apiClient.uploadFile(api.files.upload, file, { category: 'gallery' });
      const uploadResult = await apiHelpers.handleResponse(uploadResponse);
      imageUrl = uploadResult.url;
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (badge !== undefined) updateData.badge = badge;
    if (iconName !== undefined) updateData.iconName = iconName;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (order !== undefined) updateData.orderIndex = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    const response = await apiClient.put(api.gallery.update(id), updateData);
    return apiHelpers.handleResponse(response);
  });
}

export function useDeleteGalleryItem() {
  return useAdminMutation(async (id: string) => {
    const response = await apiClient.delete(api.gallery.delete(id));
    return apiHelpers.handleResponse(response);
  });
}

// Site Settings hooks
export function useSetHeroVideo() {
  return useAdminMutation(async ({ mp4, webm, poster }: { mp4?: File; webm?: File; poster?: File }) => {
    const uploads: any = {};
    
    if (mp4) {
      const response = await apiClient.uploadFile(api.files.upload, mp4, { category: 'settings' });
      const result = await apiHelpers.handleResponse(response);
      uploads.mp4Url = result.url;
    }
    
    if (webm) {
      const response = await apiClient.uploadFile(api.files.upload, webm, { category: 'settings' });
      const result = await apiHelpers.handleResponse(response);
      uploads.webmUrl = result.url;
    }
    
    if (poster) {
      const response = await apiClient.uploadFile(api.files.upload, poster, { category: 'settings' });
      const result = await apiHelpers.handleResponse(response);
      uploads.posterUrl = result.url;
    }
    
    const response = await apiClient.post(api.siteSettings.setHero, uploads);
    return apiHelpers.handleResponse(response);
  });
}

// File upload utility
export function useFileUploadWithProgress() {
  const [progress, setProgress] = useState(0);
  
  const uploadFile = useCallback(async (file: File, category?: string) => {
    const response = await apiClient.uploadFile(
      api.files.upload, 
      file, 
      category ? { category } : undefined,
      setProgress
    );
    return apiHelpers.handleResponse(response);
  }, []);

  return {
    uploadFile,
    progress,
  };
}
