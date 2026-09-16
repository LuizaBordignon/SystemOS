import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTES: Record<Variante, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-400',
  secondary:
    'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 disabled:text-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 dark:disabled:text-slate-600',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 dark:disabled:bg-red-900',
  ghost:
    'text-slate-600 hover:bg-slate-100 disabled:text-slate-300 dark:text-slate-400 dark:hover:bg-slate-800 dark:disabled:text-slate-600',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

export function Button({ variante = 'primary', className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANTES[variante]} ${className}`}
      {...props}
    />
  );
}
