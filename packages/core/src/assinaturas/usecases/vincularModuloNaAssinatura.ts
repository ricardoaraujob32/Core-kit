// packages/core/src/assinaturas/usecases/vincularModuloNaAssinatura.ts

import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel/index.js";
import { erroAssinaturaNaoEncontrada, erroModuloInvalido, erroModuloJaVinculado } from "../erros.js";
import { autorizarAssinatura, PoliticaSegurancaAssinaturasPorta } from "../politicas.js";
import { AssinaturasModulosRepositorio, AssinaturasRepositorio, ModulosConsultaRepositorio } from "../portasRepositorio.js";
import { VincularModuloNaAssinaturaInput, VincularModuloNaAssinaturaOutput, VincularModuloNaAssinaturaResult } from "../tipos.js";
import { validarVincularModuloNaAssinaturaInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por vincular um módulo a uma assinatura,
 * tornando esse módulo disponível no contexto da assinatura correspondente.
 *
 * Este caso de uso faz parte do fluxo de composição funcional de assinaturas.
 */

/**
 * Cria a função de caso de uso para vincular módulos em assinaturas.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositórios de assinaturas e vínculos, consulta de módulos,
 * relógio e transação opcional.
 * @returns Função de caso de uso `vincularModuloNaAssinatura`.
 */
export function createFnVincularModuloNaAssinatura(deps: {
  assinaturasRepositorio: AssinaturasRepositorio;
  assinaturasModulosRepositorio: AssinaturasModulosRepositorio;
  modulosConsultaRepositorio: ModulosConsultaRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaAssinaturasPorta;
}) {
   /**
 * Vincula um módulo a uma assinatura.
 *
 * Regras:
 * - valida a entrada;
 * - a assinatura deve existir;
 * - o módulo deve existir e estar ativo;
 * - não pode haver vínculo ativo pré-existente;
 * - cria um vínculo com origem `ASSINATURA`.
 *
 * @param input Dados do vínculo entre assinatura e módulo.
 * @returns `Ok(void)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function vincularModuloNaAssinatura(input: VincularModuloNaAssinaturaInput): VincularModuloNaAssinaturaResult {
    const validacao = validarVincularModuloNaAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const assinatura = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!assinatura.ok) return assinatura;
      if (!assinatura.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      const autorizacao = await autorizarAssinatura(deps, {
        operacao: "ASSINATURA_VINCULAR_MODULO",
        locatarioId: assinatura.value.locatarioId,
        assinaturaId: assinatura.value.assinaturaId,
        moduloId: input.moduloId,
        assinatura: assinatura.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const modulo = await deps.modulosConsultaRepositorio.validarModuloAtivo(input.moduloId);
      if (!modulo.ok) return modulo;
      if (!modulo.value || !modulo.value.ativo) return erroModuloInvalido(input.moduloId);

      const existente = await deps.assinaturasModulosRepositorio.buscarModuloVinculado(
        input.assinaturaId,
        input.moduloId,
      );
      if (!existente.ok) return existente;
      if (existente.value && existente.value.desabilitadoEm === null) {
        return erroModuloJaVinculado(input.assinaturaId, input.moduloId);
      }

      const habilitadoEm = deps.relogio.agora();

      const vinculo = await deps.assinaturasModulosRepositorio.vincularModulo({
        assinaturaId: input.assinaturaId,
        moduloId: input.moduloId,
        gratuito: false,
        origem: "ASSINATURA",
        habilitadoEm,
        desabilitadoEm: null,
      });

      if (!vinculo.ok) return vinculo;

      return wrapOk<VincularModuloNaAssinaturaOutput>({
        assinaturaId: input.assinaturaId,
        moduloId: input.moduloId,
        habilitadoEm,
        origem: "ASSINATURA",
        gratuito: false,
      });
    });
  };
}
