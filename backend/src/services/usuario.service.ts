import bcrypt from 'bcrypt';
import { usuarioRepository } from '../repositories/usuario.repository';
import { TipoUsuario } from '../generated/prisma/enums';
import { ErroAplicacao } from '../utils/erro-aplicacao';

interface DadosCriacaoUsuario {
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
}

interface DadosAtualizacaoUsuario {
  nome?: string;
  email?: string;
  tipo?: TipoUsuario;
}

function removerSenhaHash<T extends { senhaHash?: string }>(usuario: T) {
  const { senhaHash, ...resto } = usuario;
  return resto;
}

export const usuarioService = {
  async criar(dados: DadosCriacaoUsuario) {
    if (!dados.nome || !dados.email || !dados.senha || !dados.tipo) {
      throw new ErroAplicacao('Nome, email, senha e tipo são obrigatórios');
    }

    if (!Object.values(TipoUsuario).includes(dados.tipo)) {
      throw new ErroAplicacao('Tipo de usuário inválido');
    }

    if (dados.senha.length < 6) {
      throw new ErroAplicacao('A senha deve ter no mínimo 6 caracteres');
    }

    const existente = await usuarioRepository.buscarPorEmail(dados.email);
    if (existente) {
      throw new ErroAplicacao('Já existe um usuário cadastrado com esse email', 409);
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const usuario = await usuarioRepository.criar({
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      tipo: dados.tipo,
    });

    return removerSenhaHash(usuario);
  },

  async listar() {
    return usuarioRepository.listarTodos();
  },

  // Endpoint enxuto (id/nome/tipo) liberado pra ADMIN e TECNICO: o formulário
  // de abertura de OS precisa listar quem pode ser o técnico responsável,
  // e /api/usuarios completo é exclusivo de ADMIN.
  async listarAtivos() {
    return usuarioRepository.listarAtivos();
  },

  async buscarPorId(id: number) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new ErroAplicacao('Usuário não encontrado', 404);
    }

    return removerSenhaHash(usuario);
  },

  async atualizar(id: number, dados: DadosAtualizacaoUsuario) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new ErroAplicacao('Usuário não encontrado', 404);
    }

    if (dados.tipo && !Object.values(TipoUsuario).includes(dados.tipo)) {
      throw new ErroAplicacao('Tipo de usuário inválido');
    }

    if (dados.email && dados.email !== usuario.email) {
      const existente = await usuarioRepository.buscarPorEmail(dados.email);
      if (existente) {
        throw new ErroAplicacao('Já existe um usuário cadastrado com esse email', 409);
      }
    }

    return usuarioRepository.atualizar(id, dados);
  },

  // "Excluir" aqui é uma desativação lógica: Usuario é referenciado por
  // OrdemServico (técnico responsável), HistoricoStatusOS e LogAlteracaoOS,
  // e apagar a linha quebraria esse histórico ou falharia por FK. Desativar
  // impede login (ver authService.login) e preserva o rastro de auditoria.
  async excluir(id: number, usuarioLogadoId: number) {
    if (id === usuarioLogadoId) {
      throw new ErroAplicacao('Você não pode desativar seu próprio usuário', 409);
    }

    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new ErroAplicacao('Usuário não encontrado', 404);
    }

    return usuarioRepository.definirAtivo(id, false);
  },

  async reativar(id: number) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new ErroAplicacao('Usuário não encontrado', 404);
    }

    return usuarioRepository.definirAtivo(id, true);
  },
};
