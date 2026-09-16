import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api, mensagemErro } from '@/lib/api';
import type { Cliente } from '@/types/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Campo';
import { Button } from '@/components/ui/Button';

interface Props {
  aberto: boolean;
  cliente: Cliente | null;
  onFechar: () => void;
  onSalvo: (cliente: Cliente) => void;
}

const VAZIO = { nome: '', cpfCnpj: '', telefone: '', email: '', endereco: '' };

export function ClienteFormModal({ aberto, cliente, onFechar, onSalvo }: Props) {
  const [dados, setDados] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Reseta o formulário sempre que o modal abre com um cliente diferente.
  useEffect(() => {
    if (!aberto) return;
    setDados(
      cliente
        ? {
            nome: cliente.nome,
            cpfCnpj: cliente.cpfCnpj,
            telefone: cliente.telefone,
            email: cliente.email ?? '',
            endereco: cliente.endereco ?? '',
          }
        : VAZIO
    );
    setErro('');
  }, [aberto, cliente]);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const payload = {
        ...dados,
        email: dados.email || undefined,
        endereco: dados.endereco || undefined,
      };
      const resposta = cliente
        ? await api.put<Cliente>(`/clientes/${cliente.id}`, payload)
        : await api.post<Cliente>('/clientes', payload);
      onSalvo(resposta.data);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo={cliente ? 'Editar cliente' : 'Novo cliente'} onFechar={onFechar}>
      <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          obrigatorio
          value={dados.nome}
          onChange={(e) => setDados({ ...dados, nome: e.target.value })}
        />
        <Input
          label="CPF/CNPJ"
          obrigatorio
          value={dados.cpfCnpj}
          onChange={(e) => setDados({ ...dados, cpfCnpj: e.target.value })}
        />
        <Input
          label="Telefone"
          obrigatorio
          value={dados.telefone}
          onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={dados.email}
          onChange={(e) => setDados({ ...dados, email: e.target.value })}
        />
        <Input
          label="Endereço"
          value={dados.endereco}
          onChange={(e) => setDados({ ...dados, endereco: e.target.value })}
        />
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
