import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemErro } from '@/lib/api';
import type { DashboardResumo } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Carregando, ErroCarregamento, Vazio } from '@/components/ui/Estado';

const CARTOES: { chave: keyof DashboardResumo; label: string }[] = [
  { chave: 'totalAbertas', label: 'Total de OS abertas' },
  { chave: 'aguardandoDiagnostico', label: 'Aguardando diagnóstico' },
  { chave: 'aguardandoAprovacao', label: 'Aguardando aprovação' },
  { chave: 'emManutencao', label: 'Em manutenção' },
  { chave: 'finalizadas', label: 'Finalizadas' },
  { chave: 'entregues', label: 'Entregues' },
];

function formatarMoeda(valor: string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function Dashboard() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get<DashboardResumo>('/dashboard')
      .then((res) => setResumo(res.data))
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <Carregando />;
  if (erro) return <ErroCarregamento mensagem={erro} />;
  if (!resumo) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {CARTOES.map((c) => (
          <Card key={c.chave}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {resumo[c.chave] as number}
            </p>
          </Card>
        ))}
      </div>

      <Card className="w-fit">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Valor total das OS no período</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {formatarMoeda(resumo.valorTotalPeriodo)}
        </p>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Ordens de serviço recentes</h2>
        <Card className="p-0">
          {resumo.ordensRecentes.length === 0 ? (
            <Vazio mensagem="Nenhuma OS cadastrada ainda." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Número</th>
                  <th className="px-4 py-2 font-medium">Cliente</th>
                  <th className="px-4 py-2 font-medium">Equipamento</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {resumo.ordensRecentes.map((os) => (
                  <tr
                    key={os.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-2">
                      <Link
                        to={`/ordens-servico/${os.id}`}
                        className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                      >
                        {os.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{os.cliente.nome}</td>
                    <td className="px-4 py-2">
                      {os.equipamento.tipo} {os.equipamento.marca} {os.equipamento.modelo}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={os.status} />
                    </td>
                    <td className="px-4 py-2">{formatarMoeda(os.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
