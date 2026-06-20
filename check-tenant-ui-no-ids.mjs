#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TENANT_DIR = join(ROOT, "apps/web/src/features/tenant-admin");

const ID_FIELDS = [
  "clienteId",
  "fornecedorId",
  "produtoId",
  "transacaoId",
  "ordemServicoId",
  "usuarioId",
  "locatarioId",
];

const ALLOWED_PATTERNS = [
  /key=\{/,
  /value=\{/,
  /to=\{/,
  /useParams/,
  /params/,
  /buscar/i,
  /editar/i,
  /deletar/i,
  /remover/i,
  /atualizar/i,
  /criar/i,
  /payload/i,
  /body/i,
  /request/i,
  /onChange/i,
  /set[A-Z]/,
  /TechnicalId/,
  /TechnicalSection/,
];

function walk(dir) {
  const result = [];

  if (!existsSync(dir)) {
    return result;
  }

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      result.push(...walk(path));
    } else if (/\.(tsx|ts)$/.test(entry)) {
      result.push(path);
    }
  }

  return result;
}

function isAllowedLine(line) {
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(line));
}

function main() {
  const files = walk(TENANT_DIR);
  const findings = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      for (const field of ID_FIELDS) {
        if (!line.includes(field)) continue;
        if (isAllowedLine(line)) continue;

        findings.push({
          file: relative(ROOT, file),
          line: index + 1,
          field,
          text: line.trim(),
        });
      }
    });
  }

  if (!findings.length) {
    console.log("OK: nenhuma exibição suspeita de ID técnico em tenant.");
    return;
  }

  console.error("Possíveis exibições indevidas de ID técnico em tenant:");

  for (const item of findings) {
    console.error(
      `- ${item.file}:${item.line} [${item.field}] ${item.text}`,
    );
  }

  process.exitCode = 1;
}

main();
