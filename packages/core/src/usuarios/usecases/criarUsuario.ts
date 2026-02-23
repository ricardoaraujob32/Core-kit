// packages/core/src/usuarios/usecases/criarUsuario.ts
// Finalidade: Caso de uso de criação de usuário (somente domínio + ROP).

import type { ContextoExecucao } from "../../contextoExecucao";
import { wrapOk, type Result } from "../../result";
import { type ErroApp } from "../../erros";
import { possuiPermissao } from "../../rbac";
import type { RepositorioUsuarios } from "../portasRepositorio";
import type { AuditoriaWriter } from "../../auditoria/portaAuditoria";
import { nomeValido, normalizarNome } from "../validadores";
import { createErroApp } from "../../ROPHelpers";

type Dependencias = {
  usuariosRepositorio: RepositorioUsuarios;
  auditoria: AuditoriaWriter;
};

export async function criarUsuario(ctx: ContextoExecucao, dependencias: Dependencias, input: { nome: string },): Promise<Result<{ id: string }, ErroApp>> {
  const auth = possuiPermissao(ctx, "USUARIOS_CRIAR");
  if (!auth.ok) return auth;

  const nome = normalizarNome(input.nome);
  if (!nomeValido(nome)) return createErroApp( {codigo:"INVALIDO", mensagem:"Nome inválido"} );

  const existente = await dependencias.usuariosRepositorio.obterPorNome(ctx.locatarioId, nome);
  if (existente) return createErroApp( {codigo:"CONFLITO", mensagem:"Já existe usuário com este nome"} );

  const criado = await dependencias.usuariosRepositorio.criar({ locatarioId: ctx.locatarioId, nome });

  const agora = (ctx.agora ?? (() => new Date()))();

  await dependencias.auditoria.registrar({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    acao: "CRIAR",
    entidade: "Usuario",
    entidadeId: criado.id,
    dados: { nome: criado.nome },
    criadoEm: agora,
  });

  return wrapOk({ id: criado.id });
}
