// apps/web/scripts/check-pwa-dist.mjs

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");

const requiredFiles = [
  "manifest.webmanifest",
  "sw.js",
  "offline.html",
];

const requiredIconFiles = [
  "icons/pwa-192.png",
  "icons/pwa-512.png",
];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
}

console.log("Verificando build PWA em:", dist);

if (!existsSync(dist)) {
  fail("Pasta dist não encontrada. Rode pnpm --filter web build primeiro.");
  process.exit();
}

for (const file of requiredFiles) {
  const path = resolve(dist, file);

  if (!existsSync(path)) {
    fail(`Arquivo obrigatório ausente: dist/${file}`);
  } else {
    ok(`Encontrado: dist/${file}`);
  }
}

for (const file of requiredIconFiles) {
  const path = resolve(dist, file);

  if (!existsSync(path)) {
    warn(`Ícone ausente: dist/${file}`);
  } else {
    const size = statSync(path).size;
    ok(`Ícone encontrado: dist/${file} (${size} bytes)`);
  }
}

const manifestPath = resolve(dist, "manifest.webmanifest");

if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

    if (!manifest.name) fail("manifest.webmanifest sem name.");
    if (!manifest.short_name) fail("manifest.webmanifest sem short_name.");
    if (!manifest.start_url) fail("manifest.webmanifest sem start_url.");
    if (!manifest.display) fail("manifest.webmanifest sem display.");
    if (!manifest.icons?.length) warn("manifest.webmanifest sem icons.");

    ok("Manifest parseado com sucesso.");
  } catch (error) {
    fail(`Manifest inválido: ${error.message}`);
  }
}

const swPath = resolve(dist, "sw.js");

if (existsSync(swPath)) {
  const sw = readFileSync(swPath, "utf8");

  if (!sw.includes("install")) fail("sw.js não contém listener de install.");
  if (!sw.includes("activate")) fail("sw.js não contém listener de activate.");
  if (!sw.includes("fetch")) fail("sw.js não contém listener de fetch.");
  if (sw.includes("/api/") && !sw.includes("startsWith("/api/")")) {
    warn("Verifique se o service worker não cacheia APIs autenticadas.");
  }

  ok("Service worker contém listeners básicos.");
}

if (process.exitCode) {
  console.error("\nBuild PWA contém problemas.");
  process.exit(process.exitCode);
}

console.log("\n✅ Build PWA passou nas verificações básicas.");
