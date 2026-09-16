import { STATUS_LABEL } from '@/types/api';
import type { StatusOS } from '@/types/api';

const CORES: Record<StatusOS, string> = {
  AGUARDANDO_DIAGNOSTICO: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  EM_DIAGNOSTICO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  AGUARDANDO_APROVACAO: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  APROVADA: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  EM_MANUTENCAO: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  AGUARDANDO_PECA: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  FINALIZADA: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  ENTREGUE: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  CANCELADA: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export function StatusBadge({ status }: { status: StatusOS }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
