import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, mensagemErro } from '@/lib/api';
import type { OrdemServico } from '@/types/api';
import { STATUS_LABEL } from '@/types/api';
import { TRANSICOES_PERMITIDAS, STATUS_BLOQUEADOS_PARA_EDICAO } from '@/lib/statusOS';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Campo';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Carregando, ErroCarregamento } from '@/components/ui/Estado';

function formatarMoeda(valor: string) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(valor: string | null) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '—';
}

export function OrdemServicoDetalhe() {
  const { id } = useParams();
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [erroStatus, setErroStatus] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState('');
  const [form, setForm] = useState({
    diagnostico: '',
    servicoRealizado: '',
    observacoes: '',
    prazoEstimado: '',
    valorPecas: '',
    valorMaoDeObra: '',
  });

  function carregar() {
    setCarregando(true);
    api
      .get<OrdemServico>(`/ordens-servico/${id}`)
      .then((res) => {
        setOs(res.data);
        setForm({
          diagnostico: res.data.diagnostico ?? '',
          servicoRealizado: res.data.servicoRealizado ?? '',
          observacoes: res.data.observacoes ?? '',
          prazoEstimado: res.data.prazoEstimado ? res.data.prazoEstimado.slice(0, 10) : '',
          valorPecas: res.data.valorPecas,
          valorMaoDeObra: res.data.valorMaoDeObra,
        });
      })
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function salvarConteudo(evento: FormEvent) {
    evento.preventDefault();
    setErroForm('');
    setSalvando(true);
    try {
      const resposta = await api.put<OrdemServico>(`/ordens-servico/${id}`, {
        diagnostico: form.diagnostico || undefined,
        servicoRealizado: form.servicoRealizado || undefined,
        observacoes: form.observacoes || undefined,
        prazoEstimado: form.prazoEstimado || undefined,
        valorPecas: form.valorPecas !== '' ? Number(form.valorPecas) : undefined,
        valorMaoDeObra: form.valorMaoDeObra !== '' ? Number(form.valorMaoDeObra) : undefined,
      });
      setOs(resposta.data);
    } catch (e) {
      setErroForm(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(novoStatus: string) {
    setErroStatus('');
    setAlterandoStatus(novoStatus);
    try {
      const resposta = await api.patch<OrdemServico>(`/ordens-servico/${id}/status`, { status: novoStatus });
      setOs(resposta.data);
    } catch (e) {
      setErroStatus(mensagemErro(e));
    } finally {
      setAlterandoStatus('');
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <ErroCarregamento mensagem={erro} />;
  if (!os) return null;

  const edicaoBloqueada = STATUS_BLOQUEADOS_PARA_EDICAO.includes(os.status);
  const proximosStatus = TRANSICOES_PERMITIDAS[os.status];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/ordens-servico" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
          ← Ordens de serviço
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{os.numero}</h1>
          <StatusBadge status={os.status} />
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cliente</p>
            <Link to={`/clientes/${os.cliente.id}`} className="text-slate-900 hover:underline dark:text-slate-100">
              {os.cliente.nome}
            </Link>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Equipamento</p>
            <p className="text-slate-900 dark:text-slate-100">
              {os.equipamento.tipo} {os.equipamento.marca} {os.equipamento.modelo}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Técnico responsável</p>
            <p className="text-slate-900 dark:text-slate-100">{os.tecnico.nome}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Data de abertura</p>
            <p className="text-slate-900 dark:text-slate-100">{formatarData(os.dataAbertura)}</p>
          </div>
          <div className="col-span-2 md:col-span-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Problema relatado</p>
            <p className="text-slate-900 dark:text-slate-100">{os.problemaRelatado}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Valor total</p>
            <p className="text-slate-900 dark:text-slate-100">{formatarMoeda(os.valorTotal)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Status</h2>
        {proximosStatus.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Esse é um status final — não há mais transições possíveis.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {proximosStatus.map((s) => (
              <Button
                key={s}
                variante={s === 'CANCELADA' ? 'danger' : 'secondary'}
                disabled={alterandoStatus !== ''}
                onClick={() => mudarStatus(s)}
              >
                {alterandoStatus === s ? 'Aplicando...' : `→ ${STATUS_LABEL[s]}`}
              </Button>
            ))}
          </div>
        )}
        {erroStatus && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{erroStatus}</p>}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Diagnóstico e serviço</h2>
        {edicaoBloqueada && (
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Essa OS está com status "{STATUS_LABEL[os.status]}" e não pode mais ser editada.
          </p>
        )}
        <form onSubmit={salvarConteudo} className="flex flex-col gap-4">
          <Textarea
            label="Diagnóstico técnico"
            disabled={edicaoBloqueada}
            value={form.diagnostico}
            onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
          />
          <Textarea
            label="Serviço realizado"
            disabled={edicaoBloqueada}
            value={form.servicoRealizado}
            onChange={(e) => setForm({ ...form, servicoRealizado: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor das peças (R$)"
              type="number"
              min="0"
              step="0.01"
              disabled={edicaoBloqueada}
              value={form.valorPecas}
              onChange={(e) => setForm({ ...form, valorPecas: e.target.value })}
            />
            <Input
              label="Valor da mão de obra (R$)"
              type="number"
              min="0"
              step="0.01"
              disabled={edicaoBloqueada}
              value={form.valorMaoDeObra}
              onChange={(e) => setForm({ ...form, valorMaoDeObra: e.target.value })}
            />
          </div>
          <Input
            label="Prazo estimado"
            type="date"
            disabled={edicaoBloqueada}
            value={form.prazoEstimado}
            onChange={(e) => setForm({ ...form, prazoEstimado: e.target.value })}
          />
          <Textarea
            label="Observações"
            disabled={edicaoBloqueada}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          {erroForm && <p className="text-sm text-red-600 dark:text-red-400">{erroForm}</p>}
          {!edicaoBloqueada && (
            <div className="flex justify-end">
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Histórico de status</h2>
        {!os.historicoStatus || os.historicoStatus.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Sem histórico.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {os.historicoStatus.map((h) => (
              <li key={h.id} className="border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                <span className="text-slate-900 dark:text-slate-100">
                  {h.statusAnterior ? `${STATUS_LABEL[h.statusAnterior]} → ` : 'Abertura: '}
                  {STATUS_LABEL[h.statusNovo]}
                </span>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  por {h.usuario.nome} em {formatarData(h.alteradoEm)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Log de alterações</h2>
        {!os.logsAlteracao || os.logsAlteracao.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Sem alterações registradas.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {os.logsAlteracao.map((l) => (
              <li key={l.id} className="border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                <span className="text-slate-900 dark:text-slate-100">
                  <strong>{l.campo}</strong>: {l.valorAntigo ?? '—'} → {l.valorNovo ?? '—'}
                </span>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  por {l.usuario.nome} em {formatarData(l.alteradoEm)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
