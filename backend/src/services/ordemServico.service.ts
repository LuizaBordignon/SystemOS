import { Prisma } from '../generated/prisma/client';
import { StatusOS } from '../generated/prisma/enums';
import { ordemServicoRepository } from '../repositories/ordemServico.repository';
import { clienteRepository } from '../repositories/cliente.repository';
import { equipamentoRepository } from '../repositories/equipamento.repository';
import { usuarioRepository } from '../repositories/usuario.repository';
import { ErroAplicacao } from '../utils/erro-aplicacao';

interface DadosCriacaoOS {
  clienteId: number;
  equipamentoId: number;
  tecnicoId: number;
  problemaRelatado: string;
  prazoEstimado?: string;
  observacoes?: string;
  valorPecas?: number;
  valorMaoDeObra?: number;
}

interface DadosAtualizacaoOS {
  diagnostico?: string;
  servicoRealizado?: string;
  observacoes?: string;
  prazoEstimado?: string;
  valorPecas?: number;
  valorMaoDeObra?: number;
}

interface FiltrosOS {
  numero?: string;
  nomeCliente?: string;
  cpfCnpj?: string;
  equipamento?: string;
  status?: StatusOS;
  dataInicio?: string;
  dataFim?: string;
}

// Regra 5: OS cancelada é estado terminal, não volta pra manutenção (nem pra
// mais nenhum outro estado). ENTREGUE também é terminal. Fora isso, o fluxo
// segue a ordem das etapas descritas no enunciado, com CANCELADA disponível
// em qualquer ponto antes da entrega e volta de AGUARDANDO_PECA pra
// EM_MANUTENCAO quando a peça chega.
const TRANSICOES_PERMITIDAS: Record<StatusOS, StatusOS[]> = {
  [StatusOS.AGUARDANDO_DIAGNOSTICO]: [StatusOS.EM_DIAGNOSTICO, StatusOS.CANCELADA],
  [StatusOS.EM_DIAGNOSTICO]: [StatusOS.AGUARDANDO_APROVACAO, StatusOS.CANCELADA],
  [StatusOS.AGUARDANDO_APROVACAO]: [StatusOS.APROVADA, StatusOS.CANCELADA],
  [StatusOS.APROVADA]: [StatusOS.EM_MANUTENCAO, StatusOS.CANCELADA],
  [StatusOS.EM_MANUTENCAO]: [StatusOS.AGUARDANDO_PECA, StatusOS.FINALIZADA, StatusOS.CANCELADA],
  [StatusOS.AGUARDANDO_PECA]: [StatusOS.EM_MANUTENCAO, StatusOS.CANCELADA],
  [StatusOS.FINALIZADA]: [StatusOS.ENTREGUE],
  [StatusOS.ENTREGUE]: [],
  [StatusOS.CANCELADA]: [],
};

// Estados em que o conteúdo da OS (diagnóstico, serviço, valores) já não
// deveria mais ser alterado.
const STATUS_BLOQUEADOS_PARA_EDICAO: StatusOS[] = [StatusOS.ENTREGUE, StatusOS.CANCELADA];

function calcularValorTotal(valorPecas: Prisma.Decimal | number, valorMaoDeObra: Prisma.Decimal | number) {
  return new Prisma.Decimal(valorPecas).plus(new Prisma.Decimal(valorMaoDeObra));
}

// Só loga campos que vieram no payload (undefined = "não foi tocado nesta
// edição", diferente de "foi apagado"). Decimal e Date são normalizados
// antes de comparar pra não gerar log falso por diferença de formatação
// (ex.: Decimal "10.00" vs number 10).
async function registrarLogSeAlterado(
  ordemServicoId: number,
  campo: string,
  valorAntigo: Prisma.Decimal | Date | string | null | undefined,
  valorNovo: number | string | undefined,
  usuarioId: number
) {
  if (valorNovo === undefined) return;

  let antigo: string | null;
  let novo: string | null;

  if (valorAntigo instanceof Prisma.Decimal) {
    antigo = valorAntigo.toString();
    novo = new Prisma.Decimal(valorNovo).toString();
  } else if (valorAntigo instanceof Date) {
    antigo = valorAntigo.toISOString();
    novo = new Date(valorNovo).toISOString();
  } else {
    antigo = valorAntigo ?? null;
    novo = String(valorNovo);
  }

  if (antigo === novo) return;

  await ordemServicoRepository.registrarLogAlteracao({
    ordemServicoId,
    campo,
    valorAntigo: antigo,
    valorNovo: novo,
    usuarioId,
  });
}

export const ordemServicoService = {
  async criar(dados: DadosCriacaoOS, usuarioLogadoId: number) {
    if (
      !dados.clienteId ||
      !dados.equipamentoId ||
      !dados.tecnicoId ||
      !dados.problemaRelatado
    ) {
      throw new ErroAplicacao(
        'Cliente, equipamento, técnico responsável e problema relatado são obrigatórios'
      );
    }

    const cliente = await clienteRepository.buscarPorId(dados.clienteId);
    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado', 404);
    }

    const equipamento = await equipamentoRepository.buscarPorId(dados.equipamentoId);
    if (!equipamento) {
      throw new ErroAplicacao('Equipamento não encontrado', 404);
    }

    // Regra 2: equipamento pertence a um único cliente.
    if (equipamento.clienteId !== dados.clienteId) {
      throw new ErroAplicacao('Esse equipamento não pertence ao cliente informado');
    }

    const tecnico = await usuarioRepository.buscarPorId(dados.tecnicoId);
    if (!tecnico || !tecnico.ativo) {
      throw new ErroAplicacao('Técnico responsável não encontrado ou inativo', 404);
    }

    const valorPecas = dados.valorPecas ?? 0;
    const valorMaoDeObra = dados.valorMaoDeObra ?? 0;

    const os = await ordemServicoRepository.criar({
      clienteId: dados.clienteId,
      equipamentoId: dados.equipamentoId,
      tecnicoId: dados.tecnicoId,
      problemaRelatado: dados.problemaRelatado,
      prazoEstimado: dados.prazoEstimado ? new Date(dados.prazoEstimado) : undefined,
      observacoes: dados.observacoes,
      valorPecas,
      valorMaoDeObra,
      valorTotal: calcularValorTotal(valorPecas, valorMaoDeObra),
    });

    // Regra 6: toda OS nasce com um registro de histórico marcando quem abriu.
    await ordemServicoRepository.registrarHistoricoStatus({
      ordemServicoId: os.id,
      statusAnterior: null,
      statusNovo: os.status,
      usuarioId: usuarioLogadoId,
    });

    return os;
  },

  async buscarPorId(id: number) {
    const os = await ordemServicoRepository.buscarPorId(id);
    if (!os) {
      throw new ErroAplicacao('Ordem de serviço não encontrada', 404);
    }

    return os;
  },

  async listar(filtros: FiltrosOS) {
    return ordemServicoRepository.listar({
      numero: filtros.numero,
      nomeCliente: filtros.nomeCliente,
      cpfCnpj: filtros.cpfCnpj,
      equipamento: filtros.equipamento,
      status: filtros.status,
      dataInicio: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
      dataFim: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
    });
  },

  async atualizar(id: number, dados: DadosAtualizacaoOS, usuarioLogadoId: number) {
    const os = await ordemServicoRepository.buscarPorId(id);
    if (!os) {
      throw new ErroAplicacao('Ordem de serviço não encontrada', 404);
    }

    if (STATUS_BLOQUEADOS_PARA_EDICAO.includes(os.status)) {
      throw new ErroAplicacao(
        `Não é possível editar uma OS com status ${os.status}`,
        409
      );
    }

    const valorPecas = dados.valorPecas ?? os.valorPecas;
    const valorMaoDeObra = dados.valorMaoDeObra ?? os.valorMaoDeObra;
    const precisaRecalcular = dados.valorPecas !== undefined || dados.valorMaoDeObra !== undefined;

    const atualizado = await ordemServicoRepository.atualizar(id, {
      diagnostico: dados.diagnostico,
      servicoRealizado: dados.servicoRealizado,
      observacoes: dados.observacoes,
      prazoEstimado: dados.prazoEstimado ? new Date(dados.prazoEstimado) : undefined,
      valorPecas: dados.valorPecas,
      valorMaoDeObra: dados.valorMaoDeObra,
      // Regra 4: valor total é sempre pecas + mão de obra, nunca editado direto.
      ...(precisaRecalcular && { valorTotal: calcularValorTotal(valorPecas, valorMaoDeObra) }),
    });

    // Regra 6: log de alterações importantes, campo a campo.
    await Promise.all([
      registrarLogSeAlterado(id, 'diagnostico', os.diagnostico, dados.diagnostico, usuarioLogadoId),
      registrarLogSeAlterado(id, 'servicoRealizado', os.servicoRealizado, dados.servicoRealizado, usuarioLogadoId),
      registrarLogSeAlterado(id, 'valorPecas', os.valorPecas, dados.valorPecas, usuarioLogadoId),
      registrarLogSeAlterado(id, 'valorMaoDeObra', os.valorMaoDeObra, dados.valorMaoDeObra, usuarioLogadoId),
      registrarLogSeAlterado(id, 'prazoEstimado', os.prazoEstimado, dados.prazoEstimado, usuarioLogadoId),
    ]);

    return atualizado;
  },

  async alterarStatus(id: number, novoStatus: StatusOS, usuarioLogadoId: number) {
    const os = await ordemServicoRepository.buscarPorId(id);
    if (!os) {
      throw new ErroAplicacao('Ordem de serviço não encontrada', 404);
    }

    const statusPermitidos = TRANSICOES_PERMITIDAS[os.status];
    if (!statusPermitidos.includes(novoStatus)) {
      throw new ErroAplicacao(
        `Não é possível mudar o status de ${os.status} para ${novoStatus}`,
        409
      );
    }

    // Regra 3: só finaliza com diagnóstico e serviço realizado preenchidos.
    if (novoStatus === StatusOS.FINALIZADA && (!os.diagnostico || !os.servicoRealizado)) {
      throw new ErroAplicacao(
        'A OS só pode ser finalizada com diagnóstico e serviço realizado preenchidos',
        409
      );
    }

    const atualizado = await ordemServicoRepository.atualizarStatus(id, novoStatus);

    await ordemServicoRepository.registrarHistoricoStatus({
      ordemServicoId: id,
      statusAnterior: os.status,
      statusNovo: novoStatus,
      usuarioId: usuarioLogadoId,
    });

    return atualizado;
  },
};
