'use client';

import Link from 'next/link';

type ConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function ConsentCheckbox({ checked, onChange, label }: ConsentCheckboxProps) {
  return (
    <label className="flex items-start gap-3 rounded-[1.2rem] border border-(--line) bg-(--panel) px-4 py-3 text-sm leading-6 text-(--muted)">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-(--line-strong) text-(--accent-strong)"
      />
      <span>
        {label}{' '}
        <Link
          href="/privacy-policy"
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="text-(--foreground) underline decoration-(--line-strong) underline-offset-4 transition hover:text-(--accent-strong)"
        >
          Открыть политику
        </Link>
      </span>
    </label>
  );
}
