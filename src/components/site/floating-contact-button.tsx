'use client';

import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { faVk } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MessageCircleMore, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore, type ReactNode } from 'react';

import { cn } from '@/lib/classnames';
import { COOKIE_CONSENT_EVENT, readCookieConsent, type CookieConsentValue } from '@/lib/cookie-consent';

type FloatingContactButtonProps = {
  phoneHref: string;
};

type ContactAction = {
  name: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
};

const iconClassName = 'text-[1.45rem]';

const actions: ContactAction[] = [
  {
    name: 'WhatsApp',
    href: 'https://wa.me/+79786778130',
    icon: <WhatsAppIcon fontSize="inherit" className={iconClassName} />,
    external: true
  },
  {
    name: 'Telegram',
    href: 'https://t.me/maribeauty2025',
    icon: <TelegramIcon fontSize="inherit" className={iconClassName} />,
    external: true
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/mari_beauty_simf',
    icon: <InstagramIcon fontSize="inherit" className={iconClassName} />,
    external: true
  },
  {
    name: 'VK',
    href: 'https://vk.com/mari_beauty_simf',
    icon: <FontAwesomeIcon icon={faVk} className={iconClassName} />,
    external: true
  }
];

export function FloatingContactButton({ phoneHref }: FloatingContactButtonProps) {
  const pathname = usePathname();

  if (pathname === '/booking' || pathname.startsWith('/booking/')) {
    return null;
  }

  return <FloatingContactButtonInner key={pathname} phoneHref={phoneHref} />;
}

function FloatingContactButtonInner({ phoneHref }: FloatingContactButtonProps) {
  const [open, setOpen] = useState(false);
  const consent = useSyncExternalStore<CookieConsentValue | null | undefined>(
    (callback) => {
      window.addEventListener(COOKIE_CONSENT_EVENT, callback);
      return () => window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
    },
    () => readCookieConsent(),
    () => undefined
  );

  const hasCookieBanner = consent === null;
  const contactActions: ContactAction[] = [
    {
      name: 'Позвонить',
      href: phoneHref,
      icon: <PhoneIcon fontSize="inherit" className={iconClassName} />
    },
    ...actions
  ];

  return (
    <div
      className={cn(
        'fixed right-4 z-[60] flex flex-col items-end gap-3 sm:right-6',
        hasCookieBanner ? 'bottom-36 sm:bottom-6' : 'bottom-5 sm:bottom-6'
      )}
    >
      <div
        className={cn(
          'flex flex-col items-end gap-2 transition-all duration-200',
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        )}
        aria-hidden={!open}
      >
        {contactActions.map((action) => (
          <a
            key={action.name}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noreferrer noopener' : undefined}
            aria-label={action.name}
            onClick={() => setOpen(false)}
            className="group inline-flex items-center"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.76)] bg-[rgba(255,252,247,0.98)] text-(--button-bg) shadow-[0_16px_40px_rgba(36,94,99,0.14)] transition group-hover:-translate-y-0.5 group-hover:bg-white">
              {action.icon}
            </span>
          </a>
        ))}
      </div>

      <button
        type="button"
        aria-label={open ? 'Закрыть контакты' : 'Открыть контакты'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.4)] bg-(--button-bg) text-white shadow-[0_22px_55px_rgba(36,94,99,0.34)] transition hover:-translate-y-0.5 hover:bg-(--button-bg-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--button-bg) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background)"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircleMore className="h-5 w-5" />}
      </button>
    </div>
  );
}
