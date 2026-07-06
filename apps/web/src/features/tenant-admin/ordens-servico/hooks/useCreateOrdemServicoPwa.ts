// apps/web/src/features/tenant-admin/ordens-servico/hooks/useCreateOrdemServicoPwa.ts

import { useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { createOfflineId } from "../../../../shared/pwa/createOfflineEntity";
import { createScopedOfflineDetailsStore } from "../../../../shared/pwa/scopedOfflineDetailsStore";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useValidatedScopedOfflineEnqueue } from "../../../../shared/pwa/useValidatedScopedOfflineEnqueue";
import { useOnlineStatus } from "../../../../shared/pwa/useOnlineStatus";
import { ordensServicoApi } from "../api/ordensServicoApi";
import type { CriarOrdemServicoInput, OrdemServico } from "../tipos";

type CreateOrdemServicoPwaResult = {
  criar: (input: CriarOrdemServicoInput) => Promise<OrdemServico | null>;
  isSaving: boolean;
  error: string | null;
  isOffline: boolean;
};

function criarOrdemServicoOffline(input: CriarOrdemServicoInput): OrdemServico {
  const agora = new Date().toISOString();

  return {
    ordemServicoId: createOfflineId("ordemServico"),
    locatarioId: "offline",
    clienteId: input.clienteId ?? null,
    servicoId: input.servicoId ?? null,
    transacaoId: null,
    status: "ABERTA",
    titulo: `${input.titulo} (pendente)`,
    descricao: input.descricao ?? null,
    abertaEm: agora,
    fechadaEm: null,
    criadoEm: agora,
    atualizadoEm: agora,
  } as OrdemServico;
}

export function useCreateOrdemServicoPwa(): CreateOrdemServicoPwaResult {
  const { scope } = usePwaScope();
  const detailStore = useMemo(() => createScopedOfflineDetailsStore(scope), [scope]);
  const { isOffline } = useOnlineStatus();
  const { enqueue } = useValidatedScopedOfflineEnqueue();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function criar(input: CriarOrdemServicoInput) {
    setError(null);
    setIsSaving(true);

    try {
      if (isOffline) {
        const ordemServicoOffline = criarOrdemServicoOffline(input);

        const queued = enqueue({
          type: "ordensServico.criar",
          payload: {
            clienteId: input.clienteId ?? null,
            servicoId: input.servicoId ?? null,
            titulo: input.titulo,
            descricao: input.descricao ?? null,
          },
          localId: ordemServicoOffline.ordemServicoId,
        });

        if (!queued.ok) {
          setError(queued.error);
          return null;
        }

        detailStore.set(
          "ordemServico",
          ordemServicoOffline.ordemServicoId,
          ordemServicoOffline,
        );

        return ordemServicoOffline;
      }

      const response = await ordensServicoApi.criar(input);
      return response.item;
    } catch (cause) {
      setError(mapError(cause).message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return { criar, isSaving, error, isOffline };
}
