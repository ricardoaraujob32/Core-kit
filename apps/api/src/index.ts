// apps/api/src/index.ts

import { buildServer } from "./server";

async function main(): Promise<void> {
  const app = await buildServer();

  const port: number = Number(process.env.PORT ?? 3000);
  const host: string = String(process.env.HOST ?? "0.0.0.0");

  await app.listen({ port, host });
}

main().catch((e: unknown) => {
  // fallback simples para garantir saída clara em erro de boot
  // (mais tarde a gente padroniza com logger)
  console.error(e);
  process.exit(1);
});
