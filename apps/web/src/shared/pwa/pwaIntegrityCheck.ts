// apps/web/src/shared/pwa/pwaIntegrityCheck.ts

import { isOfflineEntityId } from "./createOfflineEntity";
import { collectPwaDiagnostics } from "./pwaDiagnostics";
import { getPwaStorageUsage } from "./pwaStorageUsage";
import { createScopedOfflineIdMap } from "./scopedOfflineIdMap";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { buildPwaCacheKey, type PwaScope } from "./pwaScope";
import type { PwaQueueItem } from "./pwaSyncTypes";

export type PwaIntegritySeverity = "ok" | "info" | "warning" | "danger";

export type PwaIntegrityIssue = {
  id: string;
  severity: PwaIntegritySeverity;
  title: string;
  message: string;
  source: "queue" | "idMap" | "details" | "cache" | "serviceWorker" | "storage";
  meta?: unknown;
};

export type PwaIntegrityReport = {
  generatedAt: string;
  severity: PwaIntegritySeverity;
  issues: PwaIntegrityIssue[];
  summary: {
    ok: number;
    info: number;
    warning: number;
    danger: number;
  };
};

function createIssue(params: Omit<PwaIntegrityIssue, "id">): PwaIntegrityIssue {
  return {
    ...params,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function collectIdsFromPayload(item: PwaQueueItem): Array<{
  field: string;
  value: string;
}> {
  const payload = asRecord(item.payload);
  const fields = [
    "clienteId",
    "fornecedorId",
    "servicoId",
    "produtoId",
    "transacaoId",
    "itemTransacaoId",
  ];

  return fields
    .map((field) => ({
      field,
      value: payload[field],
    }))
    .filter(
      (entry): entry is { field: string; value: string } =>
        typeof entry.value === "string" && entry.value.trim().length > 0,
    );
}

function inferKindFromField(field: string) {
  if (field === "clienteId") return "cliente";
  if (field === "fornecedorId") return "fornecedor";
  if (field === "servicoId") return "servico";
  if (field === "produtoId") return "produto";
  if (field === "transacaoId") return "transacao";
  if (field === "itemTransacaoId") return "produto";
  return "produto";
}

function highestSeverity(issues: PwaIntegrityIssue[]): PwaIntegritySeverity {
  if (issues.some((issue) => issue.severity === "danger")) return "danger";
  if (issues.some((issue) => issue.severity === "warning")) return "warning";
  if (issues.some((issue) => issue.severity === "info")) return "info";
  return "ok";
}

function summarize(issues: PwaIntegrityIssue[]) {
  return {
    ok: issues.filter((issue) => issue.severity === "ok").length,
    info: issues.filter((issue) => issue.severity === "info").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    danger: issues.filter((issue) => issue.severity === "danger").length,
  };
}

function checkQueue(scope: PwaScope): PwaIntegrityIssue[] {
  const queue = createScopedOfflineQueue(scope);
  const idMap = createScopedOfflineIdMap(scope);
  const issues: PwaIntegrityIssue[] = [];

  for (const item of queue.list()) {
    if (item.status === "blocked") {
      issues.push(
        createIssue({
          severity: "danger",
          source: "queue",
          title: "Pendência bloqueada",
          message: `${item.type} está bloqueada e exige ação manual.`,
          meta: item,
        }),
      );
    }

    if (item.status === "failed") {
      issues.push(
        createIssue({
          severity: "warning",
          source: "queue",
          title: "Pendência com falha",
          message: `${item.type} falhou e pode precisar de nova tentativa.`,
          meta: item,
        }),
      );
    }

    for (const dependency of collectIdsFromPayload(item)) {
      if (!isOfflineEntityId(dependency.value)) continue;

      const kind = inferKindFromField(dependency.field);
      const resolved = idMap.resolve(kind, dependency.value);

      if (isOfflineEntityId(resolved)) {
        issues.push(
          createIssue({
            severity: "warning",
            source: "queue",
            title: "Dependência offline não resolvida",
            message: `${item.type} depende de ${dependency.field} ainda temporário.`,
            meta: {
              item,
              field: dependency.field,
              value: dependency.value,
              resolved,
            },
          }),
        );
      }
    }
  }

  return issues;
}

function checkDetails(scope: PwaScope): PwaIntegrityIssue[] {
  if (typeof localStorage === "undefined") return [];

  const scopePrefix = buildPwaCacheKey(scope, "");
  const detailsPrefix = `corekit:pwa:details:${scopePrefix}`;
  const queue = createScopedOfflineQueue(scope);
  const queueLocalIds = new Set(queue.list().map((item) => item.localId).filter(Boolean));
  const issues: PwaIntegrityIssue[] = [];

  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(detailsPrefix)) continue;

    const hasRelatedQueueItem = [...queueLocalIds].some((id) =>
      typeof id === "string" ? key.includes(id) : false,
    );

    if (!hasRelatedQueueItem) {
      issues.push(
        createIssue({
          severity: "info",
          source: "details",
          title: "Detalhe offline possivelmente órfão",
          message: "Há detalhe offline sem pendência correspondente na fila.",
          meta: { key },
        }),
      );
    }
  }

  return issues;
}

function checkLegacyKeys(): PwaIntegrityIssue[] {
  if (typeof localStorage === "undefined") return [];

  const issues: PwaIntegrityIssue[] = [];

  for (const key of Object.keys(localStorage)) {
    if (key === "corekit:pwa:queue" || key === "corekit:pwa:id-map") {
      issues.push(
        createIssue({
          severity: "warning",
          source: "cache",
          title: "Chave PWA antiga encontrada",
          message: "Execute a migração/saneamento local.",
          meta: { key },
        }),
      );
    }
  }

  return issues;
}

async function checkDiagnostics(scope: PwaScope): Promise<PwaIntegrityIssue[]> {
  const diagnostics = await collectPwaDiagnostics(scope);
  const issues: PwaIntegrityIssue[] = [];

  if (!diagnostics.serviceWorkerSupported) {
    issues.push(
      createIssue({
        severity: "warning",
        source: "serviceWorker",
        title: "Service Worker não suportado",
        message: "Este navegador não suporta Service Worker.",
        meta: diagnostics,
      }),
    );
  } else if (!diagnostics.serviceWorkerController) {
    issues.push(
      createIssue({
        severity: "info",
        source: "serviceWorker",
        title: "Página ainda não controlada pelo Service Worker",
        message: "Recarregue a página depois do registro do Service Worker.",
        meta: diagnostics,
      }),
    );
  }

  if (diagnostics.cacheNames.length === 0) {
    issues.push(
      createIssue({
        severity: "info",
        source: "cache",
        title: "Nenhum cache do navegador encontrado",
        message: "O cache pode ainda não ter sido criado ou o app está em dev.",
        meta: diagnostics,
      }),
    );
  }

  return issues;
}

function checkStorage(): PwaIntegrityIssue[] {
  const usage = getPwaStorageUsage();
  const issues: PwaIntegrityIssue[] = [];

  if (usage.totalBytes > 2 * 1024 * 1024) {
    issues.push(
      createIssue({
        severity: "warning",
        source: "storage",
        title: "Uso local elevado",
        message: `O PWA está usando ${usage.totalKb} KB no localStorage.`,
        meta: usage,
      }),
    );
  }

  return issues;
}

export async function runPwaIntegrityCheck(
  scope: PwaScope,
): Promise<PwaIntegrityReport> {
  const issues = [
    ...checkQueue(scope),
    ...checkDetails(scope),
    ...checkLegacyKeys(),
    ...checkStorage(),
    ...(await checkDiagnostics(scope)),
  ];

  if (issues.length === 0) {
    issues.push(
      createIssue({
        severity: "ok",
        source: "storage",
        title: "Integridade local OK",
        message: "Nenhum problema local PWA foi encontrado.",
      }),
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    severity: highestSeverity(issues),
    issues,
    summary: summarize(issues),
  };
}
