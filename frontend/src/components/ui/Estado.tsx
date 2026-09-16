export function Carregando() {
  return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Carregando...</p>;
}

export function Vazio({ mensagem }: { mensagem: string }) {
  return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{mensagem}</p>;
}

export function ErroCarregamento({ mensagem }: { mensagem: string }) {
  return <p className="py-8 text-center text-sm text-red-600 dark:text-red-400">{mensagem}</p>;
}
