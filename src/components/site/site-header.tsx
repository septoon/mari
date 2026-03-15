'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, UserRound, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useClientSession } from '@/components/client-session-provider';
import { MobileNavDrawer } from '@/components/site/mobile-nav-drawer';
import { cn } from '@/lib/classnames';
import { siteConfig } from '@/lib/site';

type SiteHeaderProps = {
  salon: {
    phone: string;
    phoneHref: string;
  };
};

export function SiteHeader({ salon }: SiteHeaderProps) {
  const pathname = usePathname();
  const { session } = useClientSession();
  const [open, setOpen] = useState(false);
  const accountActive = pathname === '/account' || pathname.startsWith('/account/') || pathname === '/reset-password';
  const accountInitial = session.client?.name?.trim().charAt(0).toUpperCase();
  const accountLabel = session.client?.name?.trim() || session.client?.phoneE164 || 'Личный кабинет';

  const accountAvatar = session.client?.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={session.client.avatarUrl}
      alt={session.client?.name || 'Фото профиля'}
      className="h-full w-full object-cover"
    />
  ) : accountInitial ? (
    <span className="text-sm font-semibold uppercase tracking-[0.08em]">{accountInitial}</span>
  ) : (
    <UserRound className="h-5 w-5" />
  );

  const accountIconLink = (
    <Link
      href="/account"
      onClick={() => setOpen(false)}
      aria-label={session.authenticated ? 'Открыть личный кабинет' : 'Перейти в личный кабинет'}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/82 text-[color:var(--foreground)] transition',
        accountActive
          ? 'border-[color:var(--accent-strong)] shadow-[0_12px_30px_rgba(138,105,73,0.16)]'
          : 'border-[color:var(--line)] hover:border-[color:var(--accent-strong)]'
      )}
    >
      <span className="inline-flex h-full w-full items-center justify-center overflow-hidden rounded-full">
        {accountAvatar}
      </span>
      {session.authenticated ? (
        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[color:var(--accent-strong)]" />
      ) : null}
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-4" onClick={() => setOpen(false)}>
            <Image
              src="/app-icon.png"
              alt="MARI app icon"
              width={44}
              height={44}
              priority
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] tracking-[0.12em] object-cover"
            />
            <span>
              <span className="block font-serif text-[1.85rem] leading-none tracking-[0.22em] text-[color:var(--ink)]">
                MARI
              </span>
              <span className="block text-[0.68rem] uppercase tracking-[0.38em] text-[color:var(--muted-strong)]">
                Beauty Salon
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {siteConfig.nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm transition hover:text-[color:var(--foreground)]',
                    active ? 'text-[color:var(--foreground)]' : 'text-[color:var(--muted-strong)]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {session.authenticated ? (
              <Link
                href="/account"
                className={cn(
                  'inline-flex items-center gap-3 rounded-full border bg-white/82 px-2.5 py-2 pr-4 text-sm transition',
                  accountActive
                    ? 'border-[color:var(--accent-strong)] shadow-[0_12px_30px_rgba(138,105,73,0.16)]'
                    : 'border-[color:var(--line)] hover:border-[color:var(--accent-strong)]'
                )}
              >
                <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--line)] bg-white text-[color:var(--foreground)]">
                  {accountAvatar}
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[color:var(--accent-strong)]" />
                </span>
                <span className="max-w-[12rem] truncate text-[color:var(--foreground)]">{accountLabel}</span>
              </Link>
            ) : (
              <>
                <a href={salon.phoneHref} className="text-sm text-[color:var(--muted-strong)] transition hover:text-[color:var(--foreground)]">
                  {salon.phone}
                </a>
                {accountIconLink}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {accountIconLink}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/80"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <MobileNavDrawer open={open} pathname={pathname} salon={salon} onClose={() => setOpen(false)} />
    </>
  );
}
