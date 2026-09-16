import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/usuario.repository';

interface ResultadoLogin {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    tipo: string;
  };
}

export const authService = {
  async login(email: string, senha: string): Promise<ResultadoLogin> {
    const usuario = await usuarioRepository.buscarPorEmail(email);

    // Mesma mensagem de erro pros dois casos abaixo — de propósito.
    if (!usuario || !usuario.ativo) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    };
  },
};