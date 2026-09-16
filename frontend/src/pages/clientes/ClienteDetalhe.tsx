import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, mensagemErro } from '@/lib/api';
import type { Cliente } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Carregando, ErroCarregamento, Vazio } from '@/components/ui/Estado';

export function ClienteDetalhe() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get<Cliente>(`/clientes/${id}`)
      .then((res) => setCliente(res.data))
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) return <Carregando />;
  if (erro) return <ErroCarregamento mensagem={erro} />;
  if (!cliente) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/clientes" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
          ← Clientes
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{cliente.nome}</h1>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">CPF/CNPJ</p>
            <p className="text-slate-900 dark:text-slate-100">{cliente.cpfCnpj}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Telefone</p>
            <p className="text-slate-900 dark:text-slate-100">{cliente.telefone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
            <p className="text-slate-900 dark:text-slate-100">{cliente.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Endereço</p>
            <p className="text-slate-900 dark:text-slate-100">{cliente.endereco ?? '—'}</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Equipamentos</h2>
        <Card className="p-0">
          {!cliente.equipamentos || cliente.equipamentos.length === 0 ? (
            <Vazio mensagem="Nenhum equipamento cadastrado." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Marca</th>
                  <th className="px-4 py-2 font-medium">Modelo</th>
                  <th className="px-4 py-2 font-medium">Nº de série</th>
                </tr>
              </thead>
              <tbody>
                {cliente.equipamentos.map((eq) => (
                  <tr key={eq.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td className="px-4 py-2">{eq.tipo}</td>
                    <td className="px-4 py-2">{eq.marca}</td>
                    <td className="px-4 py-2">{eq.modelo}</td>
                    <td className="px-4 py-2">{eq.numeroSerie ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Histórico de ordens de serviço
        </h2>
        <Card className="p-0">
          {!cliente.ordensServico || cliente.ordensServico.length === 0 ? (
            <Vazio mensagem="Nenhuma ordem de serviço para este cliente." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Número</th>
                  <th className="px-4 py-2 font-medium">Abertura</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {cliente.ordensServico.map((os) => (
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
                    <td className="px-4 py-2">{new Date(os.dataAbertura).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={os.status} />
                    </td>
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
