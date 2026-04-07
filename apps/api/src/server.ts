// apps/api/src/server.ts

import { env } from "./env";
import { criarApp } from "./app";

async function main(): Promise<void>{
  const app = await criarApp();

  await app.listen({
    host: env.HOST,
    port: env.PORT,
  });
}

main().catch((e: unknown) => {
  // fallback simples para garantir saída clara em erro de boot
  // (mais tarde a gente padroniza com logger)
  console.error(e);
  process.exit(1);
});
