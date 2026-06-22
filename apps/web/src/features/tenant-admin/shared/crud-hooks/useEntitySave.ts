// apps/web/src/features/tenant-admin/shared/crud-hooks/useEntitySave.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";

type EntitySaveMode = "create" | "edit";

type EntityCreateHandler<TCreateInput, TEntity> = (
  input: TCreateInput,
) => Promise<{ item: TEntity }>;

type EntityUpdateHandler<TUpdateInput, TEntity> = (
  id: string,
  input: TUpdateInput,
) => Promise<{ item: TEntity }>;

export type UseEntitySaveOptions<TCreateInput, TUpdateInput, TEntity> = {
  mode: EntitySaveMode;
  id?: string | null;
  invalidIdMessage?: string;
  create: EntityCreateHandler<TCreateInput, TEntity>;
  update: EntityUpdateHandler<TUpdateInput, TEntity>;
  onSuccess?: (item: TEntity) => void | Promise<void>;
};

export type UseEntitySaveResult<TCreateInput, TUpdateInput> = {
  salvar: (input: TCreateInput | TUpdateInput) => Promise<boolean>;
  isSaving: boolean;
  erro: string | null;
  clearErro: () => void;
};

export function useEntitySave<TCreateInput, TUpdateInput, TEntity>({
  mode,
  id,
  invalidIdMessage = "Registro inválido.",
  create,
  update,
  onSuccess,
}: UseEntitySaveOptions<TCreateInput, TUpdateInput, TEntity>): UseEntitySaveResult<
  TCreateInput,
  TUpdateInput
> {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function clearErro(): void {
    setErro(null);
  }

  async function salvar(input: TCreateInput | TUpdateInput): Promise<boolean> {
    setIsSaving(true);
    setErro(null);

    try {
      const response =
        mode === "create"
          ? await create(input as TCreateInput)
          : await atualizar(input as TUpdateInput);

      await onSuccess?.(response.item);

      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function atualizar(input: TUpdateInput): Promise<{ item: TEntity }> {
    const normalizedId = id?.trim();

    if (!normalizedId) {
      throw new Error(invalidIdMessage);
    }

    return update(normalizedId, input);
  }

  return {
    salvar,
    isSaving,
    erro,
    clearErro,
  };
}
