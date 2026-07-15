// apps/web/src/features/tenant-admin/compras/hooks/useCreateCompraPwa.ts

import { useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { createOfflineId } from "../../../../shared/pwa/createOfflineEntity";
import { createScopedOfflineDetailsStore } from "../../../../shared/pwa/scopedOfflineDetailsStore";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useValidatedScopedOfflineEnqueue } from "../../../../shared/pwa/useValidatedScopedOfflineEnqueue";
import { useOnlineStatus } from "../../../../shared/pwa/useOnlineStatus";
import { comprasApi } from "../api/comprasApi";
import type { Transacao } from "../../transacoes/tipos";

export type CriarCompraPwaInput = {
  fornecedorId?: string | null;
  observacao?: string | null;
};

type CreateCompraPwaResult = {
  criar: (input: CriarCompraPwaInput) => Promise<{ transacaoId: string } | null>;
  isSaving: boolean;
  error: string | null;
  isOffline: boolean;
};

function criarCompraOffline(
  locatarioId: string,
  input: CriarCompraPwaInput,
): Transacao {
  const agora = new Date().toISOString();

  return {
    locatarioId,
    transacaoId: createOfflineId("transacao"),
    tipo: "COMPRA",
    clienteId: null,
    fornecedorId: input.fornecedorId ?? null,
    status: "RASCUNHO",
    valorSubtotal: 0,
    valorDesconto: 0,
    valorAcrescimo: 0,
    valorTotal: 0,
    observacao: input.observacao ?? null,
    criadoEm: agora,
    atualizadoEm: agora,
    canceladoEm: null,
    itens: [],
  } as Transacao;
}

export function useCreateCompraPwa(): CreateCompraPwaResult {
  const { scope } = usePwaScope();
  const detailStore = useMemo(() => createScopedOfflineDetailsStore(scope), [scope]);
  const { isOffline } = useOnlineStatus();
  const { enqueue } = useValidatedScopedOfflineEnqueue();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function criar(input: CriarCompraPwaInput) {
    setError(null);
    setIsSaving(true);

    try {
      if (isOffline) {
        if (!scope.locatarioId) {
          setError("Locatário não identificado para criação offline.");
          return null;
        }

        const transacao = criarCompraOffline(scope.locatarioId, input);

        const queued = enqueue({
          type: "compras.criar",
          payload: {
            fornecedorId: input.fornecedorId ?? null,
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

      const response = await comprasApi.criar(input);
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
