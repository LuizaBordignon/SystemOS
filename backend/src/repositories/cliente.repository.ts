import { prisma } from '../config/database';

export const clienteRepository = {
  async criar(dados: {
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email?: string;
    endereco?: string;
  }) {
    return prisma.cliente.create({ data: dados });
  },

  async buscarPorId(id: number) {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        equipamentos: true,
        ordensServico: {
          orderBy: { dataAbertura: 'desc' },
        },
      },
    });
  },

  async buscarPorCpfCnpj(cpfCnpj: string) {
    return prisma.cliente.findUnique({ where: { cpfCnpj } });
  },

  async listar(termo?: string) {
    if (!termo) {
      return prisma.cliente.findMany({ orderBy: { nome: 'asc' } });
    }

    return prisma.cliente.findMany({
      where: {
        OR: [
          { nome: { contains: termo, mode: 'insensitive' } },
          { cpfCnpj: { contains: termo } },
        ],
      },
      orderBy: { nome: 'asc' },
    });
  },

  async atualizar(
    id: number,
    dados: Partial<{
      nome: string;
      cpfCnpj: string;
      telefone: string;
      email: string;
      endereco: string;
    }>
  ) {
    return prisma.cliente.update({ where: { id }, data: dados });
  },

  async excluir(id: number) {
    return prisma.cliente.delete({ where: { id } });
  },
};