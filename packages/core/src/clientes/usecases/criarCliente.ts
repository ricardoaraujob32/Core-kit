// packages/core/src/clientes/usecases/criarCliente.ts
// Finalidade: Caso de uso de criação de cliente (domínio + ROP + RBAC).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioClientes } from "../portasRepositorio";
import { emailValidoOpcional, nomeClienteValido, normalizarNomeCliente } from "../validadores";

type Dependencias = {
  clientesRepositorio: RepositorioClientes;
};

export async function criarCliente(
  ctx: ContextoExecucao,
  dependencias: Dependencias,
  input: { nome: string; email?: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "CLIENTES_CRIAR");
  if (!auth.ok) return auth;

  const nome = normalizarNomeCliente(input.nome);
  if (!nomeClienteValido(nome)) return wrapErr(erroApp("VALIDACAO", "Nome inválido"));

  const email = input.email !== undefined ? String(input.email).trim() : undefined;
  if (!emailValidoOpcional(email)) return wrapErr(erroApp("VALIDACAO", "Email inválido"));

  const existente = await dependencias.clientesRepositorio.obterPorNome(ctx.locatarioId, nome);
  if (existente) return wrapErr(erroApp("CONFLITO", "Já existe cliente com este nome"));

  const criado = await dependencias.clientesRepositorio.criar({
    locatarioId: ctx.locatarioId,
    nome,
    email,
  });

  return wrapOk({ id: criado.id });
}
