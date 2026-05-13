'use client';

import { useEffect } from 'react';
import { useToilets } from '@/context/ToiletsContext';
import type { LocationType, PriceType } from '@/types';

export default function Home() {
  const {
    coords,
    locationStatus,
    locationError,
    requestLocation,
    setManualCoords,
    filters,
    setFilters,
    toilets,
    total,
    hasMore,
    loading,
    error,
    loadMore,
    refresh,
  } = useToilets();

  useEffect(() => {
    if (locationStatus === 'idle') requestLocation();
  }, [locationStatus, requestLocation]);

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Toilet.uz</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Eng yaqin hojatxonalarni toping
        </p>
      </header>

      <section className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        <LocationBar
          status={locationStatus}
          coords={coords}
          error={locationError}
          onRequest={requestLocation}
          onTashkent={() => setManualCoords({ lat: 41.3111, lng: 69.2797 })}
        />
        <FiltersBar filters={filters} onChange={setFilters} />
      </section>

      <section className="flex-1 px-6 py-4">
        {error && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-800 dark:text-red-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={refresh}
              className="underline font-medium hover:opacity-80"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {!coords && locationStatus !== 'requesting' && (
          <p className="text-center text-zinc-500 py-12">
            Boshlash uchun joylashuvga ruxsat bering yoki Toshkent markazini tanlang.
          </p>
        )}

        {loading && toilets.length === 0 && (
          <p className="text-center text-zinc-500 py-12">Yuklanmoqda…</p>
        )}

        {toilets.length > 0 && (
          <>
            <p className="text-sm text-zinc-500 mb-3">
              Topildi: <strong>{total}</strong> ta joy
            </p>
            <ul className="space-y-2">
              {toilets.map((t) => (
                <ToiletCard key={t.id} toilet={t} />
              ))}
            </ul>

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="mt-4 w-full py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
              >
                {loading ? 'Yuklanmoqda…' : 'Yana yuklash'}
              </button>
            )}
          </>
        )}

        {!loading && coords && toilets.length === 0 && !error && (
          <p className="text-center text-zinc-500 py-12">
            Bu radiusda joy topilmadi. Radiusni oshirib ko'ring.
          </p>
        )}
      </section>
    </main>
  );
}

/* ──────────────────────  Sub-components  ────────────────────── */

function LocationBar({
  status,
  coords,
  error,
  onRequest,
  onTashkent,
}: {
  status: ReturnType<typeof useToilets>['locationStatus'];
  coords: { lat: number; lng: number } | null;
  error: string | null;
  onRequest: () => void;
  onTashkent: () => void;
}) {
  if (status === 'granted' && coords) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <span className="size-2 rounded-full bg-emerald-500" /> Joylashuv aniqlandi
        </span>
        <span className="text-zinc-500">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </span>
        <button onClick={onRequest} className="ml-auto text-zinc-500 hover:underline">
          Yangilash
        </button>
      </div>
    );
  }

  if (status === 'requesting') {
    return <p className="text-sm text-zinc-500">Joylashuv aniqlanmoqda…</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onRequest}
        className="px-3 py-1.5 text-sm rounded bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
      >
        Joylashuvga ruxsat berish
      </button>
      <button
        onClick={onTashkent}
        className="px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        Toshkent markazini ishlatish
      </button>
      {(status === 'denied' || status === 'error') && (
        <span className="text-xs text-red-600 dark:text-red-400">
          {error ?? 'Joylashuv olinmadi'}
        </span>
      )}
    </div>
  );
}

function FiltersBar({
  filters,
  onChange,
}: {
  filters: ReturnType<typeof useToilets>['filters'];
  onChange: ReturnType<typeof useToilets>['setFilters'];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-zinc-500">Radius:</span>
        <select
          value={filters.radiusKm}
          onChange={(e) => onChange({ radiusKm: Number(e.target.value) })}
          className="border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-2 py-1"
        >
          {[1, 3, 5, 10, 20, 50].map((r) => (
            <option key={r} value={r}>{r} km</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-zinc-500">Turi:</span>
        <select
          value={filters.type ?? ''}
          onChange={(e) =>
            onChange({ type: (e.target.value || undefined) as LocationType | undefined })
          }
          className="border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-2 py-1"
        >
          <option value="">Hammasi</option>
          <option value="public">Jamoat</option>
          <option value="mall">Savdo markazi</option>
          <option value="fuel">Yoqilg'i</option>
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-zinc-500">Narx:</span>
        <select
          value={filters.priceType ?? ''}
          onChange={(e) =>
            onChange({ priceType: (e.target.value || undefined) as PriceType | undefined })
          }
          className="border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-2 py-1"
        >
          <option value="">Hammasi</option>
          <option value="free">Bepul</option>
          <option value="paid">Pulli</option>
        </select>
      </label>
    </div>
  );
}

function ToiletCard({
  toilet,
}: {
  toilet: ReturnType<typeof useToilets>['toilets'][number];
}) {
  const typeLabel: Record<LocationType, string> = {
    public: 'Jamoat',
    mall: 'Savdo markazi',
    fuel: 'Yoqilg\'i shoxobchasi',
  };

  return (
    <li className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium truncate">{toilet.name}</h3>
          <p className="text-sm text-zinc-500 truncate">{toilet.address}</p>
        </div>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {toilet.distanceKm.toFixed(2)} km
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <Badge>{typeLabel[toilet.type]}</Badge>
        <Badge variant={toilet.priceType === 'free' ? 'green' : 'amber'}>
          {toilet.priceType === 'free'
            ? 'Bepul'
            : `${Number(toilet.priceAmount).toLocaleString('uz-UZ')} so'm`}
        </Badge>
        {toilet.reviewCount > 0 && (
          <span className="text-zinc-500">
            ⭐ {toilet.rating.toFixed(1)} ({toilet.reviewCount})
          </span>
        )}
      </div>
    </li>
  );
}

function Badge({
  children,
  variant = 'zinc',
}: {
  children: React.ReactNode;
  variant?: 'zinc' | 'green' | 'amber';
}) {
  const styles: Record<'zinc' | 'green' | 'amber', string> = {
    zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
    green: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
}
