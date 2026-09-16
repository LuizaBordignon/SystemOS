import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemErro } from '@/lib/api';
import type { OrdemServico } from '@/types/api';
import { STATUS_LABEL, StatusOS } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Campo';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Carregando, ErroCarregamento, Vazio } from '@/components/ui/Estado';

const FILTROS_VAZIOS = {
  numero: '',
  nomeCliente: '',
  cpfCnpj: '',
  equipamento: '',
  status: '',
  dataInicio: '',
  dataFim: '',
};

function formatarMoeda(valor: string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function OrdensServicoPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  function carregar(filtrosAtivos: typeof FILTROS_VAZIOS) {
    setCarregando(true);
    const params = Object.fromEntries(Object.entries(filtrosAtivos).filter(([, v]) => v !== ''));
    api
      .get<OrdemServico[]>('/ordens-servico', { params })
      .then((res) => setOrdens(res.data))
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar(FILTROS_VAZIOS);
  }, []);

  function aoBuscar(evento: FormEvent) {
    evento.preventDefault();
    carregar(filtros);
  }

  function limpar() {
    setFiltros(FILTROS_VAZIOS);
    carregar(FILTROS_VAZIOS);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Ordens de Serviço</h1>
        <Link to="/ordens-servico/nova">
          <Button>Nova OS</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={aoBuscar} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Input
            placeholder="Número da OS"
            value={filtros.numero}
            onChange={(e) => setFiltros({ ...filtros, numero: e.target.value })}
          />
          <Input
            placeholder="Nome do cliente"
            value={filtros.nomeCliente}
            onChange={(e) => setFiltros({ ...filtros, nomeCliente: e.target.value })}
          />
          <Input
            placeholder="CPF/CNPJ"
            value={filtros.cpfCnpj}
            onChange={(e) => setFiltros({ ...filtros, cpfCnpj: e.target.value })}
          />
          <Input
            placeholder="Equipamento"
            value={filtros.equipamento}
            onChange={(e) => setFiltros({ ...filtros, equipamento: e.target.value })}
          />
          <Select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
            <option value="">Todos os status</option>
            {Object.values(StatusOS).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            title="Data de abertura - início"
            value={filtros.dataInicio}
            onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
          />
          <Input
            type="date"
            title="Data de abertura - fim"
            value={filtros.dataFim}
            onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit" variante="secondary" className="flex-1">
              Filtrar
            </Button>
            <Button type="button" variante="ghost" onClick={limpar}>
              Limpar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-0">
        {carregando ? (
          <Carregando />
        ) : erro ? (
          <ErroCarregamento mensagem={erro} />
        ) : ordens.length === 0 ? (
          <Vazio mensagem="Nenhuma ordem de serviço encontrada." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Número</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Equipamento</th>
                <th className="px-4 py-2 font-medium">Abertura</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((os) => (
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
                  <td className="px-4 py-2">{new Date(os.dataAbertura).toLocaleDateString('pt-BR')}</td>
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
  );
}
