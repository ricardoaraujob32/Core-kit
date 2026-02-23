// packages/core/src/tokens/usecases/rotacionarToken.ts

import type { Result } from "../../result";
import { wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import type { TokensRepositorio } from "../portasRepositorio";
import { criarToken, tokenEstaAtivo, tokenEstaExpirado, tokenEstaRevogado, type Token, type TokenId } from "../tipos";
import { erroEntradaInvalida, erroTokenNaoEncontrado, erroTokenRevogado, erroTokenExpirado, erroTokenJaRotacionado } from "../erros";
import { UsuarioId } from "../../usuarios";
import { LocatarioId } from "../../locatario";

/**
 * 
 */
export type RotacionarTokenParams = {
  repo: TokensRepositorio;

  /**
   * Token atual (refresh) que será substituído.
   */
  tokenAtualId: TokenId;

  /**
   * Novo hash do token (o token em claro é gerado fora e hasheado fora).
   */
  novoHashToken: string;

  /**
   * Quem está recebendo os tokens (normalmente é o mesmo usuário do token atual).
   * Se você quiser forçar consistência, mantenha preenchido e igual ao token atual.
   */
  usuarioId?: UsuarioId;

  /**
   * Se seu refresh token é multi-tenant, mantenha locatarioId aqui também (opcional).
   * Se não, pode ficar null.
   */
  locatarioId?: LocatarioId | null;

  /**
   * Expiração do novo token.
   * Você pode passar direto (Date) ou derivar por TTL em um factory externo.
   */
  expiraEm: Date;

  agenteUsuario?: string | null;
  enderecoIp?: string | null;

  gerarTokenId: () => TokenId;
  agora: () => Date;
};

/**
 * 
 */
export type RotacionarTokenResultado = {
  tokenNovo: Token;
  tokenAnteriorId: TokenId;
};

/**
 * 
 * @param params 
 * @returns 
 */
export async function rotacionarToken(
  params: RotacionarTokenParams,
): Promise<Result<RotacionarTokenResultado, ErroApp>> {
  if (!params.repo) return erroEntradaInvalida("repo é obrigatório.");
  if (!params.tokenAtualId) return erroEntradaInvalida("tokenAtualId é obrigatório.");
  if (typeof params.novoHashToken !== "string" || params.novoHashToken.trim().length === 0) {
    return erroEntradaInvalida("novoHashToken é obrigatório.");
  }
  if (!(params.expiraEm instanceof Date) || Number.isNaN(params.expiraEm.getTime())) {
    return erroEntradaInvalida("expiraEm inválido.");
  }

  const rAtual = await params.repo.obterPorId(params.tokenAtualId);
  if (!rAtual.ok) return rAtual;

  const tokenAtual = rAtual.value;
  if (!tokenAtual) return erroTokenNaoEncontrado(params.tokenAtualId);

  const agora = params.agora();

  // Regras de rotação (bem comuns):
  // - se revogado -> inválido
  // - se expirado -> inválido
  // - se já possui proximoTokenId -> conflito (já rotacionado)
  if (tokenEstaRevogado(tokenAtual)) return erroTokenRevogado();
  if (tokenEstaExpirado(tokenAtual, agora)) return erroTokenExpirado();
  if (tokenAtual.proximoTokenId) return erroTokenJaRotacionado();

  // Se o chamador quiser travar que a rotação é para o mesmo usuário:
  if (params.usuarioId && (tokenAtual.usuarioId as unknown as string) !== (params.usuarioId as unknown as string)) {
    return erroEntradaInvalida("usuarioId não corresponde ao token atual.");
  }

  // Se o chamador quiser travar tenant:
  if (params.locatarioId !== undefined) {
    const locAtual = tokenAtual.locatarioId;
    const locReq = params.locatarioId ?? null;
    if ((locAtual ?? null) !== (locReq ?? null)) {
      return erroEntradaInvalida("locatarioId não corresponde ao token atual.");
    }
  }

  // Cria novo token
  const novoId = params.gerarTokenId();
  const rNovo = criarToken({
    id: novoId,
    usuarioId: tokenAtual.usuarioId,
    locatarioId: tokenAtual.locatarioId,
    hashToken: params.novoHashToken,
    emitidoEm: agora,
    expiraEm: params.expiraEm,
    revogadoEm: null,
    proximoTokenId: null,
    agenteUsuario: params.agenteUsuario ?? tokenAtual.agenteUsuario ?? null,
    enderecoIp: params.enderecoIp ?? tokenAtual.enderecoIp ?? null,
  });
  if (!rNovo.ok) return rNovo;

  const tokenNovo = rNovo.value;

  // Persiste o novo token primeiro (padrão comum)
  const rIns = await params.repo.inserir(tokenNovo);
  if (!rIns.ok) return rIns;

  // Atualiza o token antigo: marca como revogado e referencia o próximo
  const tokenAtualizado: Token = {
    ...tokenAtual,
    revogadoEm: agora,
    proximoTokenId: tokenNovo.id,
  };

  const rUp = await params.repo.atualizar(tokenAtualizado);
  if (!rUp.ok) return rUp;

  // Resultado final
  return wrapOk({
    tokenNovo,
    tokenAnteriorId: tokenAtual.id,
  });
}