import { clienteRepository } from '../repositories/cliente.repository';
import { ErroAplicacao } from '../utils/erro-aplicacao';

interface DadosCliente {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email?: string;
  endereco?: string;
}

export const clienteService = {
  async criar(dados: DadosCliente) {
    if (!dados.nome || !dados.cpfCnpj || !dados.telefone) {
      throw new ErroAplicacao('Nome, CPF/CNPJ e telefone são obrigatórios');
    }

    const existente = await clienteRepository.buscarPorCpfCnpj(dados.cpfCnpj);
    if (existente) {
      throw new ErroAplicacao('Já existe um cliente cadastrado com esse CPF/CNPJ', 409);
    }

    return clienteRepository.criar(dados);
  },

  async atualizar(id: number, dados: Partial<DadosCliente>) {
    const cliente = await clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado', 404);
    }

    if (dados.cpfCnpj && dados.cpfCnpj !== cliente.cpfCnpj) {
      const existente = await clienteRepository.buscarPorCpfCnpj(dados.cpfCnpj);
      if (existente) {
        throw new ErroAplicacao('Já existe um cliente cadastrado com esse CPF/CNPJ', 409);
      }
    }

    return clienteRepository.atualizar(id, dados);
  },

  async excluir(id: number) {
    const cliente = await clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado', 404);
    }

    try {
      return await clienteRepository.excluir(id);
    } catch {
      // Falha de FK do Prisma quando o cliente tem equipamentos/OS vinculados
      throw new ErroAplicacao(
        'Não é possível excluir um cliente com equipamentos ou ordens de serviço vinculadas',
        409
      );
    }
  },

  async buscarPorId(id: number) {
    const cliente = await clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado', 404);
    }

    return cliente;
  },

  async listar(termo?: string) {
    return clienteRepository.listar(termo);
  },
};
