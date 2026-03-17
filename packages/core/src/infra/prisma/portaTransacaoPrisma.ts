import type { PrismaClient } from "@prisma/client";
import type { Result } from "../../kernel/result";
import type { ErroApp } from "../../kernel/erros";
import { executarComContexto, type ContextoBanco } from "./execucaoComContexto";

export class PortaTransacaoPrisma {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly contexto: ContextoBanco,
  ) {}

  async executar<T>(
    fn: (tx?: PrismaClient) => Promise<Result<T, ErroApp>>,
  ): Promise<Result<T, ErroApp>> {
    return executarComContexto(this.prisma, this.contexto, async () => fn());
  }
}