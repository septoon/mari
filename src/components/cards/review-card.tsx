import type { ReviewItem } from '@/content/types';

export function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <article className="surface-card h-full p-6">
      <p className="font-serif text-3xl leading-tight text-(--ink)">“</p>
      <p className="mt-4 text-sm leading-7 text-(--muted)">{review.text}</p>
      <div className="mt-6 border-t border-(--line) pt-4">
        <p className="text-sm font-medium text-(--foreground)">{review.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-(--muted-strong)">
          {review.role}
        </p>
      </div>
    </article>
  );
}
