// packages/core/src/locatarios/usecases/criarLocatario.ts

import type { CriarLocatarioInput, CriarLocatarioOutput, CriarLocatarioResult } from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarNomeLocatario } from "../validadores";
import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";

/**
 * Cria a função de caso de uso responsável por registrar um novo locatário.
 *
 * Este caso de uso:
 * - valida o nome do locatário;
 * - gera um novo identificador por meio da `IdPorta`;
 * - materializa o instante de criação via `RelogioPorta`;
 * - persiste o locatário com status inicial `"ATIVO"`;
 * - devolve apenas o identificador criado no output.
 *
 * Dependências:
 * - `locRepo`: persistência do agregado de locatários;
 * - `idPorta`: geração de identidade estável;
 * - `relogio`: materialização do tempo corrente para o domínio.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `criarLocatario` pronta para receber a entrada do caso de uso.
 */
export function createFnCriarLocatario(deps: {
  locRepo: LocatariosRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Executa o caso de uso de criação de locatário.
   *
   * Fluxo:
   * 1. valida o nome recebido;
   * 2. gera `locatarioId`;
   * 3. obtém `criadoEm`;
   * 4. persiste o locatário;
   * 5. retorna o identificador criado.
   *
   * @param input Dados mínimos necessários para criar o locatário.
   * @returns `Ok({ locatarioId })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function criarLocatario(input: CriarLocatarioInput): CriarLocatarioResult {
    const nome = validarNomeLocatario(input.nome);
    if (!nome.ok) return nome;

    return executarEmTransacao(deps.transacao, async () => {
      const locatarioId = deps.idPorta.gerarId();
      const criadoEm = deps.relogio.agora();

      const res = await deps.locRepo.criar({
        locatarioId,
        nome: nome.value,
        status: "ATIVO",
        criadoEm,
      });
      if (!res.ok) return res;

      return wrapOk<CriarLocatarioOutput>({
        locatarioId: res.value.locatarioId,
      });
    });
  };
}
