import { ordemServicoRepository } from '../repositories/ordemServico.repository';
import { StatusOS } from '../generated/prisma/enums';

function contar(contagens: { status: StatusOS; _count: { _all: number } }[], status: StatusOS) {
  return contagens.find((c) => c.status === status)?._count._all ?? 0;
}

export const dashboardService = {
  async resumo(dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ? new Date(dataInicio) : undefined;
    const fim = dataFim ? new Date(dataFim) : undefined;

    const [contagens, valorTotalPeriodo, recentes] = await Promise.all([
      ordemServicoRepository.contarPorStatus(),
      ordemServicoRepository.somarValorTotalPeriodo(inicio, fim),
      ordemServicoRepository.listarRecentes(10),
    ]);

    const totalAbertas = contagens.reduce((soma, c) => {
      const ehFinal = c.status === StatusOS.ENTREGUE || c.status === StatusOS.CANCELADA;
      return ehFinal ? soma : soma + c._count._all;
    }, 0);

    return {
      totalAbertas,
      aguardandoDiagnostico: contar(contagens, StatusOS.AGUARDANDO_DIAGNOSTICO),
      aguardandoAprovacao: contar(contagens, StatusOS.AGUARDANDO_APROVACAO),
      emManutencao: contar(contagens, StatusOS.EM_MANUTENCAO),
      finalizadas: contar(contagens, StatusOS.FINALIZADA),
      entregues: contar(contagens, StatusOS.ENTREGUE),
      valorTotalPeriodo,
      ordensRecentes: recentes,
    };
  },
};
