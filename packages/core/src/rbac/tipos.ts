import { ContextoExecucao } from "../contextoExecucao";
import { ErroApp } from "../erros";
import { Result } from "../result";

export type ResolverPermissoesInput = {
  ctx: ContextoExecucao;
};

export type ResolverPermissoesOutput = {
  ctx: ContextoExecucao; // enriquecido
  permissoes: string[];  // para asserts e logs
  papeis?: string[];     // opcional
};

export type AutorizarOperacaoInput = {
  ctx: ContextoExecucao;
  permissao: string; // Permissao canônica; manter string para compat com BD
};

export type ResultadoResolverPermissoes = Promise<
  Result<ResolverPermissoesOutput, ErroApp>
>;

export type ResultadoAutorizarOperacao = Result<void, ErroApp>;