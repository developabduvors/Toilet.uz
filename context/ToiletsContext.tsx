'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api-client';
import type {
  Coords,
  NearbyFilters,
  Toilet,
  Paged,
} from '@/lib/types';

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

interface ToiletsContextValue {
  coords: Coords | null;
  locationStatus: LocationStatus;
  locationError: string | null;
  requestLocation: () => void;
  setManualCoords: (c: Coords) => void;

  filters: NearbyFilters;
  setFilters: (next: Partial<NearbyFilters>) => void;

  toilets: Toilet[];
  page: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;

  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const DEFAULT_FILTERS: NearbyFilters = { radiusKm: 5 };

const ToiletsContext = createContext<ToiletsContextValue | null>(null);

export function ToiletsProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<NearbyFilters>(DEFAULT_FILTERS);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation API not available.');
      return;
    }
    setLocationStatus('requesting');
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      (err) => {
        setLocationStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
        setLocationError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  }, []);

  const setManualCoords = useCallback((c: Coords) => {
    setCoords(c);
    setLocationStatus('granted');
  }, []);

  const setFilters = useCallback((next: Partial<NearbyFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
  }, []);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!coords) return;
      const reqId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const result: Paged<Toilet> = await api.nearby(
          coords,
          filters,
          targetPage,
          20
        );
        if (reqId !== requestIdRef.current) return;
        setToilets((prev) => (append ? [...prev, ...result.data] : result.data));
        setPage(result.page);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (e) {
        if (reqId !== requestIdRef.current) return;
        setError(e instanceof Error ? e.message : 'Failed to load toilets');
      } finally {
        if (reqId === requestIdRef.current) setLoading(false);
      }
    },
    [coords, filters]
  );

  useEffect(() => {
    if (coords) fetchPage(1, false);
  }, [coords, filters, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchPage(page + 1, true);
  }, [loading, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const value = useMemo<ToiletsContextValue>(
    () => ({
      coords,
      locationStatus,
      locationError,
      requestLocation,
      setManualCoords,
      filters,
      setFilters,
      toilets,
      page,
      total,
      hasMore,
      loading,
      error,
      loadMore,
      refresh,
      selectedId,
      setSelectedId,
    }),
    [
      coords,
      locationStatus,
      locationError,
      requestLocation,
      setManualCoords,
      filters,
      setFilters,
      toilets,
      page,
      total,
      hasMore,
      loading,
      error,
      loadMore,
      refresh,
      selectedId,
    ]
  );

  return (
    <ToiletsContext.Provider value={value}>{children}</ToiletsContext.Provider>
  );
}

export function useToilets(): ToiletsContextValue {
  const ctx = useContext(ToiletsContext);
  if (!ctx) {
    throw new Error('useToilets must be used inside <ToiletsProvider>');
  }
  return ctx;
}
