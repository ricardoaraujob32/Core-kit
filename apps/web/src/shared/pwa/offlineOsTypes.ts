// apps/web/src/shared/pwa/offlineOsTypes.ts

export type CriarOrdemServicoOfflinePayload = {
  clienteId?: string | null;
  servicoId?: string | null;
  titulo: string;
  descricao?: string | null;
};
