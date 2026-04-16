// packages/core/src/locatarios/usecases/atualizarConfiguracaoLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarCorTema, validarConfiguracaoLocatarioId, validarIdentidadeVisualLocatario, validarLocatarioId, validarModoTemaLocatario, 
    validarUrlLogoLocatario, validarConfiguracoesLocatario} from "../validadores";
import { locatarioInvalido, locatarioNaoEncontrado } from "../erros";
import { AtualizarConfiguracaoLocatarioInput } from "../tipos";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtualizarConfiguracaoLocatario(deps: {
  locatarioRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function atualizarConfiguracaoLocatario(input: AtualizarConfiguracaoLocatarioInput) {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const configuracaoId = validarConfiguracaoLocatarioId(input.configuracaoId);
    if (!configuracaoId.ok) return configuracaoId;

    return executarEmTransacao(deps.transacao, async () => {
      const loc = await deps.locatarioRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
      });
      if (!loc.ok) return loc;
      if (!loc.value) return locatarioNaoEncontrado(locatarioId.value);

      const atual = loc.value.configuracoes.find(
        (c) => c.configuracaoId === configuracaoId.value,
      );
      if (!atual) {
        return locatarioInvalido({
          campo: "configuracaoId",
          valor: configuracaoId.value,
          motivo: "configuracao_nao_encontrada",
        });
      }

      let modoTema = atual.modoTema;
      let identidadeVisual = atual.identidadeVisual;
      let corPrimaria = atual.corPrimaria;
      let corSecundaria = atual.corSecundaria;
      let corTerciaria = atual.corTerciaria;
      let urlLogo = atual.urlLogo;

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

      const atualizada = {
        ...atual,
        modoTema,
        identidadeVisual,
        corPrimaria,
        corSecundaria,
        corTerciaria,
        urlLogo,
        atualizadoEm: deps.relogio.agora(),
      };

      if (atualizada.ativa) {
        const validacao = validarConfiguracoesLocatario(
          loc.value.configuracoes.map((c) =>
            c.configuracaoId === atualizada.configuracaoId ? atualizada : c,
          ),
        );
        if (!validacao.ok) return validacao;
      }

      const res = await deps.locatarioRepositorio.atualizarConfiguracao(atualizada);
      if (!res.ok) return res;

      return wrapOk({
        configuracao: res.value,
      });
    });
  };
}
