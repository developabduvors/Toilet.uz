/**
 * Toilet.uz — Frontend Types (yagona entry point)
 * --------------------------------------------------------------------------
 * Frontend dasturchilar uchun barcha API shartnomalari shu yerda.
 *
 *   import type {
 *     Toilet, Review, Paged,
 *     NearbyResponse, AddToiletRequest, CreateReviewRequest,
 *   } from '@/types';
 *
 * Bu fayl `@prisma/client` enumlarini frontend'ga "ochib bermaydi" — chunki
 * frontend Prisma'ga bog'liq bo'lishi kerak emas. Enum'lar string literal
 * tipi sifatida e'lon qilingan va Prisma schema bilan sinxron tutiladi.
 */

/* ─────────────────────────  Enums  ────────────────────────── */

export type LocationType = 'public' | 'mall' | 'fuel';
export type PriceType = 'free' | 'paid';

/* ────────────────────────  Entities  ──────────────────────── */

export interface UserPublic {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Toilet {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  priceType: PriceType;
  /** Decimal string — masalan, "2000.00". `Number(t.priceAmount)` ishlatilsin. */
  priceAmount: string;
  /** 0–5 oraliqda. */
  rating: number;
  reviewCount: number;
  /** Faqat `/nearby` javobida bo'ladi — joriy koordinatadan masofa. */
  distanceKm: number;
}

/** `/api/toilets/[id]` javobidagi `location` — `distanceKm`siz, `createdAt` bilan. */
export interface ToiletFull extends Omit<Toilet, 'distanceKm'> {
  createdById: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  locationId: string;
  userId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  user?: UserPublic | null;
}

/* ────────────────────────  Common  ────────────────────────── */

export interface Paged<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiFailure {
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function isApiFailure<T>(r: ApiResponse<T>): r is ApiFailure {
  return typeof (r as ApiFailure).error === 'string';
}

export function isApiSuccess<T>(r: ApiResponse<T>): r is ApiSuccess<T> {
  return !isApiFailure(r);
}

/* ────────────────  GET /api/toilets/nearby  ───────────────── */

export interface NearbyQuery {
  lat: number;
  lng: number;
  /** km, default 5, max 50. */
  radius?: number;
  type?: LocationType;
  priceType?: PriceType;
  page?: number;
  /** 1–50, default 20. */
  pageSize?: number;
}

export type NearbyResponse = Paged<Toilet>;

/* ────────────────  POST /api/toilets/add  ─────────────────── */

export interface AddToiletRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  priceType: PriceType;
  /** priceType='paid' bo'lsa > 0 bo'lishi shart. */
  priceAmount: number;
}

export type AddToiletResponse = ToiletFull;

/* ────────────────  GET /api/toilets/[id]  ─────────────────── */

export interface ToiletByIdQuery {
  page?: number;
  pageSize?: number;
}

export interface ToiletByIdResponse {
  location: ToiletFull;
  reviews: Paged<Review>;
}

/* ────────────────  POST /api/reviews  ─────────────────────── */

export interface CreateReviewRequest {
  locationId: string;
  /** 1–5. */
  rating: number;
  comment: string;
  /** Max 5 ta URL. */
  images?: string[];
}

export type CreateReviewResponse = Review;

/* ─────────────────────  Client state  ─────────────────────── */

export interface Coords {
  lat: number;
  lng: number;
}

export interface NearbyFilters {
  type?: LocationType;
  priceType?: PriceType;
  /** km, default 5. */
  radiusKm: number;
}

export type LocationPermissionStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'error';

/* ─────────────────────  Auth (NextAuth)  ──────────────────── */

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/* ──────────────  Endpoint xaritasi (referencia)  ──────────── */

export interface ApiEndpoints {
  'GET /api/toilets/nearby':  { query: NearbyQuery;        response: NearbyResponse };
  'GET /api/toilets/[id]':    { params: { id: string }; query: ToiletByIdQuery; response: ToiletByIdResponse };
  'POST /api/reviews':        { body: CreateReviewRequest; response: CreateReviewResponse };
}
