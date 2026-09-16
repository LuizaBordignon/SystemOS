import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemErro } from '@/lib/api';
import type { Cliente, Equipamento } from '@/types/api';
import { useAuth } from '@/lib/auth';
import { TipoUsuario } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Campo';
import { Card } from '@/components/ui/Card';
import { Carregando, ErroCarregamento, Vazio } from '@/components/ui/Estado';
import { EquipamentoFormModal } from './EquipamentoFormModal';

export function EquipamentosPage() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === TipoUsuario.ADMIN;

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [termo, setTermo] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Equipamento | null>(null);

  function carregar(termoBusca?: string) {
    setCarregando(true);
    api
      .get<Equipamento[]>('/equipamentos', { params: termoBusca ? { termo: termoBusca } : undefined })
      .then((res) => setEquipamentos(res.data))
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    if (ehAdmin) {
      api.get<Cliente[]>('/clientes').then((res) => setClientes(res.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aoBuscar(evento: FormEvent) {
    evento.preventDefault();
    carregar(termo);
  }

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(equipamento: Equipamento) {
    setEditando(equipamento);
    setModalAberto(true);
  }

  function aoSalvar(equipamento: Equipamento) {
    setModalAberto(false);
    setEquipamentos((atual) => {
      const existe = atual.some((e) => e.id === equipamento.id);
      return existe ? atual.map((e) => (e.id === equipamento.id ? equipamento : e)) : [equipamento, ...atual];
    });
  }

  async function excluir(equipamento: Equipamento) {
    if (!confirm(`Excluir o equipamento "${equipamento.tipo} ${equipamento.marca} ${equipamento.modelo}"?`)) return;
    try {
      await api.delete(`/equipamentos/${equipamento.id}`);
      setEquipamentos((atual) => atual.filter((e) => e.id !== equipamento.id));
    } catch (e) {
      alert(mensagemErro(e));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Equipamentos</h1>
        {ehAdmin && <Button onClick={abrirNovo}>Novo equipamento</Button>}
      </div>

      <form onSubmit={aoBuscar} className="flex max-w-md gap-2">
        <Input
          placeholder="Buscar por tipo, marca, modelo ou nº de série"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        <Button type="submit" variante="secondary">
          Buscar
        </Button>
      </form>

      <Card className="p-0">
        {carregando ? (
          <Carregando />
        ) : erro ? (
          <ErroCarregamento mensagem={erro} />
        ) : equipamentos.length === 0 ? (
          <Vazio mensagem="Nenhum equipamento encontrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Marca / Modelo</th>
                <th className="px-4 py-2 font-medium">Nº de série</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                {ehAdmin && <th className="px-4 py-2 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((eq) => (
                <tr
                  key={eq.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2">{eq.tipo}</td>
                  <td className="px-4 py-2">
                    {eq.marca} {eq.modelo}
                  </td>
                  <td className="px-4 py-2">{eq.numeroSerie ?? '—'}</td>
                  <td className="px-4 py-2">
                    {eq.cliente ? (
                      <Link to={`/clientes/${eq.cliente.id}`} className="hover:underline">
                        {eq.cliente.nome}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  {ehAdmin && (
                    <td className="px-4 py-2">
                      <div className="flex gap-3">
                        <button
                          onClick={() => abrirEdicao(eq)}
                          className="text-slate-600 hover:underline dark:text-slate-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir(eq)}
                          className="text-red-600 hover:underline dark:text-red-400"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {ehAdmin && (
        <EquipamentoFormModal
          aberto={modalAberto}
          equipamento={editando}
          clientes={clientes}
          onFechar={() => setModalAberto(false)}
          onSalvo={aoSalvar}
        />
      )}
    </div>
  );
}
