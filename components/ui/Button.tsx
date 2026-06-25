'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · Button
 * components/ui/Button.tsx
 *
 * Consumes the design-system tokens defined in app/globals.css:
 *   colors    → bg-primary, bg-secondary, bg-destructive, *-foreground, etc.
 *   type      → font-body (Inter, per typography.md)
 *   focus     → ring-ring (Ginto gold) on ring-offset-background
 *   shadow    → shadow-sm / shadow-md (the soft, "never harsh" scale)
 * Spacing follows spacing.md: 18px radius, 48px default button height.
 * ------------------------------------------------------------------------- */

/** Tiny dependency-free class joiner. Swap for clsx + tailwind-merge if your
 *  project already uses them (this keeps the file self-contained). */
function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'primary' */
  variant?: ButtonVariant;
  /** Control height/padding/type scale. @default 'md' (48px, per spacing.md) */
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction without unmounting the label. */
  loading?: boolean;
  /** Stretch to fill the available inline space. */
  fullWidth?: boolean;
  /** Decorative icon before the label (hidden while loading). */
  leftIcon?: ReactNode;
  /** Decorative icon after the label. */
  rightIcon?: ReactNode;
}

const base = cx(
  'relative inline-flex items-center justify-center whitespace-nowrap select-none align-middle',
  'font-body font-semibold leading-none rounded-[18px] border border-transparent',
  'transition-[color,background-color,border-color,box-shadow,transform,filter] duration-200 ease-out',
  'cursor-pointer outline-none',
  // Accessible, on-brand focus ring (keyboard only)
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  // Disabled / loading resting state
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
  'disabled:hover:translate-y-0 disabled:hover:brightness-100',
  // Any passed SVG icon inherits color and never intercepts clicks
  '[&_svg]:shrink-0 [&_svg]:pointer-events-none',
);

const variants: Record<ButtonVariant, string> = {
  // Katha Brown — primary actions
  primary: cx(
    'bg-primary text-primary-foreground shadow-sm',
    'hover:-translate-y-px hover:brightness-105 hover:shadow-md',
    'active:translate-y-0 active:brightness-100',
  ),
  // Sampaguita — quiet secondary surface with a hairline border
  secondary: cx(
    'bg-secondary text-secondary-foreground border-border shadow-xs',
    'hover:bg-muted hover:border-border-strong',
    'active:translate-y-0',
  ),
  // Ghost — chromeless until hovered
  ghost: cx(
    'bg-transparent text-foreground',
    'hover:bg-muted',
  ),
  // Terracotta — destructive actions
  danger: cx(
    'bg-destructive text-destructive-foreground shadow-sm',
    'hover:-translate-y-px hover:brightness-105 hover:shadow-md',
    'active:translate-y-0 active:brightness-100',
  ),
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 gap-1.5 px-4 text-sm [&_svg]:size-4',
  md: 'h-12 gap-2 px-6 text-[0.9375rem] [&_svg]:size-[1.125rem]', // 48px — spacing.md default
  lg: 'h-14 gap-2.5 px-8 text-base [&_svg]:size-5',
};

/** Inline spinner sized to the current font (scales with each button size). */
function Spinner() {
  return (
    <svg
      className="size-[1.15em] animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    type = 'button',
    className,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={cx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        leftIcon != null && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}

      {children != null && <span className="inline-flex items-center">{children}</span>}

      {!loading && rightIcon != null && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;