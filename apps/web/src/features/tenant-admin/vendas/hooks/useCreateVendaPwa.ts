// apps/web/src/features/tenant-admin/vendas/hooks/useCreateVendaPwa.ts

import { useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { createOfflineId } from "../../../../shared/pwa/createOfflineEntity";
import { createScopedOfflineDetailsStore } from "../../../../shared/pwa/scopedOfflineDetailsStore";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useValidatedScopedOfflineEnqueue } from "../../../../shared/pwa/useValidatedScopedOfflineEnqueue";
import { useOnlineStatus } from "../../../../shared/pwa/useOnlineStatus";
import { vendasApi } from "../api/vendasApi";
import type { Transacao } from "../../transacoes/tipos";

export type CriarVendaPwaInput = {
  clienteId?: string | null;
  observacao?: string | null;
};

type CreateVendaPwaResult = {
  criar: (input: CriarVendaPwaInput) => Promise<{ transacaoId: string } | null>;
  isSaving: boolean;
  error: string | null;
  isOffline: boolean;
};

function criarVendaOffline(input: CriarVendaPwaInput): Transacao {
  const agora = new Date().toISOString();

  return {
    transacaoId: createOfflineId("transacao"),
    tipo: "VENDA",
    clienteId: input.clienteId ?? null,
    fornecedorId: null,
    status: "RASCUNHO",
    valorSubtotal: 0,
    valorDesconto: 0,
    valorAcrescimo: 0,
    valorTotal: 0,
    observacao: input.observacao ?? null,
    criadoEm: agora,
    atualizadoEm: agora,
    canceladoEm: null,
    canceladoPor: null,
    canceladoMotivo: null,
    itens: [],
  } as Transacao;
}

export function useCreateVendaPwa(): CreateVendaPwaResult {
  const { scope } = usePwaScope();
  const detailStore = useMemo(() => createScopedOfflineDetailsStore(scope), [scope]);
  const { isOffline } = useOnlineStatus();
  const { enqueue } = useValidatedScopedOfflineEnqueue();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function criar(input: CriarVendaPwaInput) {
    setError(null);
    setIsSaving(true);

    try {
      if (isOffline) {
        const transacao = criarVendaOffline(input);

        const queued = enqueue({
          type: "vendas.criar",
          payload: {
            clienteId: input.clienteId ?? null,
            observacao: input.observacao ?? null,
          },
          localId: transacao.transacaoId,
        });

        if (!queued.ok) {
          setError(queued.error);
          return null;
        }

        detailStore.set("transacao", transacao.transacaoId, transacao);
        return { transacaoId: transacao.transacaoId };
      }

      const response = await vendasApi.criar(input);
      return { transacaoId: response.item.transacaoId };
    } catch (cause) {
      setError(mapError(cause).message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return { criar, isSaving, error, isOffline };
}
