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
  options: { enabled?: boolean; pollingInterval?: number } = {}
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const { enabled = true, pollingInterval } = options;

  // Memoize the query function to prevent unnecessary re-renders
  const memoizedQueryFn = useCallback(queryFn, deps);

  const fetchData = useCallback(async () => {
    if (!enabled || !isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await memoizedQueryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Admin API query error:', err);
    } finally {
      setLoading(false);
    }
  }, [memoizedQueryFn, enabled, isAuthenticated]);

  useEffect(() => {
    fetchData();
    
    // Set up polling if interval is provided
    if (pollingInterval && enabled && isAuthenticated) {
      const interval = setInterval(fetchData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollingInterval, enabled, isAuthenticated]);

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

// Bookings hooks - ACTUALLY USED
export function useBookingsAdmin() {
  return useAdminQuery(async () => {
    return apiHelpers.bookings.getAdmin();
  }, [], { pollingInterval: 30000 }); // Poll every 30 seconds
}

export function useUnavailableDates() {
  return useAdminQuery(async () => {
    return apiHelpers.unavailableDates.getList();
  }, [], { pollingInterval: 30000 }); // Poll every 30 seconds
}

// Booking status update hook
export function useUpdateBookingStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiHelpers.bookings.updateStatus(id, status);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error.message);
      console.error('Update booking status error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateStatus,
    loading,
    error,
  };
}

// Unavailable dates management hooks
export function useAddUnavailableDate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDate = useCallback(async (dateMs: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiHelpers.unavailableDates.add(dateMs, reason);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error.message);
      console.error('Add unavailable date error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addDate,
    loading,
    error,
  };
}

export function useRemoveUnavailableDate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeDate = useCallback(async (dateMs: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiHelpers.unavailableDates.remove(dateMs);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error.message);
      console.error('Remove unavailable date error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    removeDate,
    loading,
    error,
  };
}
