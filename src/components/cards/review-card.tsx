import type { ReviewItem } from '@/content/types';

export function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <article className="surface-card h-full p-6">
      <p className="font-serif text-3xl leading-tight text-[color:var(--ink)]">“</p>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{review.text}</p>
      <div className="mt-6 border-t border-[color:var(--line)] pt-4">
        <p className="text-sm font-medium text-[color:var(--foreground)]">{review.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">
          {review.role}
        </p>
      </div>
    </article>
  );
}
