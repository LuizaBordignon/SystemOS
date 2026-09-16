import { StatusOS } from '@/types/api';

// Espelha backend/src/services/ordemServico.service.ts — mantido em sincronia
// manualmente já que frontend e backend são projetos separados. A validação
// de verdade acontece no backend; isso aqui só orienta quais botões mostrar.
export const TRANSICOES_PERMITIDAS: Record<StatusOS, StatusOS[]> = {
  [StatusOS.AGUARDANDO_DIAGNOSTICO]: [StatusOS.EM_DIAGNOSTICO, StatusOS.CANCELADA],
  [StatusOS.EM_DIAGNOSTICO]: [StatusOS.AGUARDANDO_APROVACAO, StatusOS.CANCELADA],
  [StatusOS.AGUARDANDO_APROVACAO]: [StatusOS.APROVADA, StatusOS.CANCELADA],
  [StatusOS.APROVADA]: [StatusOS.EM_MANUTENCAO, StatusOS.CANCELADA],
  [StatusOS.EM_MANUTENCAO]: [StatusOS.AGUARDANDO_PECA, StatusOS.FINALIZADA, StatusOS.CANCELADA],
  [StatusOS.AGUARDANDO_PECA]: [StatusOS.EM_MANUTENCAO, StatusOS.CANCELADA],
  [StatusOS.FINALIZADA]: [StatusOS.ENTREGUE],
  [StatusOS.ENTREGUE]: [],
  [StatusOS.CANCELADA]: [],
};

export const STATUS_BLOQUEADOS_PARA_EDICAO: StatusOS[] = [StatusOS.ENTREGUE, StatusOS.CANCELADA];
