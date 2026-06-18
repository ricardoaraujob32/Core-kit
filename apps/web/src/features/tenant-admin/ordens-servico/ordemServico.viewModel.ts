// apps/web/src/features/tenant-admin/ordens-servico/ordemServico.viewModel.ts

import type { TenantViewModel } from "../../../shared/tenantViewModel";
import {
  fallbackTexto,
  formatarDataBR,
  juntarPartes,
} from "../../../shared/tenantViewModel";

export type OrdemServicoViewModelInput = {
  ordemServicoId: string;
  numero?: string | number | null;
  titulo?: string | null;
  descricao?: string | null;
  clienteNome?: string | null;
  status?: string | null;
  abertaEm?: string | Date | null;
  criadoEm?: string | Date | null;
};

export function toOrdemServicoViewModel(
  ordem: OrdemServicoViewModelInput,
): TenantViewModel {
  const data = formatarDataBR(ordem.abertaEm ?? ordem.criadoEm);

  return {
    key: ordem.ordemServicoId,
    titulo: ordem.numero
      ? `OS nº ${ordem.numero}`
      : fallbackTexto(ordem.titulo ?? ordem.descricao, "Ordem de serviço"),
    subtitulo: ordem.clienteNome ?? "Cliente não informado",
    contexto: data ? `Aberta em: ${data}` : undefined,
    status: ordem.status ?? undefined,
  };
}

export function formatarTituloOrdemServico(
  ordem: OrdemServicoViewModelInput,
): string {
  return toOrdemServicoViewModel(ordem).titulo;
}

export function formatarResumoOrdemServico(
  ordem: OrdemServicoViewModelInput,
): string | undefined {
  const vm = toOrdemServicoViewModel(ordem);

  return juntarPartes([vm.subtitulo, vm.contexto, vm.status]);
}
