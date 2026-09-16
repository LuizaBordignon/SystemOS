import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { TipoUsuario } from '@/types/api';
import { AlternadorTema } from '@/components/ui/AlternadorTema';

interface LinkNav {
  to: string;
  label: string;
  fim?: boolean;
}

const LINKS: LinkNav[] = [
  { to: '/', label: 'Dashboard', fim: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/equipamentos', label: 'Equipamentos' },
  { to: '/ordens-servico', label: 'Ordens de Serviço' },
];

const LINK_ADMIN: LinkNav = { to: '/usuarios', label: 'Usuários' };

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const links = usuario?.tipo === TipoUsuario.ADMIN ? [...LINKS, LINK_ADMIN] : LINKS;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Sistema OS</span>
          <AlternadorTema />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.fim ?? false}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{usuario?.nome}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {usuario?.tipo === TipoUsuario.ADMIN ? 'Administrador' : 'Técnico'}
          </p>
          <button
            onClick={logout}
            className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}
