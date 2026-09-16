import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    try {
      const resultado = await authService.login(email, senha);
      return res.status(200).json(resultado);
    } catch (erro) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
  },
};