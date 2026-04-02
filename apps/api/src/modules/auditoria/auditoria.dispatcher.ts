// apps/api/src/modules/auditoria/auditoria.dispatcher.ts

import { resolverEventoAuditoria } from "@core-kit/core";

/**
 * Parâmetros de contexto operacional do dispatcher.
 *
 * Esse contexto descreve quem executa a ação e em qual modo:
 * - locatário normal;
 * - plataforma;
 * - superadmin impersonando locatário.
 */
export type ContextoAuditoriaDispatcher = {
  /**
   * Usuário executor real da ação.
   */
  usuarioId: string | null;

  /**
   * Locatário corrente do contexto, quando houver.
   */
  locatarioId?: string | null;

  /**
   * Indica se a operação está sendo feita por superadmin.
   */
  isSuperadmin?: boolean;

  /**
   * Indica se há impersonação ativa.
   */
  isImpersonando?: boolean;

  /**
   * Locatário alvo da impersonação.
   */
  locatarioAlvoId?: string | null;

  /**
   * Tipo do agente executor.
   *
   * Exemplos:
   * - `USUARIO_AUTENTICADO`
   * - `SUPERADMIN`
   * - `SUPERADMIN_IMPERSONANDO`
   * - `JOB`
   */
  agenteTipo?: string | null;

  /**
   * Origem lógica do evento.
   */
  origem?: string | null;

  /**
   * Identificador da requisição.
   */
  requisicaoId?: string | null;

  /**
   * Endereço IP.
   */
  enderecoIp?: string | null;

  /**
   * User-agent ou identificador textual do agente.
   */
  agenteUsuario?: string | null;
};

/**
 * Dados específicos do evento auditado.
 */
export type PublicarEventoAuditoriaInput = {
  /**
   * Nome do evento auditado.
   */
  evento: string;

  /**
   * Resultado da operação principal.
   */
  sucesso: boolean;

  /**
   * Tipo da entidade afetada.
   */
  entidadeTipo?: string | null;

  /**
   * Nome amigável da entidade afetada.
   */
  entidadeNome?: string | null;

  /**
   * Identificador da entidade afetada.
   */
  entidadeId?: string | null;

  /**
   * Código de erro, quando houver.
   */
  erroCodigo?: string | null;

  /**
   * Mensagem de erro, quando houver.
   */
  erroMensagem?: string | null;

  /**
   * Metadados estruturados do evento.
   */
  metadados?: Record<string, unknown>;
};

/**
 * Contrato mínimo esperado dos publicadores concretos.
 */
export type PublicadoresAuditoria = {
  /**
   * Publica evento na auditoria de plataforma.
   */
  tentarAuditarPlataforma(params: {
    usuarioId: string | null;
    evento: string;
    categoria: "OPERACAO" | "SEGURANCA" | "ERRO" | "COMPLIANCE";
    sucesso: boolean;
    locatarioAlvoId?: string | null;
    entidadeTipo?: string | null;
    entidadeNome?: string | null;
    entidadeId?: string | null;
    erroCodigo?: string | null;
    erroMensagem?: string | null;
    origem?: string | null;
    requisicaoId?: string | null;
    enderecoIp?: string | null;
    agenteUsuario?: string | null;
    agenteTipo?: string | null;
    metadados?: Record<string, unknown>;
  }): Promise<void>;

  /**
   * Publica evento na auditoria do locatário.
   */
  tentarAuditarLocatario(params: {
    locatarioId: string;
    usuarioId: string | null;
    evento: string;
    categoria: "OPERACAO" | "SEGURANCA" | "ERRO" | "COMPLIANCE";
    sucesso: boolean;
    entidadeTipo?: string | null;
    entidadeNome?: string | null;
    entidadeId?: string | null;
    erroCodigo?: string | null;
    erroMensagem?: string | null;
    origem?: string | null;
    requisicaoId?: string | null;
    enderecoIp?: string | null;
    agenteUsuario?: string | null;
    agenteTipo?: string | null;
    metadados?: Record<string, unknown>;
  }): Promise<void>;
};

/**
 * Cria o dispatcher automático de auditoria.
 *
 * Responsabilidades:
 * - resolver o evento na matriz canônica;
 * - validar se o evento exige `locatarioAlvoId`;
 * - decidir se publica em plataforma, locatário ou ambos;
 * - tratar impersonação corretamente;
 * - não lançar erro de auditoria para o chamador.
 *
 * @param deps Publicadores concretos.
 * @returns Função `auditar`.
 */
export function createAuditoriaDispatcher(deps: PublicadoresAuditoria) {
  /**
   * Publica um evento de auditoria com roteamento automático.
   *
   * @param ctx Contexto operacional da ação.
   * @param input Dados do evento.
   * @returns `Promise<void>`.
   */
  return async function auditar(ctx: ContextoAuditoriaDispatcher, input: PublicarEventoAuditoriaInput): Promise<void> {
    let def;
    try {
      def = resolverEventoAuditoria(input.evento);
    } catch {
      return;
    }

    const locatarioAlvo =
      ctx.locatarioAlvoId ??
      (ctx.isImpersonando ? ctx.locatarioAlvoId ?? null : null);

    if (def.exigeLocatarioAlvo && !locatarioAlvo) {
      return;
    }

    const agenteTipo =
      ctx.agenteTipo ??
      (ctx.isImpersonando
        ? "SUPERADMIN_IMPERSONANDO"
        : ctx.isSuperadmin
          ? "SUPERADMIN"
          : "USUARIO_AUTENTICADO");

    const base = {
      usuarioId: ctx.usuarioId ?? null,
      evento: input.evento,
      categoria: def.categoria,
      sucesso: input.sucesso,
      entidadeTipo: input.entidadeTipo ?? null,
      entidadeNome: input.entidadeNome ?? null,
      entidadeId: input.entidadeId ?? null,
      erroCodigo: input.erroCodigo ?? null,
      erroMensagem: input.erroMensagem ?? null,
      origem: ctx.origem ?? "API",
      requisicaoId: ctx.requisicaoId ?? null,
      enderecoIp: ctx.enderecoIp ?? null,
      agenteUsuario: ctx.agenteUsuario ?? null,
      agenteTipo,
      metadados: input.metadados ?? {},
    } as const;

    /**
     * Destino: auditoria_plataforma
     */
    if (def.destino === "PLATAFORMA") {
      await deps.tentarAuditarPlataforma({
        ...base,
        locatarioAlvoId: locatarioAlvo ?? null,
      });
      return;
    }

    /**
     * Destino: auditoria_locatario
     */
    if (def.destino === "LOCATARIO") {
      const locatarioDestino = ctx.locatarioId ?? locatarioAlvo ?? null;
      if (!locatarioDestino) return;

      await deps.tentarAuditarLocatario({
        ...base,
        locatarioId: locatarioDestino,
      });
      return;
    }

    /**
     * Destino: ambas
     *
     * Regras:
     * - plataforma recebe `locatarioAlvoId`;
     * - locatário recebe o locatário efetivo da operação.
     */
    if (def.destino === "AMBAS") {
      const locatarioDestino = ctx.locatarioId ?? locatarioAlvo ?? null;
      if (!locatarioDestino) return;

      await deps.tentarAuditarPlataforma({
        ...base,
        locatarioAlvoId: locatarioAlvo ?? locatarioDestino,
      });

      await deps.tentarAuditarLocatario({
        ...base,
        locatarioId: locatarioDestino,
      });
    }
  };
}
