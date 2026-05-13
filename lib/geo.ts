/**
 * Geolocation helperlari — Haversine + bounding box.
 * Prisma `$queryRaw` orqali PostgreSQL'da hisoblanadi.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { LocationType, PriceType } from '@prisma/client';

export const EARTH_RADIUS_KM = 6371;
export const DEFAULT_RADIUS_KM = 5;
export const MAX_RADIUS_KM = 50;

export interface NearbyQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
  type?: LocationType;
  priceType?: PriceType;
  page?: number;
  pageSize?: number;
}

export interface NearbyResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  priceType: PriceType;
  priceAmount: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
}

export interface PagedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export function haversineKm(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta =
    radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180) || 1e-6);
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

interface RawNearbyRow {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  price_type: PriceType;
  price_amount: string | number | { toString(): string };
  rating: number;
  review_count: number;
  distance_km: number;
  total_count: bigint | number;
}

export async function findNearby(
  q: NearbyQuery
): Promise<PagedResult<NearbyResult>> {
  const radiusKm = Math.min(q.radiusKm ?? DEFAULT_RADIUS_KM, MAX_RADIUS_KM);
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, q.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const box = boundingBox(q.lat, q.lng, radiusKm);

  const typeFilter = q.type
    ? Prisma.sql`AND type = ${q.type}::location_type`
    : Prisma.empty;

  const priceFilter = q.priceType
    ? Prisma.sql`AND price_type = ${q.priceType}::price_type`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<RawNearbyRow[]>(Prisma.sql`
    WITH candidates AS (
      SELECT
        id, name, address, latitude, longitude,
        type, price_type, price_amount, rating, review_count,
        ${EARTH_RADIUS_KM} * 2 * ASIN(SQRT(
          POWER(SIN(RADIANS(${q.lat}::float8 - latitude) / 2), 2)
          + COS(RADIANS(${q.lat}::float8)) * COS(RADIANS(latitude))
          * POWER(SIN(RADIANS(${q.lng}::float8 - longitude) / 2), 2)
        )) AS distance_km
      FROM locations
      WHERE latitude BETWEEN ${box.minLat} AND ${box.maxLat}
        AND longitude BETWEEN ${box.minLng} AND ${box.maxLng}
        ${typeFilter}
        ${priceFilter}
    ),
    filtered AS (
      SELECT *, COUNT(*) OVER () AS total_count
      FROM candidates
      WHERE distance_km <= ${radiusKm}
    )
    SELECT *
    FROM filtered
    ORDER BY distance_km ASC
    LIMIT ${pageSize}
    OFFSET ${offset};
  `);

  const total = rows.length > 0 ? Number(rows[0]!.total_count) : 0;

  return {
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      type: r.type,
      priceType: r.price_type,
      priceAmount: r.price_amount.toString(),
      rating: r.rating,
      reviewCount: r.review_count,
      distanceKm: Number(r.distance_km.toFixed(3)),
    })),
    page,
    pageSize,
    total,
    hasMore: offset + rows.length < total,
  };
}
