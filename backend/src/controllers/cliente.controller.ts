import { Request, Response } from 'express';
import { clienteService } from '../services/cliente.service';
import { ErroAplicacao } from '../utils/erro-aplicacao';

function tratarErro(erro: unknown, res: Response) {
  if (erro instanceof ErroAplicacao) {
    return res.status(erro.statusCode).json({ erro: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

export const clienteController = {
  async criar(req: Request, res: Response) {
    try {
      const cliente = await clienteService.criar(req.body);
      return res.status(201).json(cliente);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const cliente = await clienteService.atualizar(id, req.body);
      return res.status(200).json(cliente);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await clienteService.excluir(id);
      return res.status(204).send();
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const cliente = await clienteService.buscarPorId(id);
      return res.status(200).json(cliente);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const termo = req.query.termo as string | undefined;
      const clientes = await clienteService.listar(termo);
      return res.status(200).json(clientes);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },
};
