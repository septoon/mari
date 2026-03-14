import type { GalleryMoment } from '@/content/types';

import { Badge } from '@/components/ui/badge';

export function GalleryCard({ moment }: { moment: GalleryMoment }) {
  return (
    <article className="relative isolate overflow-hidden rounded-[1.75rem] border border-[color:var(--line)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(244,238,232,0.8)_48%,rgba(232,224,215,0.74)_100%)] p-6 shadow-[0_24px_70px_rgba(51,38,24,0.06)]">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(176,144,112,0.15),transparent_72%)]" />
      <div className="relative flex min-h-[15rem] flex-col justify-between">
        <Badge className="w-fit">{moment.label}</Badge>
        <div>
          <h3 className="font-serif text-3xl text-[color:var(--ink)]">{moment.title}</h3>
          <p className="mt-3 max-w-sm text-sm leading-7 text-[color:var(--muted)]">{moment.note}</p>
        </div>
      </div>
    </article>
  );
}
