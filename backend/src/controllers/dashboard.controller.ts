import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  async resumo(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      const resumo = await dashboardService.resumo(
        dataInicio as string | undefined,
        dataFim as string | undefined
      );
      return res.status(200).json(resumo);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },
};
