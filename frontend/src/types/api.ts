export const TipoUsuario = {
  ADMIN: 'ADMIN',
  TECNICO: 'TECNICO',
} as const;
export type TipoUsuario = (typeof TipoUsuario)[keyof typeof TipoUsuario];

export const StatusOS = {
  AGUARDANDO_DIAGNOSTICO: 'AGUARDANDO_DIAGNOSTICO',
  EM_DIAGNOSTICO: 'EM_DIAGNOSTICO',
  AGUARDANDO_APROVACAO: 'AGUARDANDO_APROVACAO',
  APROVADA: 'APROVADA',
  EM_MANUTENCAO: 'EM_MANUTENCAO',
  AGUARDANDO_PECA: 'AGUARDANDO_PECA',
  FINALIZADA: 'FINALIZADA',
  ENTREGUE: 'ENTREGUE',
  CANCELADA: 'CANCELADA',
} as const;
export type StatusOS = (typeof StatusOS)[keyof typeof StatusOS];

export const STATUS_LABEL: Record<StatusOS, string> = {
  AGUARDANDO_DIAGNOSTICO: 'Aguardando diagnóstico',
  EM_DIAGNOSTICO: 'Em diagnóstico',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  APROVADA: 'Aprovada',
  EM_MANUTENCAO: 'Em manutenção',
  AGUARDANDO_PECA: 'Aguardando peça',
  FINALIZADA: 'Finalizada',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
};

export interface UsuarioAtivo {
  id: number;
  nome: string;
  tipo: TipoUsuario;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  ativo: boolean;
  criadoEm: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  criadoEm: string;
  equipamentos?: Equipamento[];
  ordensServico?: OrdemServico[];
}

export interface Equipamento {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string | null;
  observacoes: string | null;
  criadoEm: string;
  clienteId: number;
  cliente?: Cliente;
  ordensServico?: OrdemServico[];
}

export interface HistoricoStatusOS {
  id: number;
  statusAnterior: StatusOS | null;
  statusNovo: StatusOS;
  alteradoEm: string;
  usuario: { id: number; nome: string };
}

export interface LogAlteracaoOS {
  id: number;
  campo: string;
  valorAntigo: string | null;
  valorNovo: string | null;
  alteradoEm: string;
  usuario: { id: number; nome: string };
}

export interface OrdemServico {
  id: number;
  numero: string;
  status: StatusOS;
  problemaRelatado: string;
  diagnostico: string | null;
  servicoRealizado: string | null;
  observacoes: string | null;
  valorPecas: string;
  valorMaoDeObra: string;
  valorTotal: string;
  dataAbertura: string;
  prazoEstimado: string | null;
  dataEntrega: string | null;
  clienteId: number;
  equipamentoId: number;
  tecnicoId: number;
  cliente: Cliente;
  equipamento: Equipamento;
  tecnico: { id: number; nome: string; email: string };
  historicoStatus?: HistoricoStatusOS[];
  logsAlteracao?: LogAlteracaoOS[];
}

export interface DashboardResumo {
  totalAbertas: number;
  aguardandoDiagnostico: number;
  aguardandoAprovacao: number;
  emManutencao: number;
  finalizadas: number;
  entregues: number;
  valorTotalPeriodo: string;
  ordensRecentes: OrdemServico[];
}
