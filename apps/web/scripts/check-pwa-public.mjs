// apps/web/scripts/check-pwa-public.mjs

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const requiredPublicFiles = [
  "public/sw.js",
  "public/manifest.webmanifest",
  "public/offline.html",
];

let ok = true;

console.log("Verificando arquivos públicos PWA...");

for (const file of requiredPublicFiles) {
  const path = resolve(root, file);

  if (!existsSync(path)) {
    console.error(`❌ Ausente: ${file}`);
    ok = false;
  } else {
    console.log(`✅ ${file}`);
  }
}

const indexPath = resolve(root, "index.html");

if (!existsSync(indexPath)) {
  console.error("❌ Ausente: index.html");
  ok = false;
} else {
  const html = readFileSync(indexPath, "utf8");

  if (!html.includes('rel="manifest"') && !html.includes("rel='manifest'")) {
    console.error("❌ index.html sem link rel=manifest");
    ok = false;
  } else {
    console.log("✅ index.html contém manifest");
  }

  if (!html.includes("theme-color")) {
    console.error("❌ index.html sem meta theme-color");
    ok = false;
  } else {
    console.log("✅ index.html contém theme-color");
  }
}

if (!ok) {
  console.error("\nIntegração pública PWA incompleta.");
  process.exit(1);
}

console.log("\n✅ Arquivos públicos PWA OK.");
