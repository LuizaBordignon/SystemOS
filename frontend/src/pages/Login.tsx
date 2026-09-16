import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/Campo';
import { Button } from '@/components/ui/Button';
import { AlternadorTema } from '@/components/ui/AlternadorTema';

export function Login() {
  const { usuario, login, carregando } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    try {
      await login(email, senha);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao entrar');
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <AlternadorTema className="absolute right-4 top-4" />
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Sistema de Ordem de Serviço
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Entre com suas credenciais</p>
        <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Input
            label="Senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
          <Button type="submit" disabled={carregando} className="w-full">
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
