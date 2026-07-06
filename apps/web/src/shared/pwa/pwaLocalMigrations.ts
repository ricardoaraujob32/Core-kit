// apps/web/src/shared/pwa/pwaLocalMigrations.ts

import {
  backupPwaLocalStorage,
  getPwaLocalSchemaVersion,
  PWA_LOCAL_SCHEMA_VERSION,
  setPwaLocalSchemaVersion,
} from "./pwaLocalSchema";

export type PwaLocalMigrationResult = {
  migrated: boolean;
  fromVersion: number;
  toVersion: number;
  backupKey: string | null;
  messages: string[];
};

type Migration = {
  version: number;
  description: string;
  run: () => string[];
};

function renameKey(oldKey: string, newKey: string): string | null {
  const value = localStorage.getItem(oldKey);

  if (value === null) return null;

  if (localStorage.getItem(newKey) === null) {
    localStorage.setItem(newKey, value);
  }

  localStorage.removeItem(oldKey);

  return `${oldKey} -> ${newKey}`;
}

function removeDeprecatedKeys(): string[] {
  const messages: string[] = [];

  const deprecatedPrefixes = [
    "tenant:clientes:list",
    "tenant:fornecedores:list",
    "tenant:produtos:list",
    "tenant:servicos:list",
  ];

  for (const key of Object.keys(localStorage)) {
    if (deprecatedPrefixes.some((prefix) => key.includes(prefix))) {
      // Só remove cache antigo sem prefixo corekit:pwa:cache.
      if (!key.startsWith("corekit:pwa:cache:")) {
        localStorage.removeItem(key);
        messages.push(`removida chave antiga: ${key}`);
      }
    }
  }

  return messages;
}

const MIGRATIONS: Migration[] = [
  {
    version: 2,
    description: "Padronizar chaves antigas e remover caches sem escopo.",
    run: () => {
      const messages: string[] = [];

      const renamed = [
        renameKey("corekit:pwa:queue", "corekit:pwa:queue:legacy"),
        renameKey("corekit:pwa:id-map", "corekit:pwa:id-map:legacy"),
      ].filter(Boolean) as string[];

      messages.push(...renamed);
      messages.push(...removeDeprecatedKeys());

      if (messages.length === 0) {
        messages.push("nenhuma chave antiga encontrada");
      }

      return messages;
    },
  },
];

export function runPwaLocalMigrations(): PwaLocalMigrationResult {
  const fromVersion = getPwaLocalSchemaVersion();

  if (fromVersion >= PWA_LOCAL_SCHEMA_VERSION) {
    return {
      migrated: false,
      fromVersion,
      toVersion: PWA_LOCAL_SCHEMA_VERSION,
      backupKey: null,
      messages: ["schema local já está atualizado"],
    };
  }

  const backupKey = backupPwaLocalStorage(`migration-v${fromVersion}-to-v${PWA_LOCAL_SCHEMA_VERSION}`);

  const messages: string[] = [];

  for (const migration of MIGRATIONS) {
    if (migration.version > fromVersion) {
      messages.push(`v${migration.version}: ${migration.description}`);
      messages.push(...migration.run());
      setPwaLocalSchemaVersion(migration.version);
    }
  }

  setPwaLocalSchemaVersion(PWA_LOCAL_SCHEMA_VERSION);

  return {
    migrated: true,
    fromVersion,
    toVersion: PWA_LOCAL_SCHEMA_VERSION,
    backupKey,
    messages,
  };
}
