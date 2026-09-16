import { Request, Response, NextFunction } from 'express';
import { TipoUsuario } from '../generated/prisma/enums';

export function autorizar(...tiposPermitidos: TipoUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    if (!tiposPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({ erro: 'Sem permissão para acessar este recurso' });
    }

    next();
  };
}