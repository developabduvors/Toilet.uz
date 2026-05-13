'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12 bg-zinc-50 dark:bg-zinc-950">
      <Suspense fallback={<LoginCard><LoginSkeleton /></LoginCard>}>
        <LoginInner />
      </Suspense>
    </main>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useSession();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const error = params.get('error');

  useEffect(() => {
    if (status === 'authenticated') router.replace(callbackUrl);
  }, [status, callbackUrl, router]);

  return (
    <LoginCard>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
          {readableError(error)}
        </div>
      )}

      <button
        onClick={() => signIn('google', { callbackUrl })}
        disabled={status === 'loading'}
        className="w-full inline-flex items-center justify-center gap-3 py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition disabled:opacity-60"
      >
        <GoogleIcon className="size-5" />
        Google bilan kirish
      </button>

      <p className="mt-6 text-xs text-center text-zinc-500">
        Kirish orqali <a href="/terms" className="underline">Foydalanish shartlari</a> va{' '}
        <a href="/privacy" className="underline">Maxfiylik siyosati</a>ga rozilik bildirasiz.
      </p>
    </LoginCard>
  );
}

function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Toilet.uz</h1>
        <p className="text-sm text-zinc-500 mt-1">Kirib davom eting</p>
      </div>
      {children}
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full h-11 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
  );
}

function readableError(code: string): string {
  const map: Record<string, string> = {
    OAuthSignin: 'Google bilan ulanishda xato. Qayta urinib ko\'ring.',
    OAuthCallback: 'Google javobi qabul qilinmadi.',
    OAuthCreateAccount: 'Akkaunt yaratib bo\'lmadi.',
    EmailCreateAccount: 'Email orqali akkaunt yaratib bo\'lmadi.',
    Callback: 'Callback xato.',
    OAuthAccountNotLinked: 'Bu email allaqachon boshqa provider bilan ro\'yxatdan o\'tgan.',
    AccessDenied: 'Kirish rad etildi.',
    Configuration: 'Server konfiguratsiyasida xato. Administrator bilan bog\'laning.',
  };
  return map[code] ?? `Xato: ${code}`;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
