# Toilet.uz — Backend

Next.js 16 (App Router) + **Neon Postgres** + **Prisma 6** + **NextAuth v5** + **Zod**.

## 1. Birinchi marta ishga tushirish

```powershell
# 1) Dependencylar
npm install

# 2) Env'ni to'ldiring (Neon URL, AUTH_SECRET, Google OAuth)
Copy-Item .env.example .env.local
notepad .env.local

# 3) Prisma client + schemani Neon'ga yuborish
npx prisma generate
npm run db:push          # ishlab chiqish uchun
# yoki migratsiya bilan:
npm run db:migrate

# 4) Test ma'lumotlar (10 ta Toshkent joyi)
npm run db:seed

# 5) Dev server
npm run dev
```

## 2. Loyiha tuzilishi

```
prisma/
  schema.prisma                ← Modellar (User, Account, Session, Location, Review)
  seed.ts                      ← 10 ta realistik Toshkent joyi

app/api/
  auth/[...nextauth]/route.ts  ← NextAuth handlers
  toilets/
    nearby/route.ts            ← GET  /api/toilets/nearby?lat=&lng=&radius=
    [id]/route.ts              ← GET  /api/toilets/:id?page=
  reviews/route.ts             ← POST /api/reviews        (auth required)

lib/
  prisma.ts                    ← Singleton PrismaClient + Neon adapter
  auth.ts                      ← NextAuth config + requireSession()
  geo.ts                       ← Haversine + boundingBox + findNearby()
  validation.ts                ← Zod schemas
  api.ts                       ← jsonOk / jsonError / handleApiError
  api-client.ts                ← Frontend `fetch` wrapper

types/
  index.ts                     ← Frontend uchun API shartnomalari

context/
  ToiletsContext.tsx           ← React Context (geolocation, list, filters)
```

## 3. API javoblari

Hammasi `{ data: T }` (success) yoki `{ error: string, details? }` (failure).

### `GET /api/toilets/nearby`

Query: `lat`, `lng`, `radius` (km, default 5, max 50), `type`, `priceType`,
`page`, `pageSize`. Javob:

```json
{
  "data": {
    "data": [{ "id": "...", "name": "...", "distanceKm": 0.8, ... }],
    "page": 1, "pageSize": 20, "total": 42, "hasMore": true
  }
}
```

### `GET /api/toilets/:id`

Joy + uning sharhlari (pagination'li).

### `POST /api/reviews`  (auth)

Body: `{ locationId (uuid), rating (1-5), comment, images[] }`.
Bir transaction ichida `Location.rating` va `Location.reviewCount` yangilanadi.

### NextAuth endpointlari

`/api/auth/signin`, `/api/auth/callback/:provider`, `/api/auth/session`, ...
— hammasi avtomatik.

## 4. 5 km radius logikasi

`lib/geo.ts → findNearby()` ikki bosqichli optimizatsiya:

1. **Bounding box** (lat/lng index'lardan foydalanadi)
2. **Haversine** masofa (CTE ichida aniq filterlash)

Window function `COUNT(*) OVER ()` bilan pagination uchun `total`ni
bitta so'rovda olamiz.

## 5. NextAuth

`lib/auth.ts` Google va GitHub provider'larini env'da kalit bo'lsa
ro'yxatga oladi. `PrismaAdapter` orqali `User/Account/Session` jadvallarida
saqlanadi. Session strategy: `database` (har request'da DB'ga kichik query).

Himoyalangan route'larda:

```ts
import { requireSession } from '@/lib/auth';
const session = await requireSession();   // 401 if no session
```

## 6. Frontend uchun

```ts
import type { Toilet, NearbyResponse } from '@/types';
import { api } from '@/lib/api-client';
import { useToilets } from '@/context/ToiletsContext';
```

## 7. Buyruqlar shpargalkasi

| Buyruq | Maqsadi |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` + Next build |
| `npm run db:push` | Schema'ni Neon'ga (dev) |
| `npm run db:migrate` | Migration yaratib qo'llash (prod) |
| `npm run db:deploy` | CI/CD'da migration qo'llash |
| `npm run db:seed` | Test ma'lumotlar |
| `npm run db:seed:reset` | Tozalab qaytadan to'ldirish |
| `npm run db:studio` | Prisma Studio UI |
