import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, mensagemErro } from '@/lib/api';
import type { Cliente, Equipamento, OrdemServico, UsuarioAtivo } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Campo';
import { Button } from '@/components/ui/Button';

const VAZIO = {
  clienteId: '',
  equipamentoId: '',
  tecnicoId: '',
  problemaRelatado: '',
  prazoEstimado: '',
  observacoes: '',
  valorPecas: '',
  valorMaoDeObra: '',
};

export function OrdemServicoNova() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioAtivo[]>([]);
  const [dados, setDados] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.get<Cliente[]>('/clientes').then((res) => setClientes(res.data));
    api.get<UsuarioAtivo[]>('/usuarios/ativos').then((res) => setTecnicos(res.data));
  }, []);

  useEffect(() => {
    if (!dados.clienteId) {
      setEquipamentos([]);
      return;
    }
    api
      .get<Equipamento[]>('/equipamentos', { params: { clienteId: dados.clienteId } })
      .then((res) => setEquipamentos(res.data));
  }, [dados.clienteId]);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const payload = {
        clienteId: Number(dados.clienteId),
        equipamentoId: Number(dados.equipamentoId),
        tecnicoId: Number(dados.tecnicoId),
        problemaRelatado: dados.problemaRelatado,
        prazoEstimado: dados.prazoEstimado || undefined,
        observacoes: dados.observacoes || undefined,
        valorPecas: dados.valorPecas ? Number(dados.valorPecas) : undefined,
        valorMaoDeObra: dados.valorMaoDeObra ? Number(dados.valorMaoDeObra) : undefined,
      };
      const resposta = await api.post<OrdemServico>('/ordens-servico', payload);
      navigate(`/ordens-servico/${resposta.data.id}`);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/ordens-servico" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
          ← Ordens de serviço
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Nova ordem de serviço</h1>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
          <Select
            label="Cliente"
            obrigatorio
            required
            value={dados.clienteId}
            onChange={(e) => setDados({ ...dados, clienteId: e.target.value, equipamentoId: '' })}
          >
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>

          <Select
            label="Equipamento"
            obrigatorio
            required
            disabled={!dados.clienteId}
            value={dados.equipamentoId}
            onChange={(e) => setDados({ ...dados, equipamentoId: e.target.value })}
          >
            <option value="">{dados.clienteId ? 'Selecione...' : 'Escolha um cliente primeiro'}</option>
            {equipamentos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.tipo} — {eq.marca} {eq.modelo}
              </option>
            ))}
          </Select>

          <Select
            label="Técnico responsável"
            obrigatorio
            required
            value={dados.tecnicoId}
            onChange={(e) => setDados({ ...dados, tecnicoId: e.target.value })}
          >
            <option value="">Selecione...</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>

          <Textarea
            label="Problema relatado pelo cliente"
            obrigatorio
            required
            value={dados.problemaRelatado}
            onChange={(e) => setDados({ ...dados, problemaRelatado: e.target.value })}
          />

          <Input
            label="Prazo estimado"
            type="date"
            value={dados.prazoEstimado}
            onChange={(e) => setDados({ ...dados, prazoEstimado: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor das peças (R$)"
              type="number"
              min="0"
              step="0.01"
              value={dados.valorPecas}
              onChange={(e) => setDados({ ...dados, valorPecas: e.target.value })}
            />
            <Input
              label="Valor da mão de obra (R$)"
              type="number"
              min="0"
              step="0.01"
              value={dados.valorMaoDeObra}
              onChange={(e) => setDados({ ...dados, valorMaoDeObra: e.target.value })}
            />
          </div>

          <Textarea
            label="Observações"
            value={dados.observacoes}
            onChange={(e) => setDados({ ...dados, observacoes: e.target.value })}
          />

          {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <Link to="/ordens-servico">
              <Button type="button" variante="secondary">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Abrindo...' : 'Abrir OS'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
