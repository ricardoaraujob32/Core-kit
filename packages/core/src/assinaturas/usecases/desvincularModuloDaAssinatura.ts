// packages/core/src/assinaturas/usecases/desvincularModuloDaAssinatura.ts

import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
import { erroAssinaturaNaoEncontrada, erroModuloNaoVinculado } from "../erros";
import { AssinaturasModulosRepositorio, AssinaturasRepositorio } from "../portasRepositorio";
import { DesvincularModuloDaAssinaturaInput, DesvincularModuloDaAssinaturaOutput, DesvincularModuloDaAssinaturaResult } from "../tipos";
import { validarDesvincularModuloDaAssinaturaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por desvincular um módulo
 * de uma assinatura existente.
 *
 * Este caso de uso faz parte do fluxo de manutenção da composição
 * funcional de assinaturas.
 */

/**
 * Cria a função de caso de uso para desvincular módulos de assinaturas.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositórios de assinaturas e vínculos, relógio e transação opcional.
 * @returns Função de caso de uso `desvincularModuloDaAssinatura`.
 */
export function createFnDesvincularModuloDaAssinatura(deps: {
  assinaturasRepositorio: AssinaturasRepositorio;
  assinaturasModulosRepositorio: AssinaturasModulosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
   /**
 * Desvincula um módulo de uma assinatura.
 *
 * Regras:
 * - valida a entrada;
 * - a assinatura deve existir;
 * - o vínculo deve existir e estar ativo;
 * - registra o instante de desabilitação do vínculo.
 *
 * @param input Dados do desvínculo entre assinatura e módulo.
 * @returns `Ok(void)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function desvincularModuloDaAssinatura(input: DesvincularModuloDaAssinaturaInput): DesvincularModuloDaAssinaturaResult {
    const validacao = validarDesvincularModuloDaAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const assinatura = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!assinatura.ok) return assinatura;
      if (!assinatura.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      const existente = await deps.assinaturasModulosRepositorio.buscarModuloVinculado(
        input.assinaturaId,
        input.moduloId,
      );
      if (!existente.ok) return existente;
      if (!existente.value || existente.value.desabilitadoEm !== null) {
        return erroModuloNaoVinculado(input.assinaturaId, input.moduloId);
      }

      const desabilitadoEm = deps.relogio.agora();

      const desvinculo = await deps.assinaturasModulosRepositorio.desvincularModulo(
        input.assinaturaId,
        input.moduloId,
        desabilitadoEm,
      );
      if (!desvinculo.ok) return desvinculo;

      return wrapOk<DesvincularModuloDaAssinaturaOutput>({
        assinaturaId: input.assinaturaId,
        moduloId: input.moduloId,
        desabilitadoEm,
      });
    });
  };
}
