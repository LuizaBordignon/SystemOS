import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemErro } from '@/lib/api';
import type { Cliente } from '@/types/api';
import { useAuth } from '@/lib/auth';
import { TipoUsuario } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Campo';
import { Card } from '@/components/ui/Card';
import { Carregando, ErroCarregamento, Vazio } from '@/components/ui/Estado';
import { ClienteFormModal } from './ClienteFormModal';

export function ClientesPage() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === TipoUsuario.ADMIN;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [termo, setTermo] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  function carregar(termoBusca?: string) {
    setCarregando(true);
    api
      .get<Cliente[]>('/clientes', { params: termoBusca ? { termo: termoBusca } : undefined })
      .then((res) => setClientes(res.data))
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  function aoBuscar(evento: FormEvent) {
    evento.preventDefault();
    carregar(termo);
  }

  function abrirNovo() {
    setClienteEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setClienteEditando(cliente);
    setModalAberto(true);
  }

  function aoSalvar(cliente: Cliente) {
    setModalAberto(false);
    setClientes((atual) => {
      const existe = atual.some((c) => c.id === cliente.id);
      return existe ? atual.map((c) => (c.id === cliente.id ? cliente : c)) : [cliente, ...atual];
    });
  }

  async function excluir(cliente: Cliente) {
    if (!confirm(`Excluir o cliente "${cliente.nome}"?`)) return;
    try {
      await api.delete(`/clientes/${cliente.id}`);
      setClientes((atual) => atual.filter((c) => c.id !== cliente.id));
    } catch (e) {
      alert(mensagemErro(e));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Clientes</h1>
        {ehAdmin && <Button onClick={abrirNovo}>Novo cliente</Button>}
      </div>

      <form onSubmit={aoBuscar} className="flex max-w-md gap-2">
        <Input
          placeholder="Buscar por nome ou CPF/CNPJ"
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
        ) : clientes.length === 0 ? (
          <Vazio mensagem="Nenhum cliente encontrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">CPF/CNPJ</th>
                <th className="px-4 py-2 font-medium">Telefone</th>
                <th className="px-4 py-2 font-medium">Email</th>
                {ehAdmin && <th className="px-4 py-2 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2">
                    <Link
                      to={`/clientes/${cliente.id}`}
                      className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                    >
                      {cliente.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{cliente.cpfCnpj}</td>
                  <td className="px-4 py-2">{cliente.telefone}</td>
                  <td className="px-4 py-2">{cliente.email ?? '—'}</td>
                  {ehAdmin && (
                    <td className="px-4 py-2">
                      <div className="flex gap-3">
                        <button
                          onClick={() => abrirEdicao(cliente)}
                          className="text-slate-600 hover:underline dark:text-slate-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir(cliente)}
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

      <ClienteFormModal
        aberto={modalAberto}
        cliente={clienteEditando}
        onFechar={() => setModalAberto(false)}
        onSalvo={aoSalvar}
      />
    </div>
  );
}
