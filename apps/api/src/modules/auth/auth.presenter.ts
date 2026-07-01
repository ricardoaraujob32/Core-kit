// apps/api/src/modules/auth/auth.presenter.ts

import type { ContextoExecucao } from "@core-kit/core";

type CtxAutorizado = ContextoExecucao & {
  permissoes?: string[];
};

export type AutorizacaoFrontendDto = {
  clientes: {
    acessar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
  };
  fornecedores: {
    acessar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
  };
  produtos: {
    acessar: boolean;
    criar: boolean;
    editar: boolean;
    excluir: boolean;
  };
  transacoes: {
    acessar: boolean;
    criar: boolean;
    editar: boolean;
    cancelar: boolean;
    concluir: boolean;
  };
  financeiro: {
    acessar: boolean;
  };
  ordensServico: {
    acessar: boolean;
    criar: boolean;
    editar: boolean;
    cancelar: boolean;
    concluir: boolean;
    gerarVenda: boolean;
  };
};

function isPlataforma(ctx: ContextoExecucao): boolean {
  return !ctx.locatarioId;
}

function temPermissao(ctx: ContextoExecucao, permissao: string): boolean {
  if (isPlataforma(ctx)) return true;

  const permissoes = (ctx as CtxAutorizado).permissoes ?? [];

  return permissoes
    .map((item) => item.trim().toLowerCase())
    .includes(permissao.trim().toLowerCase());
}

export function toAutorizacaoFrontendDto(
  ctx: ContextoExecucao,
): AutorizacaoFrontendDto {
  return {
    clientes: {
      acessar: temPermissao(ctx, "tenant.cliente.listar"),
      criar: temPermissao(ctx, "tenant.cliente.criar"),
      editar: temPermissao(ctx, "tenant.cliente.atualizar"),
      excluir: temPermissao(ctx, "tenant.cliente.excluir"),
    },
    fornecedores: {
      acessar: temPermissao(ctx, "tenant.fornecedor.listar"),
      criar: temPermissao(ctx, "tenant.fornecedor.criar"),
      editar: temPermissao(ctx, "tenant.fornecedor.atualizar"),
      excluir: temPermissao(ctx, "tenant.fornecedor.excluir"),
    },
    produtos: {
      acessar: temPermissao(ctx, "tenant.produto.listar"),
      criar: temPermissao(ctx, "tenant.produto.criar"),
      editar: temPermissao(ctx, "tenant.produto.atualizar"),
      excluir: temPermissao(ctx, "tenant.produto.excluir"),
    },
    transacoes: {
      acessar: temPermissao(ctx, "tenant.transacoes.listar"),
      criar: temPermissao(ctx, "tenant.transacoes.criar"),
      editar: temPermissao(ctx, "tenant.transacoes.atualizar"),
      cancelar: temPermissao(ctx, "tenant.transacoes.cancelar"),
      concluir: temPermissao(ctx, "tenant.transacoes.concluir"),
    },
    financeiro: {
      acessar: temPermissao(ctx, "tenant.financeiro.ler"),
    },
    ordensServico: {
      acessar: temPermissao(ctx, "tenant.ordens_servico.ler"),
      criar: temPermissao(ctx, "tenant.ordens_servico.criar"),
      editar: temPermissao(ctx, "tenant.ordens_servico.atualizar"),
      cancelar: temPermissao(ctx, "tenant.ordens_servico.cancelar"),
      concluir: temPermissao(ctx, "tenant.ordens_servico.concluir"),
      gerarVenda: temPermissao(ctx, "tenant.ordens_servico.gerar_venda"),
    },
  };
}

export function toUsuarioSessaoDto(ctx: ContextoExecucao) {
  return {
    usuarioId: ctx.usuarioId,
    locatarioId: ctx.locatarioId ?? null,
    perfil: ctx.locatarioId ? "TENANT" : "PLATAFORMA",
    autorizacao: toAutorizacaoFrontendDto(ctx),
  };
}
