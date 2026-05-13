/**
 * Toilet.uz — Prisma client (Neon serverless driver bilan)
 * --------------------------------------------------------------------------
 * Bu yagona singleton client. Serverless muhitda hot-reload paytida bir
 * nechta client yaratilmasligi uchun global cache ishlatamiz.
 *
 * Neon HTTP driver Edge Runtime'da ishlaydi, lekin transaction'lar uchun
 * Pool kerak — shuning uchun `@neondatabase/serverless` Pool'idan
 * foydalanamiz.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local.');
}

// Node.js < 22 da WebSocket constructor yo'q — Neon WS uchun shu kerak.
// Edge va Node 22+ uchun bu blok no-op.
if (typeof WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require('ws');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
