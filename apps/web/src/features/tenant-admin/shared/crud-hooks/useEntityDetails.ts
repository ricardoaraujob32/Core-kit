// apps/web/src/features/tenant-admin/shared/crud-hooks/useEntityDetails.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";

type EntityDetailsFetcher<TEntity> = (
  id: string,
) => Promise<{ item: TEntity }>;

export type UseEntityDetailsOptions<TEntity> = {
  id?: string | null;
  invalidIdMessage?: string;
  fetcher: EntityDetailsFetcher<TEntity>;
  enabled?: boolean;
};

export type UseEntityDetailsResult<TEntity> = {
  item: TEntity | null;
  isLoading: boolean;
  erro: string | null;
  reload: () => Promise<void>;
  setItem: (item: TEntity | null) => void;
};

export function useEntityDetails<TEntity>({
  id,
  invalidIdMessage = "Registro inválido.",
  fetcher,
  enabled = true,
}: UseEntityDetailsOptions<TEntity>): UseEntityDetailsResult<TEntity> {
  const [item, setItem] = useState<TEntity | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [erro, setErro] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const normalizedId = id?.trim();

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    if (!normalizedId) {
      setItem(null);
      setErro(invalidIdMessage);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const response = await fetcher(normalizedId);
      setItem(response.item);
    } catch (error) {
      setItem(null);
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetcher, id, invalidIdMessage]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const normalizedId = id?.trim();

      if (!enabled) {
        if (ativo) setIsLoading(false);
        return;
      }

      if (!normalizedId) {
        if (ativo) {
          setItem(null);
          setErro(invalidIdMessage);
          setIsLoading(false);
        }

        return;
      }

      if (ativo) {
        setIsLoading(true);
        setErro(null);
      }

      try {
        const response = await fetcher(normalizedId);

        if (ativo) {
          setItem(response.item);
        }
      } catch (error) {
        if (ativo) {
          setItem(null);
          setErro(mapError(error).message);
        }
      } finally {
        if (ativo) {
          setIsLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [enabled, fetcher, id, invalidIdMessage]);

  return {
    item,
    isLoading,
    erro,
    reload,
    setItem,
  };
}
