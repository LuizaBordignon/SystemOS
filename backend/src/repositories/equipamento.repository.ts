import { prisma } from '../config/database';

export const equipamentoRepository = {
  async criar(dados: {
    tipo: string;
    marca: string;
    modelo: string;
    numeroSerie?: string;
    observacoes?: string;
    clienteId: number;
  }) {
    return prisma.equipamento.create({ data: dados });
  },

  async buscarPorId(id: number) {
    return prisma.equipamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        ordensServico: {
          orderBy: { dataAbertura: 'desc' },
        },
      },
    });
  },

  async listarPorCliente(clienteId: number) {
    return prisma.equipamento.findMany({
      where: { clienteId },
      orderBy: { criadoEm: 'desc' },
    });
  },

  async listar(termo?: string) {
    if (!termo) {
      return prisma.equipamento.findMany({
        include: { cliente: true },
        orderBy: { criadoEm: 'desc' },
      });
    }

    return prisma.equipamento.findMany({
      where: {
        OR: [
          { tipo: { contains: termo, mode: 'insensitive' } },
          { marca: { contains: termo, mode: 'insensitive' } },
          { modelo: { contains: termo, mode: 'insensitive' } },
          { numeroSerie: { contains: termo, mode: 'insensitive' } },
        ],
      },
      include: { cliente: true },
      orderBy: { criadoEm: 'desc' },
    });
  },

  async atualizar(
    id: number,
    dados: Partial<{
      tipo: string;
      marca: string;
      modelo: string;
      numeroSerie: string;
      observacoes: string;
    }>
  ) {
    return prisma.equipamento.update({ where: { id }, data: dados });
  },

  async excluir(id: number) {
    return prisma.equipamento.delete({ where: { id } });
  },
};
