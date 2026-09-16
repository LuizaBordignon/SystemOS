import { Prisma } from '../generated/prisma/client';
import { prisma } from '../config/database';
import { StatusOS } from '../generated/prisma/enums';

const INCLUDE_PADRAO = {
  cliente: true,
  equipamento: true,
  tecnico: { select: { id: true, nome: true, email: true } },
} satisfies Prisma.OrdemServicoInclude;

export const ordemServicoRepository = {
  async criar(dados: {
    clienteId: number;
    equipamentoId: number;
    tecnicoId: number;
    problemaRelatado: string;
    prazoEstimado?: Date;
    observacoes?: string;
    valorPecas: Prisma.Decimal | number;
    valorMaoDeObra: Prisma.Decimal | number;
    valorTotal: Prisma.Decimal | number;
  }) {
    return prisma.$transaction(async (tx) => {
      const os = await tx.ordemServico.create({
        data: { ...dados, numero: 'PENDENTE' },
      });

      // Número sequencial baseado no id gerado pelo banco — garante unicidade
      // mesmo sob criações concorrentes, sem depender de contagem manual.
      const numero = `OS-${String(os.id).padStart(6, '0')}`;

      return tx.ordemServico.update({
        where: { id: os.id },
        data: { numero },
        include: INCLUDE_PADRAO,
      });
    });
  },

  async buscarPorId(id: number) {
    return prisma.ordemServico.findUnique({
      where: { id },
      include: {
        ...INCLUDE_PADRAO,
        historicoStatus: {
          orderBy: { alteradoEm: 'desc' },
          include: { usuario: { select: { id: true, nome: true } } },
        },
        logsAlteracao: {
          orderBy: { alteradoEm: 'desc' },
          include: { usuario: { select: { id: true, nome: true } } },
        },
      },
    });
  },

  async listar(filtros: {
    numero?: string;
    nomeCliente?: string;
    cpfCnpj?: string;
    equipamento?: string;
    status?: StatusOS;
    dataInicio?: Date;
    dataFim?: Date;
  }) {
    const where: Prisma.OrdemServicoWhereInput = {};

    if (filtros.numero) {
      where.numero = { contains: filtros.numero, mode: 'insensitive' };
    }

    if (filtros.status) {
      where.status = filtros.status;
    }

    if (filtros.nomeCliente || filtros.cpfCnpj) {
      where.cliente = {
        ...(filtros.nomeCliente && {
          nome: { contains: filtros.nomeCliente, mode: 'insensitive' },
        }),
        ...(filtros.cpfCnpj && { cpfCnpj: { contains: filtros.cpfCnpj } }),
      };
    }

    if (filtros.equipamento) {
      where.equipamento = {
        OR: [
          { tipo: { contains: filtros.equipamento, mode: 'insensitive' } },
          { marca: { contains: filtros.equipamento, mode: 'insensitive' } },
          { modelo: { contains: filtros.equipamento, mode: 'insensitive' } },
        ],
      };
    }

    if (filtros.dataInicio || filtros.dataFim) {
      where.dataAbertura = {
        ...(filtros.dataInicio && { gte: filtros.dataInicio }),
        ...(filtros.dataFim && { lte: filtros.dataFim }),
      };
    }

    return prisma.ordemServico.findMany({
      where,
      include: INCLUDE_PADRAO,
      orderBy: { dataAbertura: 'desc' },
    });
  },

  async listarRecentes(limite: number) {
    return prisma.ordemServico.findMany({
      include: INCLUDE_PADRAO,
      orderBy: { dataAbertura: 'desc' },
      take: limite,
    });
  },

  async contarPorStatus() {
    return prisma.ordemServico.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  },

  async somarValorTotalPeriodo(dataInicio?: Date, dataFim?: Date) {
    const resultado = await prisma.ordemServico.aggregate({
      where: {
        dataAbertura: {
          ...(dataInicio && { gte: dataInicio }),
          ...(dataFim && { lte: dataFim }),
        },
      },
      _sum: { valorTotal: true },
    });

    return resultado._sum.valorTotal ?? new Prisma.Decimal(0);
  },

  async atualizar(
    id: number,
    dados: Partial<{
      diagnostico: string;
      servicoRealizado: string;
      observacoes: string;
      prazoEstimado: Date;
      valorPecas: Prisma.Decimal | number;
      valorMaoDeObra: Prisma.Decimal | number;
      valorTotal: Prisma.Decimal | number;
    }>
  ) {
    return prisma.ordemServico.update({
      where: { id },
      data: dados,
      include: INCLUDE_PADRAO,
    });
  },

  async atualizarStatus(id: number, status: StatusOS) {
    return prisma.ordemServico.update({
      where: { id },
      data: { status },
      include: INCLUDE_PADRAO,
    });
  },

  async registrarHistoricoStatus(dados: {
    ordemServicoId: number;
    statusAnterior: StatusOS | null;
    statusNovo: StatusOS;
    usuarioId: number;
  }) {
    return prisma.historicoStatusOS.create({ data: dados });
  },

  async registrarLogAlteracao(dados: {
    ordemServicoId: number;
    campo: string;
    valorAntigo: string | null;
    valorNovo: string | null;
    usuarioId: number;
  }) {
    return prisma.logAlteracaoOS.create({ data: dados });
  },
};
