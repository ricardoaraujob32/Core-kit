#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const tenantDir = join(root, "apps/web/src/features/tenant-admin");
const superadminDir = join(root, "apps/web/src/features/superadmin");

const tenantIdFields = [
  "clienteId",
  "fornecedorId",
  "produtoId",
  "transacaoId",
  "ordemServicoId",
];

const allowedTenantPatterns = [
  /key=\{/,
  /value=\{/,
  /to=\{/,
  /useParams/,
  /params/,
  /payload/i,
  /body/i,
  /request/i,
  /onChange/i,
  /set[A-Z]/,
  /buscar/i,
  /editar/i,
  /criar/i,
  /atualizar/i,
  /remover/i,
  /deletar/i,
  /TechnicalId/,
  /TechnicalSection/,
  /type /,
  /interface /,
  /export type/,
  /import /,
];

function walk(dir) {
  const files = [];
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...walk(path));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(path);
    }
  }

  return files;
}

function isAllowedTenantLine(line) {
  return allowedTenantPatterns.some((pattern) => pattern.test(line));
}

function checkTenant() {
  const findings = [];

  for (const file of walk(tenantDir)) {
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, index) => {
      for (const field of tenantIdFields) {
        if (!line.includes(field)) continue;
        if (isAllowedTenantLine(line)) continue;

        findings.push({
          file: relative(root, file),
          line: index + 1,
          field,
          text: line.trim(),
        });
      }
    });
  }

  return findings;
}

function checkSuperadminExists() {
  return existsSync(superadminDir);
}

const tenantFindings = checkTenant();

if (tenantFindings.length) {
  console.error("Possíveis violações da política visual tenant:");
  for (const item of tenantFindings) {
    console.error(`- ${item.file}:${item.line} [${item.field}] ${item.text}`);
  }
} else {
  console.log("OK: nenhuma exibição suspeita de ID técnico em tenant.");
}

if (checkSuperadminExists()) {
  console.log("OK: área superadmin encontrada; regra de IDs técnicos preservada.");
} else {
  console.warn("AVISO: área superadmin não encontrada no caminho esperado.");
}

if (tenantFindings.length) {
  process.exitCode = 1;
}
