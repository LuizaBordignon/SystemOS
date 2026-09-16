import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type Tema = 'claro' | 'escuro';

interface TemaContextValue {
  tema: Tema;
  alternarTema: () => void;
}

const TemaContext = createContext<TemaContextValue | null>(null);

function lerTemaSalvo(): Tema {
  const salvo = localStorage.getItem('tema');
  if (salvo === 'claro' || salvo === 'escuro') return salvo;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo);

  // O <head> já aplica a classe antes do React montar (evita flash);
  // isso aqui só mantém tudo em sincronia quando o usuário alterna.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'escuro');
    localStorage.setItem('tema', tema);
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((atual) => (atual === 'claro' ? 'escuro' : 'claro'));
  }, []);

  return <TemaContext.Provider value={{ tema, alternarTema }}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error('useTema precisa ser usado dentro de um TemaProvider');
  }
  return contexto;
}
