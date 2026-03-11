// packages/core/src/contextoExecucao.ts

import { LocatarioId } from "./locatarios/tipos";
import { UsuarioId } from "./usuarios/index";
import { Permissao } from "./permissoes";
import { Papel } from "./papeis";
import { ModuloCodigo } from "./modulos";

/**
 * Cria um símbolo único que marca o contexto.
 * Impede falsificação de contexto e centraliza a criação numa fábrica.
 */
const CTX_BRAND = Symbol.for("@core-kit/ContextoExecucao");
type ContextoExecucaoBrand = { readonly [CTX_BRAND]: true };

/**
 * ContextoExecucao representa as informações mínimas para execução segura:
 * - quem (usuarioId)
 * - em qual locatário (locatarioId)
 * - quais permissões já foram resolvidas (permissoes)
 */
export type ContextoExecucao = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  papeis?: readonly Papel[];
  permissoes?: readonly Permissao[];
  modulosHabilitados?: readonly ModuloCodigo[];
  agora?: () => Date;
} & ContextoExecucaoBrand;

/**
 * Um tipo que representa os atributos necessários para a criação do contexto.
 * Deve ser passado como argumento para a fábrica.
 */
export type CreateContextoExecucaoParams = Omit<ContextoExecucao, typeof CTX_BRAND>;

/**
 * ÚNICO “construtor” oficial.
 * - Faz cópias defensivas de arrays (evita mutação externa)
 * - Congela o objeto (imutável)
 * - Aplica branding (isContextoExecucao)
 * @param params os argumentos do contexto:
 * - (obrigatório) locatarioId: identifica a quem pertence o contexto;
 * - usuarioId?: 'null` = contexto técnico (job, migração, automação), sem usuário humano. `undefined` = contexto não autenticado (endpoint público, antes do login).
 * - papeis?: papéis atribuídos ao usuário.
 * - permissoes?: permissões atribuídas ao usuário.
 * - agora?: Relógio injetável para testes. Se ausente, use `new Date()` na borda.
 * @returns o contexto de execução para um locatário.
 */
export function createContextoExecucao(params: CreateContextoExecucaoParams): ContextoExecucao {
  const locatarioId = params.locatarioId;
  if (typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    throw new Error("ContextoExecucao inválido: locatarioId é obrigatório.");
  }

  const usuarioId = params.usuarioId;
  if (usuarioId === null) {
    throw new Error("ContextoExecucao inválido: usuarioId não pode ser null.");
  }

  if (usuarioId !== undefined && (typeof usuarioId !== "string" || usuarioId.trim().length === 0)) {
    throw new Error("ContextoExecucao inválido: usuarioId deve ser string não vazia, null ou undefined."); // mantém a semântica: "" não é usuário válido
  }
  
  const permissoes = params.permissoes ? Object.freeze([...params.permissoes]) : undefined;
  const papeis = params.papeis ? Object.freeze([...params.papeis]) : undefined;
  const modulosHabilitados = params.modulosHabilitados
    ? Object.freeze(
        params.modulosHabilitados.map((m) => {
          if (typeof m !== "string" || m.trim().length === 0) {
            throw new Error("ContextoExecucao inválido: módulo habilitado deve ser string não vazia.");
          }
          return m.trim().toUpperCase() as ModuloCodigo;
        }),
      )
    : undefined;

  const ctx: Omit<ContextoExecucao, typeof CTX_BRAND> & ContextoExecucaoBrand = {
    locatarioId, usuarioId, permissoes, papeis, modulosHabilitados, agora: params.agora, [CTX_BRAND]: true,
  };

  return Object.freeze(ctx) as ContextoExecucao;
}

/**
 * Type-guard: garante que veio do construtor oficial.
 * @param valor o valor
 * @returns true se for ContextoExecucao e vier do construtor; do contrário, false
 */
export function isContextoExecucao(valor: unknown): valor is ContextoExecucao {
  if (!valor || typeof valor !== "object") return false;
  return ( (valor as any)[CTX_BRAND] === true && typeof (valor as any).locatarioId === "string" && (valor as any).locatarioId.length > 0);
}
