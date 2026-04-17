import { ImageIcon, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/classnames';

export function EditorialVisual({
  label,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  monogram = 'M',
  className
}: {
  label: string;
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  imageAlt?: string;
  monogram?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(247,241,234,0.88)_52%,rgba(234,227,219,0.8)_100%)] p-6 shadow-[0_30px_90px_rgba(69,48,29,0.08)] md:p-8', className)}>
      <div className="absolute inset-x-10 top-0 h-40 rounded-full bg-[radial-gradient(circle,rgba(176,144,112,0.18),transparent_68%)]" />
      <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(89,74,63,0.12),transparent_66%)]" />
      <div className="absolute right-8 top-8 text-(--accent-strong)">
        <Sparkles className="h-6 w-6" />
      </div>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={imageAlt || title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className={cn('relative flex min-h-80 flex-col justify-between', imageUrl ? 'text-white' : '')}>
        <div className="flex justify-between gap-4">
          <Badge>{label}</Badge>
          <div className="hidden h-16 w-16 items-center justify-center rounded-full border border-(--line) bg-white/88 font-serif text-4xl text-(--ink) md:flex">
            {monogram}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="max-w-md font-serif text-4xl leading-[1.02] text-(--ink) md:text-5xl">
            {title}
          </h3>
          <p className="max-w-md text-sm leading-7 text-(--muted)">{subtitle}</p>
          {!imageUrl ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-white/80 px-4 py-2 text-sm text-(--muted-strong)">
              <ImageIcon className="h-4 w-4" />
              Место под фото
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
