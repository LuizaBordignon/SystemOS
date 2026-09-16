import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api, mensagemErro } from '@/lib/api';
import type { Usuario } from '@/types/api';
import { TipoUsuario } from '@/types/api';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Campo';
import { Button } from '@/components/ui/Button';

interface Props {
  aberto: boolean;
  usuario: Usuario | null;
  onFechar: () => void;
  onSalvo: (usuario: Usuario) => void;
}

const VAZIO = { nome: '', email: '', senha: '', tipo: TipoUsuario.TECNICO as string };

export function UsuarioFormModal({ aberto, usuario, onFechar, onSalvo }: Props) {
  const [dados, setDados] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setDados(
      usuario
        ? { nome: usuario.nome, email: usuario.email, senha: '', tipo: usuario.tipo }
        : VAZIO
    );
    setErro('');
  }, [aberto, usuario]);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const resposta = usuario
        ? await api.put<Usuario>(`/usuarios/${usuario.id}`, {
            nome: dados.nome,
            email: dados.email,
            tipo: dados.tipo,
          })
        : await api.post<Usuario>('/usuarios', dados);
      onSalvo(resposta.data);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo={usuario ? 'Editar usuário' : 'Novo usuário'} onFechar={onFechar}>
      <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
        <Input
          label="Nome"
          obrigatorio
          value={dados.nome}
          onChange={(e) => setDados({ ...dados, nome: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          obrigatorio
          value={dados.email}
          onChange={(e) => setDados({ ...dados, email: e.target.value })}
        />
        {!usuario && (
          <Input
            label="Senha"
            type="password"
            obrigatorio
            minLength={6}
            value={dados.senha}
            onChange={(e) => setDados({ ...dados, senha: e.target.value })}
          />
        )}
        <Select
          label="Tipo"
          obrigatorio
          value={dados.tipo}
          onChange={(e) => setDados({ ...dados, tipo: e.target.value })}
        >
          <option value={TipoUsuario.TECNICO}>Técnico</option>
          <option value={TipoUsuario.ADMIN}>Administrador</option>
        </Select>
        {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variante="secondary" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
