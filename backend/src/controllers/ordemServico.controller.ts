import { Request, Response } from 'express';
import { ordemServicoService } from '../services/ordemServico.service';
import { ErroAplicacao } from '../utils/erro-aplicacao';
import { StatusOS } from '../generated/prisma/enums';

function tratarErro(erro: unknown, res: Response) {
  if (erro instanceof ErroAplicacao) {
    return res.status(erro.statusCode).json({ erro: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

export const ordemServicoController = {
  async criar(req: Request, res: Response) {
    try {
      const os = await ordemServicoService.criar(req.body, req.usuario!.id);
      return res.status(201).json(os);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const os = await ordemServicoService.atualizar(id, req.body, req.usuario!.id);
      return res.status(200).json(os);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async alterarStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body as { status?: StatusOS };

      if (!status || !Object.values(StatusOS).includes(status)) {
        return res.status(400).json({ erro: 'Status inválido' });
      }

      const os = await ordemServicoService.alterarStatus(id, status, req.usuario!.id);
      return res.status(200).json(os);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const os = await ordemServicoService.buscarPorId(id);
      return res.status(200).json(os);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const { numero, nomeCliente, cpfCnpj, equipamento, status, dataInicio, dataFim } = req.query;

      const os = await ordemServicoService.listar({
        numero: numero as string | undefined,
        nomeCliente: nomeCliente as string | undefined,
        cpfCnpj: cpfCnpj as string | undefined,
        equipamento: equipamento as string | undefined,
        status: status as StatusOS | undefined,
        dataInicio: dataInicio as string | undefined,
        dataFim: dataFim as string | undefined,
      });

      return res.status(200).json(os);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },
};
