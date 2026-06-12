// packages/core/src/tokens/usecases/rotacionarToken.ts

import { executarEmTransacao, wrapOk, type IdPorta, type RelogioPorta, type TransacaoPorta } from "../../kernel/index.js";
import { tokenInvalido, tokenNaoEncontrado, hashTokenJaExiste } from "../erros.js";
import type { RotacionarTokenInput, RotacionarTokenResult } from "../tipos.js";
import type { TokensRepositorio } from "../portasRepositorio.js";
import { validarExpiraEm, validarHashToken } from "../validadores.js";
import { exigirTransicaoToken } from "../maquinaEstados.js";
import { autorizarToken, PoliticaSegurancaTokensPorta } from "../politicas.js";
import { obterTokenObrigatorioPorId } from "./helpers.js";

/**
 * Cria a função de caso de uso responsável por rotacionar um token persistido.
 *
 * Este caso de uso:
 * - valida `tokenId`, `novoHashToken` e `novoExpiraEm`;
 * - rejeita expiração futura inválida;
 * - consulta o token atual;
 * - falha quando o token não existe ou já está revogado;
 * - garante unicidade do novo hash;
 * - gera um novo `tokenId`;
 * - revoga o token anterior e aponta `proximoTokenId`;
 * - cria o novo token reaproveitando metadados relevantes do anterior;
 * - devolve o par `{ tokenAnterior, tokenNovo }`.
 *
 * Dependências:
 * - `tokensRepo`: consulta e persistência de tokens;
 * - `idPorta`: geração de identidade para o novo token;
 * - `relogio`: materialização do instante da rotação.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `rotacionarToken` pronta para receber a entrada do caso de uso.
 */
export function createFnRotacionarToken(deps: {
  tokensRepo: TokensRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaTokensPorta;
}) {
  /**
   * Executa o caso de uso de rotação de token.
   *
   * Fluxo:
   * 1. valida `tokenId`, `novoHashToken` e `novoExpiraEm`;
   * 2. rejeita expiração não futura;
   * 3. busca o token atual;
   * 4. falha se o token não existir ou estiver revogado;
   * 5. verifica se o novo hash já está em uso;
   * 6. gera `novoTokenId`;
   * 7. revoga o token anterior e registra a cadeia por `proximoTokenId`;
   * 8. cria o novo token;
   * 9. relê o token novo para devolvê-lo completo no output.
   *
   * @param input Dados necessários para rotacionar o token.
   * @returns `Ok({ tokenAnterior, tokenNovo })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function rotacionarToken(input: RotacionarTokenInput): RotacionarTokenResult {
    const novoHashToken = validarHashToken(input.novoHashToken);
    if (!novoHashToken.ok) return novoHashToken;

    const novoExpiraEm = validarExpiraEm(input.novoExpiraEm);
    if (!novoExpiraEm.ok) return novoExpiraEm;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await obterTokenObrigatorioPorId({
        tokensRepo: deps.tokensRepo,
        locatarioId: input.locatarioId,
        usuarioId: input.usuarioId,
        tokenId: input.tokenId,
      });
      if (!atual.ok) return atual;

      const autorizacao = await autorizarToken(deps, {
        operacao: "TOKEN_ROTACIONAR",
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        tokenId: atual.value.tokenId,
        token: atual.value,
        dados: {
          agenteUsuario: input.agenteUsuario ?? null,
          enderecoIp: input.enderecoIp ?? null,
        },
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const agora = deps.relogio.agora();

      if (novoExpiraEm.value.getTime() <= agora.getTime()) {
        return tokenInvalido({ campo: "novoExpiraEm", regra: "deve_ser_futuro" });
      }

      const transicao = exigirTransicaoToken({
        token: atual.value,
        agora,
        evento: "ROTACIONAR",
      });
      if (!transicao.ok) return transicao;

      const existente = await deps.tokensRepo.buscarPorHash({
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        hashToken: novoHashToken.value,
      });
      if (!existente.ok) return existente;
      if (existente.value) return hashTokenJaExiste(novoHashToken.value);

      const novoTokenId = deps.idPorta.gerarId();

      const tokenAnterior = await deps.tokensRepo.atualizar({
        ...atual.value,
        revogadoEm: agora,
        proximoTokenId: novoTokenId,
        proximoUsuarioId: atual.value.usuarioId,
      });
      if (!tokenAnterior.ok) return tokenAnterior;

      const tokenNovoCriado = await deps.tokensRepo.criar({
        tokenId: novoTokenId,
        usuarioId: atual.value.usuarioId,
        locatarioId: atual.value.locatarioId,
        hashToken: novoHashToken.value,
        tipo: atual.value.tipo,
        emitidoEm: agora,
        expiraEm: novoExpiraEm.value,
        revogadoEm: null,
        proximoTokenId: null,
        agenteUsuario: input.agenteUsuario ?? atual.value.agenteUsuario,
        enderecoIp: input.enderecoIp ?? atual.value.enderecoIp,
      });
      if (!tokenNovoCriado.ok) return tokenNovoCriado;

      const tokenNovo = await deps.tokensRepo.buscarPorId({
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        tokenId: tokenNovoCriado.value.tokenId,
      });
      if (!tokenNovo.ok) return tokenNovo;
      if (!tokenNovo.value) return tokenNaoEncontrado(tokenNovoCriado.value.tokenId);

      return wrapOk({
        tokenAnterior: tokenAnterior.value,
        tokenNovo: tokenNovo.value,
      });
    });
  };
}
