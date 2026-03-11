// apps/api/src/index.ts

import { iniciarServidor } from "./server";

async function main(): Promise<void> {
  await iniciarServidor();
}

main().catch((e: unknown) => {
  // fallback simples para garantir saída clara em erro de boot
  // (mais tarde a gente padroniza com logger)
  console.error(e);
  process.exit(1);
});
