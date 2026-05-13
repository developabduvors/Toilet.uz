'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === 'loading') {
    return <div className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />;
  }

  if (status === 'unauthenticated') {
    return (
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
      >
        <GoogleIcon className="size-4" />
        Kirish
      </button>
    );
  }

  const user = session!.user;
  const initial = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full hover:opacity-80 transition"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? 'avatar'}
            className="size-8 rounded-full ring-1 ring-zinc-300 dark:ring-zinc-700"
          />
        ) : (
          <span className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg z-20 overflow-hidden">
            <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-medium truncate">{user.name ?? 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400"
            >
              Chiqish
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
