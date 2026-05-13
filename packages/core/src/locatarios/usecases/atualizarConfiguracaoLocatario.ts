// packages/core/src/locatarios/usecases/atualizarConfiguracaoLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarCorTema, validarConfiguracaoLocatarioId, validarIdentidadeVisualLocatario, validarLocatarioId, validarModoTemaLocatario, 
    validarUrlLogoLocatario } from "../validadores";
import { AtualizarConfiguracaoLocatarioInput, AtualizarConfiguracaoLocatarioOutput, AtualizarConfiguracaoLocatarioResult } from "../tipos";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";
import { obterConfiguracaoObrigatoria, obterLocatarioObrigatorio } from "./helpers";
import { exigirEstadoOperacionalLocatario } from "../maquinaEstados";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtualizarConfiguracaoLocatario(deps: {
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
  return async function atualizarConfiguracaoLocatario(input: AtualizarConfiguracaoLocatarioInput): AtualizarConfiguracaoLocatarioResult {
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

      const atual = obterConfiguracaoObrigatoria({
        locatario: locatario.value,
        configuracaoId: configuracaoId.value,
      });
      if (!atual.ok) return atual;

      const autorizacao = await autorizarLocatario(deps, {
        operacao: "LOCATARIO_CONFIGURACAO_ATUALIZAR",
        locatarioId: locatario.value.locatarioId,
        locatario: locatario.value,
        dados: { configuracaoId: configuracaoId.value },
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      let modoTema = atual.value.modoTema;
      let identidadeVisual = atual.value.identidadeVisual;
      let corPrimaria = atual.value.corPrimaria;
      let corSecundaria = atual.value.corSecundaria;
      let corTerciaria = atual.value.corTerciaria;
      let urlLogo = atual.value.urlLogo;

      if (input.modoTema !== undefined) {
        const r = validarModoTemaLocatario(input.modoTema);
        if (!r.ok) return r;
        modoTema = r.value;
      }

      if (input.identidadeVisual !== undefined) {
        const r = validarIdentidadeVisualLocatario(input.identidadeVisual);
        if (!r.ok) return r;
        identidadeVisual = r.value;
      }

      if (input.corPrimaria !== undefined) {
        const r = validarCorTema(input.corPrimaria, "corPrimaria");
        if (!r.ok) return r;
        corPrimaria = r.value;
      }

      if (input.corSecundaria !== undefined) {
        const r = validarCorTema(input.corSecundaria, "corSecundaria");
        if (!r.ok) return r;
        corSecundaria = r.value;
      }

      if (input.corTerciaria !== undefined) {
        const r = validarCorTema(input.corTerciaria, "corTerciaria");
        if (!r.ok) return r;
        corTerciaria = r.value;
      }

      if (input.urlLogo !== undefined) {
        const r = validarUrlLogoLocatario(input.urlLogo);
        if (!r.ok) return r;
        urlLogo = r.value;
      }

      const resultadoAtualizacao =
        await locatariosRepositorio.atualizarConfiguracao({
          ...atual.value,
          modoTema,
          identidadeVisual,
          corPrimaria,
          corSecundaria,
          corTerciaria,
          urlLogo,
          atualizadoEm: deps.relogio.agora(),
        });
      if (!resultadoAtualizacao.ok) return resultadoAtualizacao;

      return wrapOk<AtualizarConfiguracaoLocatarioOutput>({
        configuracao: resultadoAtualizacao.value,
      });
    });
  };
}
