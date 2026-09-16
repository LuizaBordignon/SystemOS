import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  // Formato esperado do header: "Bearer eyJhbGc..."
  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ erro: 'Token mal formatado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      tipo: 'ADMIN' | 'TECNICO';
    };

    req.usuario = { id: payload.id, tipo: payload.tipo as any };
    next(); // libera a requisição pra seguir pro controller
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}