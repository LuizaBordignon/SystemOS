import { Request, Response } from 'express';
import { equipamentoService } from '../services/equipamento.service';
import { ErroAplicacao } from '../utils/erro-aplicacao';

function tratarErro(erro: unknown, res: Response) {
  if (erro instanceof ErroAplicacao) {
    return res.status(erro.statusCode).json({ erro: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

export const equipamentoController = {
  async criar(req: Request, res: Response) {
    try {
      const equipamento = await equipamentoService.criar(req.body);
      return res.status(201).json(equipamento);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const equipamento = await equipamentoService.atualizar(id, req.body);
      return res.status(200).json(equipamento);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await equipamentoService.excluir(id);
      return res.status(204).send();
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const equipamento = await equipamentoService.buscarPorId(id);
      return res.status(200).json(equipamento);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const { termo, clienteId } = req.query;

      if (clienteId) {
        const equipamentos = await equipamentoService.listarPorCliente(Number(clienteId));
        return res.status(200).json(equipamentos);
      }

      const equipamentos = await equipamentoService.listar(termo as string | undefined);
      return res.status(200).json(equipamentos);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },
};
