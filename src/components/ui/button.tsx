import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/classnames';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[color:var(--button-bg)] text-white shadow-[0_20px_45px_rgba(106,103,98,0.24)] hover:bg-[color:var(--button-bg-hover)] hover:text-white',
  secondary:
    'border border-[color:var(--line-strong)] bg-white/88 text-[color:var(--ink)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--ink)]',
  ghost: 'text-[color:var(--foreground)] hover:bg-white/55'
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-3.5 text-sm'
};

export const buttonClassName = ({
  variant = 'primary',
  size = 'md',
  className
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--button-bg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
};

export function Button({ children, variant, size, className, style, ...props }: ButtonProps) {
  const resolvedVariant = variant ?? 'primary';
  const resolvedStyle =
    resolvedVariant === 'primary'
      ? { color: '#ffffff', ...(style ?? {}) }
      : resolvedVariant === 'secondary'
        ? { color: 'var(--ink)', ...(style ?? {}) }
        : style;
  return (
    <button
      {...props}
      className={buttonClassName({ variant: resolvedVariant, size, className })}
      style={resolvedStyle}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<LinkProps, 'href'> & {
  children: ReactNode;
  href: string;
  className?: string;
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  children,
  className,
  variant,
  size,
  style,
  ...props
}: ButtonLinkProps) {
  const resolvedVariant = variant ?? 'primary';
  const classes = buttonClassName({ variant: resolvedVariant, size, className });
  const resolvedStyle =
    resolvedVariant === 'primary'
      ? { color: '#ffffff', ...(style ?? {}) }
      : resolvedVariant === 'secondary'
        ? { color: 'var(--ink)', ...(style ?? {}) }
        : style;
  const isExternal =
    props.href.startsWith('http://') ||
    props.href.startsWith('https://') ||
    props.href.startsWith('mailto:') ||
    props.href.startsWith('tel:');

  if (isExternal) {
    return (
      <a {...props} className={classes} style={resolvedStyle}>
        {children}
      </a>
    );
  }

  return (
    <Link {...props} className={classes} style={resolvedStyle}>
      {children}
    </Link>
  );
}
