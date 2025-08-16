import { useState, useEffect, useCallback } from 'react';
import { apiHelpers } from '@/lib/api';

// Generic API hook with loading, error, and data states
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = [],
  options: { enabled?: boolean; refetchOnWindowFocus?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { enabled = true, refetchOnWindowFocus = false } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API query error:', err);
    } finally {
      setLoading(false);
    }
  }, [queryFn, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  // Optional: refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchData, refetchOnWindowFocus]);

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

// Mutation hook for POST/PUT/DELETE operations
export function useApiMutation<TParams, TResult>(
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
      console.error('API mutation error:', error);
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

// Specific hooks for different API endpoints

// Gallery hooks
export function useGalleryPublic() {
  return useApiQuery(
    () => apiHelpers.gallery.getPublic(),
    [],
    { refetchOnWindowFocus: true }
  );
}

export function useGalleryAdmin() {
  return useApiQuery(
    () => apiHelpers.gallery.getAdmin(),
    []
  );
}

export function useCreateGalleryItem() {
  return useApiMutation(
    (data: any) => apiHelpers.gallery.create(data)
  );
}

export function useUpdateGalleryItem() {
  return useApiMutation(
    ({ id, ...data }: { id: string } & any) => apiHelpers.gallery.update(id, data)
  );
}

export function useDeleteGalleryItem() {
  return useApiMutation(
    (id: string) => apiHelpers.gallery.delete(id)
  );
}

// Portfolio hooks
export function usePortfolioPublic() {
  return useApiQuery(
    () => apiHelpers.portfolio.getPublic(),
    [],
    { refetchOnWindowFocus: true }
  );
}

export function usePortfolioAdmin() {
  return useApiQuery(
    () => apiHelpers.portfolio.getAdmin(),
    []
  );
}

export function useCreatePortfolioAlbum() {
  return useApiMutation(
    (data: any) => apiHelpers.portfolio.createAlbum(data)
  );
}

export function useUpdatePortfolioAlbum() {
  return useApiMutation(
    ({ id, ...data }: { id: string } & any) => apiHelpers.portfolio.updateAlbum(id, data)
  );
}

export function useDeletePortfolioAlbum() {
  return useApiMutation(
    (id: string) => apiHelpers.portfolio.deleteAlbum(id)
  );
}

export function useAddPortfolioPhoto() {
  return useApiMutation(
    ({ albumId, ...data }: { albumId: string } & any) => apiHelpers.portfolio.addPhoto(albumId, data)
  );
}

// File upload hooks
export function useFileUpload() {
  const [progress, setProgress] = useState(0);

  const mutation = useApiMutation(
    ({ file, category }: { file: File; category?: string }) => 
      apiHelpers.files.upload(file, category, setProgress)
  );

  return {
    ...mutation,
    progress,
  };
}

export function useMultipleFileUpload() {
  return useApiMutation(
    ({ files, category }: { files: File[]; category?: string }) => 
      apiHelpers.files.uploadMultiple(files, category)
  );
}

// Auth hooks (re-exported from auth service)
export { useAuth } from '@/lib/auth';

// Combined hook for admin data (used in dashboard)
export function useAdminData() {
  const gallery = useGalleryAdmin();
  const portfolio = usePortfolioAdmin();
  
  return {
    gallery,
    portfolio,
    isLoading: gallery.loading || portfolio.loading,
    hasError: gallery.error || portfolio.error,
    refetchAll: () => {
      gallery.refetch();
      portfolio.refetch();
    },
  };
}
