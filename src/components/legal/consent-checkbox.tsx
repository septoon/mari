'use client';

import Link from 'next/link';

type ConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function ConsentCheckbox({ checked, onChange, label }: ConsentCheckboxProps) {
  return (
    <label className="flex items-start gap-3 rounded-[1.2rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3 text-sm leading-6 text-[color:var(--muted)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-[color:var(--line-strong)] text-[color:var(--accent-strong)]"
      />
      <span>
        {label}{' '}
        <Link
          href="/privacy-policy"
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="text-[color:var(--foreground)] underline decoration-[color:var(--line-strong)] underline-offset-4 transition hover:text-[color:var(--accent-strong)]"
        >
          Открыть политику
        </Link>
      </span>
    </label>
  );
}
