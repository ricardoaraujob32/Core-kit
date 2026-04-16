// packages/core/src/locatarios/usecases/criarConfiguracaoLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, IdPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao } from "../../kernel";
import { validarConfiguracoesLocatario, validarCorTema, validarIdentidadeVisualLocatario, validarLocatarioId, validarModoTemaLocatario, 
  validarUrlLogoLocatario } from "../validadores";
import { locatarioNaoEncontrado } from "../erros";
import type { CriarConfiguracaoLocatarioInput } from "../tipos";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnCriarConfiguracaoLocatario(deps: {
  locatarioRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function criarConfiguracaoLocatario(input: CriarConfiguracaoLocatarioInput) {
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
      const locatario = await deps.locatarioRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
      });
      if (!locatario.ok) return locatario;
      if (!locatario.value) return locatarioNaoEncontrado(locatarioId.value);

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

      return deps.locatarioRepositorio.criarConfiguracao({
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
    });
  };
}
