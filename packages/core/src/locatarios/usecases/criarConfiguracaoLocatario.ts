// packages/core/src/locatarios/usecases/criarConfiguracaoLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, IdPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarConfiguracoesLocatario, validarCorTema, validarIdentidadeVisualLocatario, validarLocatarioId, validarModoTemaLocatario, 
  validarUrlLogoLocatario } from "../validadores";
import type { CriarConfiguracaoLocatarioInput, CriarConfiguracaoLocatarioOutput, CriarConfiguracaoLocatarioResult } from "../tipos";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";
import { obterLocatarioObrigatorio } from "./helpers";
import { exigirEstadoOperacionalLocatario } from "../maquinaEstados";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnCriarConfiguracaoLocatario(deps: {
  locatariosRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function criarConfiguracaoLocatario(input: CriarConfiguracaoLocatarioInput): CriarConfiguracaoLocatarioResult {
    const { locatariosRepositorio } = deps;

    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const modoTema = validarModoTemaLocatario(input.modoTema);
    if (!modoTema.ok) return modoTema;

    const identidadeVisual = validarIdentidadeVisualLocatario(input.identidadeVisual);
    if (!identidadeVisual.ok) return identidadeVisual;

    const corPrimaria = validarCorTema(input.corPrimaria, "corPrimaria");
    if (!corPrimaria.ok) return corPrimaria;

    const corSecundaria = validarCorTema(input.corSecundaria, "corSecundaria");
    if (!corSecundaria.ok) return corSecundaria;

    const corTerciaria = validarCorTema(input.corTerciaria, "corTerciaria");
    if (!corTerciaria.ok) return corTerciaria;

    const urlLogo = validarUrlLogoLocatario(input.urlLogo);
    if (!urlLogo.ok) return urlLogo;

    return executarEmTransacao(deps.transacao, async () => {
      const locatario = await obterLocatarioObrigatorio({
        locatariosRepositorio,
        locatarioId: locatarioId.value,
      });
      if (!locatario.ok) return locatario;

      const estadoOperacional = exigirEstadoOperacionalLocatario(locatario.value);
      if (!estadoOperacional.ok) return estadoOperacional;

      const autorizacao = await autorizarLocatario(deps, {
        operacao: "LOCATARIO_CONFIGURACAO_CRIAR",
        locatarioId: locatario.value.locatarioId,
        locatario: locatario.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const agora = deps.relogio.agora();
      const configuracaoId = deps.idPorta.gerarId();
      const ativa = Boolean(input.ativa);

      if (ativa) {
        const validacao = validarConfiguracoesLocatario([
          ...locatario.value.configuracoes,
          {
            locatarioId: locatarioId.value,
            configuracaoId,
            modoTema: modoTema.value,
            identidadeVisual: identidadeVisual.value,
            corPrimaria: corPrimaria.value,
            corSecundaria: corSecundaria.value,
            corTerciaria: corTerciaria.value,
            urlLogo: urlLogo.value,
            ativa: true,
            criadoEm: agora,
            atualizadoEm: agora,
          },
        ]);
        if (!validacao.ok) return validacao;
      }

      const configuracao = await locatariosRepositorio.criarConfiguracao({
        locatarioId: locatarioId.value,
        configuracaoId,
        modoTema: modoTema.value,
        identidadeVisual: identidadeVisual.value,
        corPrimaria: corPrimaria.value,
        corSecundaria: corSecundaria.value,
        corTerciaria: corTerciaria.value,
        urlLogo: urlLogo.value,
        ativa,
        criadoEm: agora,
        atualizadoEm: agora,
      });
      if (!configuracao.ok) return configuracao;

      return wrapOk<CriarConfiguracaoLocatarioOutput>({
        configuracaoId: configuracao.value.configuracaoId,
      });
    });
  };
}
