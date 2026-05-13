/**
 * Toilet.uz — NextAuth (Auth.js v5) konfiguratsiyasi
 * --------------------------------------------------------------------------
 * Asosiy chiqishlar:
 *   handlers  → app/api/auth/[...nextauth]/route.ts  uchun GET, POST
 *   auth()    → route va server component'larda session olish
 *   signIn / signOut  → server action'lar uchun
 *   requireSession()  → himoyalangan API endpointlar uchun helper
 */

import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const providers: NextAuthConfig['providers'] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/* ────────────  Server-side helpers  ──────────── */

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return { user: session.user as { id: string; name?: string | null; email?: string | null; image?: string | null } };
}

/* ────────────  Type augmentation  ──────────── */

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
