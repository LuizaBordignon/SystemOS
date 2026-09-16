import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import type { TipoUsuario } from '@/types/api';

interface Props {
  children: ReactNode;
  tiposPermitidos?: TipoUsuario[];
}

export function RotaProtegida({ children, tiposPermitidos }: Props) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (tiposPermitidos && !tiposPermitidos.includes(usuario.tipo)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
