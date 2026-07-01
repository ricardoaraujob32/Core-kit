// apps/web/src/core/auth/useAuthorization.ts

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { isSuperAdmin } from "./tipos";

function normalizePermissionCode(value: string): string {
  return value.trim().toLowerCase();
}

export function useAuthorization() {
  const { user, isAuthenticated } = useAuth();

  const autorizacao = useMemo(() => user?.autorizacao ?? {}, [user]);
  const superAdmin = isSuperAdmin(user);

  function allow(value: unknown): boolean {
    return superAdmin || value === true;
  }

  /**
   * Compatibilidade transitória para telas que ainda recebem
   * `requiredPermissions`.
   *
   * Importante:
   * - isto NÃO lê permissões cruas do usuário;
   * - apenas traduz códigos antigos de tela para capacidades booleanas;
   * - permite migrar as páginas aos poucos para `<PageGuard allowed={...}>`.
   */
  function canRunPermissionCode(permission: string): boolean {
    const code = normalizePermissionCode(permission);

    switch (code) {
      case "tenant.usuario.listar":
        return allow(autorizacao.usuarios?.acessar);
      case "tenant.usuario.criar":
        return allow(autorizacao.usuarios?.criar);
      case "tenant.usuario.atualizar":
        return allow(autorizacao.usuarios?.editar);

      case "tenant.cliente.listar":
        return allow(autorizacao.clientes?.acessar);
      case "tenant.cliente.criar":
        return allow(autorizacao.clientes?.criar);
      case "tenant.cliente.atualizar":
        return allow(autorizacao.clientes?.editar);
      case "tenant.cliente.excluir":
        return allow(autorizacao.clientes?.excluir);

      case "tenant.fornecedor.listar":
        return allow(autorizacao.fornecedores?.acessar);
      case "tenant.fornecedor.criar":
        return allow(autorizacao.fornecedores?.criar);
      case "tenant.fornecedor.atualizar":
        return allow(autorizacao.fornecedores?.editar);
      case "tenant.fornecedor.excluir":
        return allow(autorizacao.fornecedores?.excluir);

      case "tenant.produto.listar":
        return allow(autorizacao.produtos?.acessar);
      case "tenant.produto.criar":
        return allow(autorizacao.produtos?.criar);
      case "tenant.produto.atualizar":
        return allow(autorizacao.produtos?.editar);
      case "tenant.produto.excluir":
        return allow(autorizacao.produtos?.excluir);

      case "tenant.transacao.listar":
      case "tenant.transacoes.listar":
        return allow(autorizacao.transacoes?.acessar);
      case "tenant.transacao.criar":
      case "tenant.transacoes.criar":
        return allow(autorizacao.transacoes?.criar);
      case "tenant.transacao.atualizar":
      case "tenant.transacoes.atualizar":
        return allow(autorizacao.transacoes?.editar);
      case "tenant.transacao.cancelar":
      case "tenant.transacoes.cancelar":
        return allow(autorizacao.transacoes?.cancelar);
      case "tenant.transacao.concluir":
      case "tenant.transacoes.concluir":
        return allow(autorizacao.transacoes?.concluir);

      case "tenant.financeiro.ler":
      case "tenant.financeiro.listar":
        return allow(autorizacao.financeiro?.acessar);

      case "tenant.assinatura.ler":
        return allow(autorizacao.assinatura?.acessar);
      case "tenant.assinatura.atualizar":
        return allow(autorizacao.assinatura?.atualizar);

      case "tenant.ordens_servico.ler":
      case "tenant.ordem_servico.ler":
        return allow(autorizacao.ordensServico?.acessar);
      case "tenant.ordens_servico.criar":
      case "tenant.ordem_servico.criar":
        return allow(autorizacao.ordensServico?.criar);
      case "tenant.ordens_servico.atualizar":
      case "tenant.ordem_servico.atualizar":
        return allow(autorizacao.ordensServico?.editar);
      case "tenant.ordens_servico.cancelar":
      case "tenant.ordem_servico.cancelar":
        return allow(autorizacao.ordensServico?.cancelar);
      case "tenant.ordens_servico.concluir":
      case "tenant.ordem_servico.concluir":
        return allow(autorizacao.ordensServico?.concluir);
      case "tenant.ordens_servico.gerar_venda":
      case "tenant.ordem_servico.gerar_venda":
        return allow(autorizacao.ordensServico?.gerarVenda);

      default:
        return superAdmin;
    }
  }

  return {
    isAuthenticated,
    user,
    isSuperAdmin: superAdmin,

    /**
     * Mantidos por compatibilidade. Como módulos crus não são mais contrato
     * de UI, o acesso real deve vir de `canRunPermissionCode` ou dos métodos
     * canAccess* abaixo.
     */
    hasModule: () => superAdmin || isAuthenticated,
    hasPermission: canRunPermissionCode,
    canRunPermissionCode,

    canAccessUsuariosModule: () => allow(autorizacao.usuarios?.acessar),
    canCreateUsuario: () => allow(autorizacao.usuarios?.criar),
    canEditUsuario: () => allow(autorizacao.usuarios?.editar),

    canAccessClientesModule: () => allow(autorizacao.clientes?.acessar),
    canCreateCliente: () => allow(autorizacao.clientes?.criar),
    canEditCliente: () => allow(autorizacao.clientes?.editar),
    canDeleteCliente: () => allow(autorizacao.clientes?.excluir),

    canAccessFornecedoresModule: () =>
      allow(autorizacao.fornecedores?.acessar),
    canCreateFornecedor: () => allow(autorizacao.fornecedores?.criar),
    canEditFornecedor: () => allow(autorizacao.fornecedores?.editar),
    canDeleteFornecedor: () => allow(autorizacao.fornecedores?.excluir),

    canAccessProdutosModule: () => allow(autorizacao.produtos?.acessar),
    canCreateProduto: () => allow(autorizacao.produtos?.criar),
    canEditProduto: () => allow(autorizacao.produtos?.editar),
    canDeleteProduto: () => allow(autorizacao.produtos?.excluir),

    canAccessTransacoesModule: () => allow(autorizacao.transacoes?.acessar),
    canCreateTransacao: () => allow(autorizacao.transacoes?.criar),
    canEditTransacao: () => allow(autorizacao.transacoes?.editar),
    canCancelTransacao: () => allow(autorizacao.transacoes?.cancelar),
    canConcludeTransacao: () => allow(autorizacao.transacoes?.concluir),

    canAccessFinanceiroModule: () => allow(autorizacao.financeiro?.acessar),

    canAccessAssinaturaModule: () => allow(autorizacao.assinatura?.acessar),
    canUpdateAssinatura: () => allow(autorizacao.assinatura?.atualizar),

    canAccessOrdensServicoModule: () =>
      allow(autorizacao.ordensServico?.acessar),
    canCreateOrdemServico: () => allow(autorizacao.ordensServico?.criar),
    canEditOrdemServico: () => allow(autorizacao.ordensServico?.editar),
    canCancelOrdemServico: () => allow(autorizacao.ordensServico?.cancelar),
    canConcludeOrdemServico: () => allow(autorizacao.ordensServico?.concluir),
    canGenerateVendaFromOrdemServico: () =>
      allow(autorizacao.ordensServico?.gerarVenda),
  };
}
