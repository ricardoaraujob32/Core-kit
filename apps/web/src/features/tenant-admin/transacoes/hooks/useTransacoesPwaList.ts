// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacoesPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useTransacoes } from "./useTransacoes";
import type { Transacao } from "../tipos";

function isTransacao(value: Transacao | null): value is Transacao {
  return value !== null;
}

export function useTransacoesPwaList() {
  const resource = useTransacoes();
  const pending = usePwaPendingProjections();
  const { scope } = usePwaScope();

  const getId = useCallback((item: Transacao) => item.transacaoId, []);

  const pendingItems = useMemo(
    () =>
      pending.transacoes
        .map((transacao) =>
          transacao
            ? ({
                ...transacao,
                locatarioId: scope.locatarioId,
              } as Transacao)
            : null,
        )
        .filter(isTransacao),
    [pending.transacoes, scope.locatarioId],
  );

  const data = useMergePwaPendingItems<Transacao>({
    items: resource.transacoes ?? [],
    pendingItems,
    getId,
  });

  return useMemo(
    () => ({
      ...resource,
      transacoes: data,
      data,
    }),
    [resource, data],
  );
}
