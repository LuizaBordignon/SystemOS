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
    });
  },
};