// packages/core/src/tokens/usecases/emitirToken.ts

import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
import type { EmitirTokenInput, EmitirTokenOutput, EmitirTokenResult } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarHashToken, validarExpiraEm, validarTokenTipo } from "../validadores";
import { hashTokenJaExiste, tokenInvalido } from "../erros";
import { validarLocatarioId } from "../../locatarios";
import { validarUsuarioId } from "../../usuarios";

/**
 * Cria a função de caso de uso responsável por emitir e persistir um token.
 *
 * Este caso de uso:
 * - valida `usuarioId`, `locatarioId`, `hashToken`, `tipo` e `expiraEm`;
 * - garante que a expiração esteja no futuro em relação ao relógio injetado;
 * - verifica unicidade do `hashToken`;
 * - gera um novo `tokenId`;
 * - persiste o token com `emitidoEm` igual ao instante atual e `revogadoEm` nulo;
 * - devolve apenas o identificador criado no output.
 *
 * Dependências:
 * - `tokensRepo`: persistência e consulta de tokens;
 * - `idPorta`: geração de identidade estável para o token;
 * - `relogio`: materialização do instante de emissão.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `emitirToken` pronta para receber a entrada do caso de uso.
 */
export function createFnEmitirToken(deps: {
  tokensRepo: TokensRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Executa o caso de uso de emissão de token.
   *
   * Fluxo:
   * 1. valida todos os campos estruturais da entrada;
   * 2. rejeita expiração passada ou igual ao instante atual;
   * 3. verifica se o `hashToken` já existe;
   * 4. gera `tokenId`;
   * 5. persiste o token;
   * 6. devolve `{ tokenId }`.
   *
   * @param input Dados necessários para emitir e persistir o token.
   * @returns `Ok({ tokenId })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function emitirToken(input: EmitirTokenInput): EmitirTokenResult {
    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const hashToken = validarHashToken(input.hashToken);
    if (!hashToken.ok) return hashToken;

    const tipo = validarTokenTipo(input.tipo);
    if (!tipo.ok) return tipo;

    const expiraEm = validarExpiraEm(input.expiraEm);
    if (!expiraEm.ok) return expiraEm;

    return executarEmTransacao(deps.transacao, async () => {
      const agora = deps.relogio.agora();
      if (expiraEm.value.getTime() <= agora.getTime()) {
        return tokenInvalido({ campo: "expiraEm", regra: "deve_ser_futuro" });
      }

      const existente = await deps.tokensRepo.buscarPorHash({
        locatarioId: locatarioId.value,
        usuarioId: usuarioId.value,
        hashToken: hashToken.value,
      });
      if (!existente.ok) return existente;
      if (existente.value) return hashTokenJaExiste(hashToken.value);

      const tokenId = deps.idPorta.gerarId();

      const criado = await deps.tokensRepo.criar({
        tokenId,
        usuarioId: usuarioId.value,
        locatarioId: locatarioId.value,
        hashToken: hashToken.value,
        tipo: tipo.value,
        emitidoEm: agora,
        expiraEm: expiraEm.value,
        revogadoEm: null,
        proximoTokenId: null,
        agenteUsuario: input.agenteUsuario ?? null,
        enderecoIp: input.enderecoIp ?? null,
      });
      if (!criado.ok) return criado;

      return wrapOk<EmitirTokenOutput>({
        tokenId: criado.value.tokenId,
      });
    });
  };
}
