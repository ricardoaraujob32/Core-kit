// apps/web/src/shared/pwa/pwaTypes.ts

export type LoadStatus = "idle" | "loading" | "success" | "error";

export type AsyncResource<TData> = {
  status: LoadStatus;
  data: TData;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reload: () => Promise<void>;
};

export type EntityUpsertHandler<TEntity> = (entity: TEntity) => void;

export type EntityActionHandler<TEntityId extends string = string> = (
  id: TEntityId,
) => Promise<void> | void;

export type EntitySaveHandler<TInput> = (
  input: TInput,
) => Promise<void> | void;

export type DraftState<TDraft> = {
  value: TDraft;
  setValue: (value: TDraft) => void;
  patch: (patch: Partial<TDraft>) => void;
  reset: () => void;
  isDirty: boolean;
};

export type OfflineQueueStatus = "online" | "offline" | "syncing" | "error";

export type OfflineQueueItem<TPayload = unknown> = {
  id: string;
  type: string;
  payload: TPayload;
  createdAt: string;
  attempts: number;
  lastError?: string | null;
};

export type PwaComponentContract = {
  /**
   * Componentes PWA-ready não devem depender de rota.
   */
  routeFree: boolean;

  /**
   * Componentes PWA-ready não devem chamar API diretamente.
   */
  apiFree: boolean;

  /**
   * Componentes PWA-ready devem ser controláveis por props.
   */
  controlledByProps: boolean;
};
