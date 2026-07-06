// apps/web/src/shared/pwa/pwaQueueIssueHelpers.ts

import type { PwaQueueItem, PwaSyncErrorKind } from "./pwaSyncTypes";

export type PwaQueueIssueSeverity = "info" | "warning" | "danger";

export function getQueueIssueTitle(item: PwaQueueItem): string {
  switch (item.lastErrorKind) {
    case "conflict":
      return "Conflito encontrado";
    case "validation":
      return "Dados inválidos";
    case "permission":
      return "Permissão ou autenticação";
    case "dependency":
      return "Dependência não resolvida";
    case "temporary":
      return "Falha temporária";
    case "unknown":
    default:
      return "Falha de sincronização";
  }
}

export function getQueueIssueDescription(item: PwaQueueItem): string {
  switch (item.lastErrorKind) {
    case "conflict":
      return "Provavelmente já existe um registro semelhante no sistema. Verifique antes de tentar novamente.";
    case "validation":
      return "O backend rejeitou os dados. Pode ser necessário editar ou remover esta pendência.";
    case "permission":
      return "A sessão pode ter expirado ou o usuário não possui permissão para esta operação.";
    case "dependency":
      return "Esta pendência depende de outro registro offline que ainda não foi sincronizado.";
    case "temporary":
      return "O erro parece temporário. Tentar novamente pode resolver.";
    case "unknown":
    default:
      return "Não foi possível classificar o erro. Verifique os detalhes técnicos.";
  }
}

export function getQueueIssueSeverity(
  kind?: PwaSyncErrorKind | null,
): PwaQueueIssueSeverity {
  switch (kind) {
    case "permission":
    case "validation":
    case "conflict":
      return "danger";
    case "dependency":
    case "temporary":
      return "warning";
    default:
      return "info";
  }
}

export function canRetryQueueIssue(item: PwaQueueItem): boolean {
  return (
    item.status === "failed" ||
    item.lastErrorKind === "temporary" ||
    item.lastErrorKind === "dependency" ||
    item.lastErrorKind === "permission"
  );
}

export function canUnblockQueueIssue(item: PwaQueueItem): boolean {
  return item.status === "blocked";
}

export function formatQueuePayload(item: PwaQueueItem): string {
  return JSON.stringify(
    {
      id: item.id,
      type: item.type,
      localId: item.localId,
      status: item.status,
      attempts: item.attempts,
      lastError: item.lastError,
      lastErrorKind: item.lastErrorKind,
      payload: item.payload,
      lastErrorDetails: item.lastErrorDetails,
    },
    null,
    2,
  );
}
