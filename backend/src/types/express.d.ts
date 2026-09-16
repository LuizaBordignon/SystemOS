import { TipoUsuario } from '../generated/prisma/enums';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        tipo: TipoUsuario;
      };
    }
  }
}