import { useEffect, useState } from 'react';
import { api, mensagemErro } from '@/lib/api';
import type { Usuario } from '@/types/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Carregando, ErroCarregamento, Vazio } from '@/components/ui/Estado';
import { UsuarioFormModal } from './UsuarioFormModal';

export function UsuariosPage() {
  const { usuario: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  function carregar() {
    setCarregando(true);
    api
      .get<Usuario[]>('/usuarios')
      .then((res) => setUsuarios(res.data))
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(usuario: Usuario) {
    setEditando(usuario);
    setModalAberto(true);
  }

  function aoSalvar(usuario: Usuario) {
    setModalAberto(false);
    setUsuarios((atual) => {
      const existe = atual.some((u) => u.id === usuario.id);
      return existe ? atual.map((u) => (u.id === usuario.id ? usuario : u)) : [usuario, ...atual];
    });
  }

  async function alternarAtivo(usuario: Usuario) {
    const acao = usuario.ativo ? 'desativar' : 'reativar';
    if (!confirm(`Deseja ${acao} o usuário "${usuario.nome}"?`)) return;
    try {
      if (usuario.ativo) {
        await api.delete(`/usuarios/${usuario.id}`);
        setUsuarios((atual) => atual.map((u) => (u.id === usuario.id ? { ...u, ativo: false } : u)));
      } else {
        const resposta = await api.patch<Usuario>(`/usuarios/${usuario.id}/reativar`);
        setUsuarios((atual) => atual.map((u) => (u.id === usuario.id ? resposta.data : u)));
      }
    } catch (e) {
      alert(mensagemErro(e));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Usuários</h1>
        <Button onClick={abrirNovo}>Novo usuário</Button>
      </div>

      <Card className="p-0">
        {carregando ? (
          <Carregando />
        ) : erro ? (
          <ErroCarregamento mensagem={erro} />
        ) : usuarios.length === 0 ? (
          <Vazio mensagem="Nenhum usuário cadastrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2">{u.nome}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.tipo === 'ADMIN' ? 'Administrador' : 'Técnico'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.ativo
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => abrirEdicao(u)}
                        className="text-slate-600 hover:underline dark:text-slate-400"
                      >
                        Editar
                      </button>
                      {u.id !== usuarioLogado?.id && (
                        <button
                          onClick={() => alternarAtivo(u)}
                          className={
                            u.ativo
                              ? 'text-red-600 hover:underline dark:text-red-400'
                              : 'text-emerald-600 hover:underline dark:text-emerald-400'
                          }
                        >
                          {u.ativo ? 'Desativar' : 'Reativar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <UsuarioFormModal
        aberto={modalAberto}
        usuario={editando}
        onFechar={() => setModalAberto(false)}
        onSalvo={aoSalvar}
      />
    </div>
  );
}
