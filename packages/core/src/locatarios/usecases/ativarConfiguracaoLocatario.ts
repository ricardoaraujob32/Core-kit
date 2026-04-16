// packages/core/src/locatarios/usecases/ativarConfiguracaoLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarConfiguracaoLocatarioId, validarConfiguracoesLocatario, validarLocatarioId } from "../validadores";
import { locatarioInvalido, locatarioNaoEncontrado } from "../erros";
import { AtivarConfiguracaoLocatarioInput } from "../tipos";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtivarConfiguracaoLocatario(deps: {
  locatarioRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function ativarConfiguracaoLocatario(input: AtivarConfiguracaoLocatarioInput) {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const configuracaoId = validarConfiguracaoLocatarioId(input.configuracaoId);
    if (!configuracaoId.ok) return configuracaoId;

    return executarEmTransacao(deps.transacao, async () => {
      const locatario = await deps.locatarioRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
      });
      if (!locatario.ok) return locatario;
      if (!locatario.value) return locatarioNaoEncontrado(locatarioId.value);

      const alvo = locatario.value.configuracoes.find(
        (c) => c.configuracaoId === configuracaoId.value,
      );
      if (!alvo) {
        return locatarioInvalido({
          campo: "configuracaoId",
          valor: configuracaoId.value,
          motivo: "configuracao_nao_encontrada",
        });
      }

      const agora = deps.relogio.agora();

      const futuras = locatario.value.configuracoes.map((c) => ({
        ...c,
        ativa: c.configuracaoId === configuracaoId.value,
        atualizadoEm: c.configuracaoId === configuracaoId.value ? agora : c.atualizadoEm,
      }));

      const validacao = validarConfiguracoesLocatario(futuras);
      if (!validacao.ok) return validacao;

      const desativar = await deps.locatarioRepositorio.desativarConfiguracoesAtivas({
        locatarioId: locatarioId.value,
        atualizadoEm: agora,
      });
      if (!desativar.ok) return desativar;

      const ativar = await deps.locatarioRepositorio.atualizarConfiguracao({
        ...alvo,
        ativa: true,
        atualizadoEm: agora,
      });
      if (!ativar.ok) return ativar;

      return wrapOk({
        configuracao: ativar.value,
      });
    });
  };
}
