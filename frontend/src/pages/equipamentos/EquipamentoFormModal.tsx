import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api, mensagemErro } from '@/lib/api';
import type { Cliente, Equipamento } from '@/types/api';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Campo';
import { Button } from '@/components/ui/Button';

interface Props {
  aberto: boolean;
  equipamento: Equipamento | null;
  clientes: Cliente[];
  clienteIdFixo?: number;
  onFechar: () => void;
  onSalvo: (equipamento: Equipamento) => void;
}

const VAZIO = { tipo: '', marca: '', modelo: '', numeroSerie: '', observacoes: '', clienteId: '' };

export function EquipamentoFormModal({
  aberto,
  equipamento,
  clientes,
  clienteIdFixo,
  onFechar,
  onSalvo,
}: Props) {
  const [dados, setDados] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setDados(
      equipamento
        ? {
            tipo: equipamento.tipo,
            marca: equipamento.marca,
            modelo: equipamento.modelo,
            numeroSerie: equipamento.numeroSerie ?? '',
            observacoes: equipamento.observacoes ?? '',
            clienteId: String(equipamento.clienteId),
          }
        : { ...VAZIO, clienteId: clienteIdFixo ? String(clienteIdFixo) : '' }
    );
    setErro('');
  }, [aberto, equipamento, clienteIdFixo]);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const payload = {
        tipo: dados.tipo,
        marca: dados.marca,
        modelo: dados.modelo,
        numeroSerie: dados.numeroSerie || undefined,
        observacoes: dados.observacoes || undefined,
        clienteId: Number(dados.clienteId),
      };
      const resposta = equipamento
        ? await api.put<Equipamento>(`/equipamentos/${equipamento.id}`, payload)
        : await api.post<Equipamento>('/equipamentos', payload);
      onSalvo(resposta.data);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo={equipamento ? 'Editar equipamento' : 'Novo equipamento'} onFechar={onFechar}>
      <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
        <Select
          label="Cliente"
          obrigatorio
          required
          disabled={!!equipamento || !!clienteIdFixo}
          value={dados.clienteId}
          onChange={(e) => setDados({ ...dados, clienteId: e.target.value })}
        >
          <option value="">Selecione...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
        <Input
          label="Tipo"
          placeholder="Notebook, computador, impressora..."
          obrigatorio
          value={dados.tipo}
          onChange={(e) => setDados({ ...dados, tipo: e.target.value })}
        />
        <Input
          label="Marca"
          obrigatorio
          value={dados.marca}
          onChange={(e) => setDados({ ...dados, marca: e.target.value })}
        />
        <Input
          label="Modelo"
          obrigatorio
          value={dados.modelo}
          onChange={(e) => setDados({ ...dados, modelo: e.target.value })}
        />
        <Input
          label="Número de série"
          value={dados.numeroSerie}
          onChange={(e) => setDados({ ...dados, numeroSerie: e.target.value })}
        />
        <Textarea
          label="Observações"
          value={dados.observacoes}
          onChange={(e) => setDados({ ...dados, observacoes: e.target.value })}
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
