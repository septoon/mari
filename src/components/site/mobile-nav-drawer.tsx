'use client';

import Link from 'next/link';
import { UserRound, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { useClientSession } from '@/components/client-session-provider';
import { Button, ButtonLink } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loading-indicator';
import { cn } from '@/lib/classnames';
import { siteConfig } from '@/lib/site';

type MobileNavDrawerProps = {
  open: boolean;
  pathname: string;
  salon: {
    phone: string;
    phoneHref: string;
  };
  onClose: () => void;
};

export function MobileNavDrawer({
  open,
  pathname,
  salon,
  onClose
}: MobileNavDrawerProps) {
  const router = useRouter();
  const { session, setLoggedOut } = useClientSession();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const accountInitial = session.client?.name?.trim().charAt(0).toUpperCase();
  const accountLabel = session.client?.name?.trim() || session.client?.phoneE164 || 'Личный кабинет';

  const handleLogout = async () => {
    setLogoutSubmitting(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      setLoggedOut();
      onClose();

      if (pathname === '/account' || pathname.startsWith('/account/')) {
        router.replace('/account/login');
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('[MOBILE_LOGOUT_FAILED]', error);
    } finally {
      setLogoutSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isClient || !open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isClient, onClose, open]);

  if (!isClient) {
    return null;
  }

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

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[90] transition-opacity duration-300 lg:hidden',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(21,18,15,0.46)] backdrop-blur-[8px]"
        onClick={onClose}
        aria-label="Закрыть меню"
      />

      <aside
        className={cn(
          'absolute inset-y-0 right-0 z-[91] flex w-[min(24rem,88vw)] flex-col border-l border-[rgba(72,54,39,0.08)] shadow-[-24px_0_60px_rgba(12,27,31,0.22)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{
          backgroundColor: 'var(--background)',
          backgroundImage: 'linear-gradient(180deg, #fffaf5 0%, #f7f1ea 18%, #f1e8dd 100%)'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full flex-col px-5 pb-6 pt-5">
          <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Навигация</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">MARI Beauty Salon</p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/92"
              onClick={onClose}
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 grid gap-1">
            {siteConfig.nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm transition',
                    active
                      ? 'bg-white text-[color:var(--foreground)] shadow-[0_12px_28px_rgba(48,36,28,0.06)]'
                      : 'text-[color:var(--muted-strong)] hover:bg-white/72'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--line)] pt-5">
            <a href={salon.phoneHref} className="px-4 text-sm text-[color:var(--muted-strong)]">
              {salon.phone}
            </a>

            {session.authenticated ? (
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_14px_34px_rgba(48,36,28,0.06)]"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--line)] bg-white text-[color:var(--foreground)]">
                  {accountAvatar}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[color:var(--foreground)]">{accountLabel}</span>
                  <span className="block text-xs text-[color:var(--muted-strong)]">Личный кабинет</span>
                </span>
              </Link>
            ) : null}

            {session.authenticated ? (
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                disabled={logoutSubmitting}
                aria-busy={logoutSubmitting}
              >
                {logoutSubmitting ? <LoadingLabel label="Выхожу..." size="sm" /> : 'Выйти'}
              </Button>
            ) : (
              <ButtonLink href="/account/login" size="sm" className="w-full" onClick={onClose}>
                Вход
              </ButtonLink>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
