import { equipamentoRepository } from '../repositories/equipamento.repository';
import { clienteRepository } from '../repositories/cliente.repository';
import { ErroAplicacao } from '../utils/erro-aplicacao';

interface DadosEquipamento {
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  observacoes?: string;
  clienteId: number;
}

export const equipamentoService = {
  async criar(dados: DadosEquipamento) {
    if (!dados.tipo || !dados.marca || !dados.modelo || !dados.clienteId) {
      throw new ErroAplicacao('Tipo, marca, modelo e cliente são obrigatórios');
    }

    const cliente = await clienteRepository.buscarPorId(dados.clienteId);
    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado', 404);
    }

    return equipamentoRepository.criar(dados);
  },

  async atualizar(
    id: number,
    dados: Partial<Omit<DadosEquipamento, 'clienteId'>>
  ) {
    const equipamento = await equipamentoRepository.buscarPorId(id);
    if (!equipamento) {
      throw new ErroAplicacao('Equipamento não encontrado', 404);
    }

    return equipamentoRepository.atualizar(id, dados);
  },

  async excluir(id: number) {
    const equipamento = await equipamentoRepository.buscarPorId(id);
    if (!equipamento) {
      throw new ErroAplicacao('Equipamento não encontrado', 404);
    }

    try {
      return await equipamentoRepository.excluir(id);
    } catch {
      // Falha de FK do Prisma quando o equipamento tem ordens de serviço vinculadas
      throw new ErroAplicacao(
        'Não é possível excluir um equipamento com ordens de serviço vinculadas',
        409
      );
    }
  },

  async buscarPorId(id: number) {
    const equipamento = await equipamentoRepository.buscarPorId(id);
    if (!equipamento) {
      throw new ErroAplicacao('Equipamento não encontrado', 404);
    }

    return equipamento;
  },

  async listarPorCliente(clienteId: number) {
    const cliente = await clienteRepository.buscarPorId(clienteId);
    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado', 404);
    }

    return equipamentoRepository.listarPorCliente(clienteId);
  },

  async listar(termo?: string) {
    return equipamentoRepository.listar(termo);
  },
};
