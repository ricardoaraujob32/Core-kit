// packages/core/src/fornecedores/usecases/criarFornecedor.ts
// Finalidade: Caso de uso de criação de fornecedor (domínio + ROP + RBAC).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioFornecedores } from "../portasRepositorio";
import { emailValidoOpcional, nomeFornecedorValido, normalizarNomeFornecedor } from "../validadores";

type Dependencias = {
  fornecedoresRepo: RepositorioFornecedores;
};

export async function criarFornecedor(
  ctx: ContextoExecucao,
  dependencias: Dependencias,
  input: { nome: string; email?: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "FORNECEDORES_CRIAR");
  if (!auth.ok) return auth;

  const nome = normalizarNomeFornecedor(input.nome);
  if (!nomeFornecedorValido(nome)) return wrapErr(erroApp("VALIDACAO", "Nome inválido"));

  const email = input.email !== undefined ? String(input.email).trim() : undefined;
  if (!emailValidoOpcional(email)) return wrapErr(erroApp("VALIDACAO", "Email inválido"));

  const existente = await dependencias.fornecedoresRepo.obterPorNome(ctx.locatarioId, nome);
  if (existente) return wrapErr(erroApp("CONFLITO", "Já existe fornecedor com este nome"));

  const criado = await dependencias.fornecedoresRepo.criar({
    locatarioId: ctx.locatarioId,
    nome,
    email,
  });

  return wrapOk({ id: criado.id });
}
