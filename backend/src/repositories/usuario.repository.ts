import { prisma } from '../config/database';
import { TipoUsuario } from '../generated/prisma/enums';

export const usuarioRepository = {
  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async buscarPorId(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  async criar(dados: {
    nome: string;
    email: string;
    senhaHash: string;
    tipo: TipoUsuario;
  }) {
    return prisma.usuario.create({ data: dados });
  },

  async listarTodos() {
    return prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        criadoEm: true,
        // nunca selecionamos "senhaHash" aqui — não tem motivo pra esse
        // dado sair do banco em nenhuma listagem
      },
      orderBy: { nome: 'asc' },
    });
  },

  async listarAtivos() {
    return prisma.usuario.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, tipo: true },
      orderBy: { nome: 'asc' },
    });
  },

  async atualizar(
    id: number,
    dados: Partial<{
      nome: string;
      email: string;
      tipo: TipoUsuario;
    }>
  ) {
    return prisma.usuario.update({
      where: { id },
      data: dados,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        criadoEm: true,
      },
    });
  },

  async definirAtivo(id: number, ativo: boolean) {
    return prisma.usuario.update({
      where: { id },
      data: { ativo },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        criadoEm: true,
      },
    });
  },
};