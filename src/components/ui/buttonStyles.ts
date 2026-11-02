import { cn } from '../../lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'dangerGhost'
  | 'ghost'
export type ButtonSize = 'md' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-teal-700 text-white hover:bg-teal-800',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  dangerGhost: 'text-red-600 hover:bg-red-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

const sizes: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className)
}
