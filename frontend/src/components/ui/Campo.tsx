import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

const ESTILO_BASE =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 dark:[color-scheme:dark]';

interface CampoWrapperProps {
  label?: string;
  erro?: string;
  obrigatorio?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

function CampoWrapper({ label, erro, obrigatorio, children, htmlFor }: CampoWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {obrigatorio && <span className="text-red-500 dark:text-red-400"> *</span>}
        </label>
      )}
      {children}
      {erro && <span className="text-xs text-red-600 dark:text-red-400">{erro}</span>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erro?: string;
  obrigatorio?: boolean;
}

export function Input({ label, erro, obrigatorio, id, className = '', ...props }: InputProps) {
  const idGerado = useId();
  const idFinal = id ?? idGerado;
  return (
    <CampoWrapper label={label} erro={erro} obrigatorio={obrigatorio} htmlFor={idFinal}>
      <input id={idFinal} className={`${ESTILO_BASE} ${className}`} {...props} />
    </CampoWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  erro?: string;
  obrigatorio?: boolean;
}

export function Textarea({ label, erro, obrigatorio, id, className = '', ...props }: TextareaProps) {
  const idGerado = useId();
  const idFinal = id ?? idGerado;
  return (
    <CampoWrapper label={label} erro={erro} obrigatorio={obrigatorio} htmlFor={idFinal}>
      <textarea id={idFinal} className={`${ESTILO_BASE} min-h-20 resize-y ${className}`} {...props} />
    </CampoWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  erro?: string;
  obrigatorio?: boolean;
}

export function Select({ label, erro, obrigatorio, id, className = '', children, ...props }: SelectProps) {
  const idGerado = useId();
  const idFinal = id ?? idGerado;
  return (
    <CampoWrapper label={label} erro={erro} obrigatorio={obrigatorio} htmlFor={idFinal}>
      <select id={idFinal} className={`${ESTILO_BASE} bg-white dark:bg-slate-900 ${className}`} {...props}>
        {children}
      </select>
    </CampoWrapper>
  );
}
