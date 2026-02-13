// packages/core/src/usuarios/usecases/criarUsuario.ts
import type { ContextoExecucao } from "../../contextoExecucao";
import { err, ok, type Result } from "../../result";
import { erroApp, type ErroApp } from "../../erros";
import { exigirPermissao } from "../../autorizacao";
import type { RepositorioUsuarios } from "../portasRepositorio";
import type { AuditoriaWriter } from "../../auditoria/portaAuditoria";
import { nomeValido, normalizarNome } from "../validadores";

type Deps = {
  usuariosRepo: RepositorioUsuarios;
  auditoria: AuditoriaWriter;
};

export async function criarUsuario(
  ctx: ContextoExecucao,
  deps: Deps,
  input: { nome: string }
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "USUARIOS_CRIAR");
  if (!auth.ok) return auth;

  const nome = normalizarNome(input.nome);
  if (!nomeValido(nome)) return err(erroApp("VALIDACAO", "Nome inválido"));

  const existente = await deps.usuariosRepo.obterPorNome(ctx.locatarioId, nome);
  if (existente) return err(erroApp("CONFLITO", "Já existe usuário com este nome"));

  const criado = await deps.usuariosRepo.criar({ locatarioId: ctx.locatarioId, nome });

  await deps.auditoria.registrar({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    acao: "CRIAR",
    entidade: "Usuario",
    entidadeId: criado.id,
    dados: { nome: criado.nome },
    criadoEm: ctx.agora()
  });

  return ok({ id: criado.id });
}
