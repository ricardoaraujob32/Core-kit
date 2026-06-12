// packages/core/src/locatarios/usecases/ativarConfiguracaoLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarConfiguracaoLocatarioId, validarLocatarioId } from "../validadores";
import { AtivarConfiguracaoLocatarioInput, AtivarConfiguracaoLocatarioOutput, AtivarConfiguracaoLocatarioResult } from "../tipos";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";
import { obterConfiguracaoObrigatoria, obterLocatarioObrigatorio } from "./helpers";
import { exigirEstadoOperacionalLocatario } from "../maquinaEstados";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtivarConfiguracaoLocatario(deps: {
  locatariosRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function ativarConfiguracaoLocatario(input: AtivarConfiguracaoLocatarioInput): AtivarConfiguracaoLocatarioResult {
    const { locatariosRepositorio } = deps;

    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const configuracaoId = validarConfiguracaoLocatarioId(input.configuracaoId);
    if (!configuracaoId.ok) return configuracaoId;

    return executarEmTransacao(deps.transacao, async () => {
      const locatario = await obterLocatarioObrigatorio({
        locatariosRepositorio,
        locatarioId: locatarioId.value,
      });
      if (!locatario.ok) return locatario;

      const estadoOperacional = exigirEstadoOperacionalLocatario(locatario.value);
      if (!estadoOperacional.ok) return estadoOperacional;

      const configuracao = obterConfiguracaoObrigatoria({
        locatario: locatario.value,
        configuracaoId: configuracaoId.value,
      });
      if (!configuracao.ok) return configuracao;

      const autorizacao = await autorizarLocatario(deps, {
        operacao: "LOCATARIO_CONFIGURACAO_ATIVAR",
        locatarioId: locatario.value.locatarioId,
        locatario: locatario.value,
        dados: { configuracaoId: configuracaoId.value },
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const agora = deps.relogio.agora();

      const resultadoDesativacao =
        await locatariosRepositorio.desativarConfiguracoesAtivas({
          locatarioId: locatarioId.value,
          atualizadoEm: agora,
        });
      if (!resultadoDesativacao.ok) return resultadoDesativacao;

      const resultadoAtivacao =
        await locatariosRepositorio.atualizarConfiguracao({
          ...configuracao.value,
          ativa: true,
          atualizadoEm: agora,
        });
      if (!resultadoAtivacao.ok) return resultadoAtivacao;

      return wrapOk<AtivarConfiguracaoLocatarioOutput>({
        configuracao: resultadoAtivacao.value,
      });
    });
  };
}
