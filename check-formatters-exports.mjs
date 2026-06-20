#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const formattersDir = join(root, "apps/web/src/shared/formatters");
const indexFile = join(formattersDir, "index.ts");

const requiredExports = [
  "./commonLabel",
  "./clienteLabel",
  "./fornecedorLabel",
  "./produtoLabel",
  "./transacaoLabel",
  "./ordemServicoLabel",
  "./financeiroLabel",
];

if (!existsSync(indexFile)) {
  console.error("ERRO: apps/web/src/shared/formatters/index.ts não encontrado.");
  process.exit(1);
}

const content = readFileSync(indexFile, "utf8");

let failed = false;

for (const exp of requiredExports) {
  if (!content.includes(`export * from "${exp}"`) && !content.includes(`export * from '${exp}'`)) {
    console.error(`ERRO: index.ts não exporta ${exp}`);
    failed = true;
  }
}

const forbiddenPatterns = [
  /export \* from ["']\.\/index["'];?/,
  /export \* from ["']\.["'];?/,
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(content)) {
    console.error("ERRO: index.ts contém export circular.");
    failed = true;
  }
}

const commonLabel = join(formattersDir, "commonLabel.ts");
if (existsSync(commonLabel)) {
  const common = readFileSync(commonLabel, "utf8");
  for (const fn of ["shortCode", "formatMoney", "formatDate"]) {
    if (!common.includes(`function ${fn}`)) {
      console.error(`ERRO: commonLabel.ts não contém ${fn}.`);
      failed = true;
    }
  }
} else {
  console.error("ERRO: commonLabel.ts não encontrado.");
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log("OK: formatters com exports mínimos compatíveis.");
