// apps/api/src/modules/rbac/rbac.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../../http/serializarErroApp";
import {
  criarContextoAuditoria,
  obterCtxAutorizadoOuResponderErro,
  obterCtxComPermissaoOuResponderErro,
} from "../helpers";
import { auditar } from "../auditoria/auditoria.dispatcher.instance";
import {
  metaAtribuicaoPermissao,
  metaAtualizacaoPapel,
  metaAtualizacaoPapeisUsuario,
  metaCriacaoPapel,
  metaRemocaoPermissao,
} from "./rbac.auditoria";

/**
 * AJUSTE AQUI:
 * Os nomes abaixo devem ser alinhados aos casos de uso/exports reais
 * do Core e aos adapters Prisma reais do projeto.
 */
import {
  Permissoes,
  createFnCriarPapel,
  createFnAtualizarPapel,
  createFnAtribuirPermissaoAoPapel,
  createFnRemoverPermissaoDoPapel,
  createFnAtualizarPapeisDoUsuario,
} from "@core-kit/core";

/**
 * AJUSTE AQUI:
 * alinhar com os repositórios/adapters reais de RBAC.
 */
import { clientePrisma } from "../../infra/prisma/client";
import { createAuthHttpRuntime } from "../../infra/prisma/auth";
import { createPapeisRepositorio } from "../../infra/prisma/rbac/papeisRepositorioPrisma";
import { createPapelPermissoesRepositorio } from "../../infra/prisma/rbac/papelPermissoesRepositorioPrisma";
import { createUsuariosPapeisRepositorio } from "../../infra/prisma/rbac/usuariosPapeisRepositorioPrisma";
import { createUsuariosRepositorio } from "../../infra/prisma/usuarios/usuariosRepositorioPrisma";

import type {
  AtualizarPapeisUsuarioBodyDto,
  AtualizarPapelBodyDto,
  AtribuirPermissaoBodyDto,
  CriarPapelBodyDto,
  PapelIdParamsDto,
  RemoverPermissaoBodyDto,
  UsuarioIdParamsDto,
} from "./rbac.dto";

/**
 * Runtime técnico central da borda.
 */
const authRuntime = createAuthHttpRuntime();

/**
 * Monta as dependências operacionais do módulo de RBAC.
 *
 * @returns Dependências prontas para os controllers.
 */
function criarDepsRbac() {
  return {
    transacao: authRuntime.transacao,
    relogio: authRuntime.relogio,
    idPorta: authRuntime.idPorta,
    papeisRepositorio: createPapeisRepositorio(clientePrisma),
    papelPermissoesRepositorio: createPapelPermissoesRepositorio(clientePrisma),
    usuariosPapeisRepositorio: createUsuariosPapeisRepositorio(clientePrisma),
    usuariosRepositorio: createUsuariosRepositorio(clientePrisma),
  };
}

/**
 * Cria um novo papel no locatário autenticado.
 */
export async function criarPapelController(request: FastifyRequest<{ Body: CriarPapelBodyDto }>, reply: FastifyReply) {
  const ctx = await obterCtxAutorizadoOuResponderErro(request, reply, {
    permissao: Permissoes.TENANT_RBAC_PAPEL_CRIAR,
    modulo: "RBAC",
  });
  if (!ctx) return;

  const { papeisRepositorio, transacao, relogio, idPorta } = criarDepsRbac();

  const criarPapel = createFnCriarPapel({
    papeisRepositorio,
    transacao,
    relogio,
    idPorta,
  });

  const resultado = await criarPapel({
    locatarioId: ctx.locatarioId,
    nome: request.body.nome,
    descricao: request.body.descricao ?? null,
  });

  await auditar(criarContextoAuditoria(request, ctx), {
    evento: "rbac.papel.criado",
    sucesso: resultado.ok,
    entidadeTipo: "papel",
    entidadeId: resultado.ok ? resultado.value.papelId : null,
    entidadeNome: request.body.nome,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: resultado.ok
      ? metaCriacaoPapel({
          papelId: resultado.value.papelId,
          nome: request.body.nome,
          descricao: request.body.descricao ?? null,
        })
      : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: {
      papelId: resultado.value.papelId,
    },
  });
}

/**
 * Atualiza um papel existente no locatário autenticado.
 */
export async function atualizarPapelController(request: FastifyRequest<{ Params: PapelIdParamsDto; Body: AtualizarPapelBodyDto; }>, reply: FastifyReply) {
  const ctx = await obterCtxAutorizadoOuResponderErro(request, reply, {
    permissao: Permissoes.TENANT_RBAC_PAPEL_ATUALIZAR,
    modulo: "RBAC",
  });
  if (!ctx) return;

  const { papeisRepositorio, transacao, relogio } = criarDepsRbac();

  const papelAntes = await papeisRepositorio.buscarPorId({
    locatarioId: ctx.locatarioId,
    papelId: request.params.id,
  });

  const atualizarPapel = createFnAtualizarPapel({
    papeisRepositorio,
    transacao,
    relogio,
  });

  const resultado = await atualizarPapel({
    locatarioId: ctx.locatarioId,
    papelId: request.params.id,
    nome: request.body.nome,
    descricao: request.body.descricao,
  });

  await auditar(criarContextoAuditoria(request, ctx), {
    evento: "rbac.papel.atualizado",
    sucesso: resultado.ok,
    entidadeTipo: "papel",
    entidadeId: request.params.id,
    entidadeNome: resultado.ok ? resultado.value.papel.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados:
      resultado.ok && papelAntes.ok && papelAntes.value
        ? metaAtualizacaoPapel(
            {
              nome: papelAntes.value.nome,
              descricao: papelAntes.value.descricao ?? null,
            },
            {
              nome: resultado.value.papel.nome,
              descricao: resultado.value.papel.descricao ?? null,
            },
          )
        : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: resultado.value.papel,
  });
}

/**
 * Atribui uma permissão a um papel.
 */
export async function atribuirPermissaoAoPapelController(
  request: FastifyRequest<{
    Params: PapelIdParamsDto;
    Body: AtribuirPermissaoBodyDto;
  }>,
  reply: FastifyReply,
) {
  const ctx = await obterCtxComPermissaoOuResponderErro(
    request,
    reply,
    Permissoes.TENANT_RBAC_PERMISSAO_ATRIBUIR,
  );
  if (!ctx) return;

  const { papelPermissoesRepositorio, transacao, relogio } = criarDepsRbac();

  const atribuirPermissaoAoPapel = createFnAtribuirPermissaoAoPapel({
    papelPermissoesRepositorio,
    transacao,
    relogio,
  });

  const resultado = await atribuirPermissaoAoPapel({
    locatarioId: ctx.locatarioId,
    papelId: request.params.id,
    permissao: request.body.permissao,
  });

  await auditar(criarContextoAuditoria(request, ctx), {
    evento: "rbac.permissao.atribuida",
    sucesso: resultado.ok,
    entidadeTipo: "papel",
    entidadeId: request.params.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: resultado.ok
      ? metaAtribuicaoPermissao({
          papelId: request.params.id,
          permissao: request.body.permissao,
        })
      : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    ok: true,
  });
}

/**
 * Remove uma permissão de um papel.
 */
export async function removerPermissaoDoPapelController(request: FastifyRequest<{ Params: PapelIdParamsDto; Body: RemoverPermissaoBodyDto; }>, reply: FastifyReply) {
  const ctx = await obterCtxComPermissaoOuResponderErro(
    request,
    reply,
    Permissoes.TENANT_RBAC_PERMISSAO_REMOVER,
  );
  if (!ctx) return;

  const { papelPermissoesRepositorio, transacao, relogio } = criarDepsRbac();

  const removerPermissaoDoPapel = createFnRemoverPermissaoDoPapel({
    papelPermissoesRepositorio,
    transacao,
    relogio,
  });

  const resultado = await removerPermissaoDoPapel({
    locatarioId: ctx.locatarioId,
    papelId: request.params.id,
    permissao: request.body.permissao,
  });

  await auditar(criarContextoAuditoria(request, ctx), {
    evento: "rbac.permissao.removida",
    sucesso: resultado.ok,
    entidadeTipo: "papel",
    entidadeId: request.params.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: resultado.ok
      ? metaRemocaoPermissao({
          papelId: request.params.id,
          permissao: request.body.permissao,
        })
      : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    ok: true,
  });
}

/**
 * Atualiza os papéis associados a um usuário.
 */
export async function atualizarPapeisDoUsuarioController(
  request: FastifyRequest<{
    Params: UsuarioIdParamsDto;
    Body: AtualizarPapeisUsuarioBodyDto;
  }>,
  reply: FastifyReply,
) {
  const ctx = await obterCtxComPermissaoOuResponderErro(
    request,
    reply,
    Permissoes.TENANT_RBAC_USUARIO_PAPEIS_ATUALIZAR,
  );
  if (!ctx) return;

  const { usuariosPapeisRepositorio, transacao, relogio } = criarDepsRbac();

  const papeisAntes = await usuariosPapeisRepositorio.listarPapeisDoUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
  });

  const atualizarPapeisDoUsuario = createFnAtualizarPapeisDoUsuario({
    usuariosPapeisRepositorio,
    transacao,
    relogio,
  });

  const resultado = await atualizarPapeisDoUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
    papeis: request.body.papeis,
  });

  await auditar(criarContextoAuditoria(request, ctx), {
    evento: "rbac.usuario.papeis_atualizados",
    sucesso: resultado.ok,
    entidadeTipo: "usuario",
    entidadeId: request.params.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados:
      resultado.ok && papeisAntes.ok
        ? metaAtualizacaoPapeisUsuario({
            papeisAntes: papeisAntes.value,
            papeisDepois: request.body.papeis,
          })
        : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    ok: true,
  });
}
