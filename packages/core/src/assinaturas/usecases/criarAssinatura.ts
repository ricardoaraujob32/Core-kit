// packages/core/src/assinaturas/usecases/criarAssinatura.ts

import { ErroApp, IdPorta, RelogioPorta, Result, wrapOk } from "../../kernel";
import { erroAssinaturaJaExisteParaLocatario, erroPlanoInvalido } from "../erros";
import { AssinaturasRepositorio, PlanosConsultaRepositorio } from "../portasRepositorio";
import { CriarAssinaturaInput, CriarAssinaturaOutput } from "../tipos";
import { validarCriarAssinaturaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por criar uma nova assinatura
 * para um locatário.
 *
 * Este caso de uso inicia o ciclo de vida de assinaturas no sistema.
 */

/**
 * Cria a função de caso de uso para criar assinaturas.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório de assinaturas, consulta de planos, relógio e gerador de IDs.
 * @returns Função de caso de uso `criarAssinatura`.
 */
export function createFnCriarAssinatura(deps: {
  assinaturasRepositorio: AssinaturasRepositorio;
  planosConsultaRepositorio: PlanosConsultaRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
}) {
/**
 * Cria uma nova assinatura.
 *
 * Regras:
 * - valida a entrada;
 * - o plano deve existir e estar ativo;
 * - não pode já existir assinatura ativa para o locatário;
 * - cria a assinatura com estado inicial `RASCUNHO`.
 *
 * @param input Dados da assinatura a ser criada.
 * @returns `Ok({ assinatura })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function criarAssinatura(input: CriarAssinaturaInput): Promise<Result<CriarAssinaturaOutput, ErroApp>> {
    const validacao = validarCriarAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    const plano = await deps.planosConsultaRepositorio.validarPlanoAtivo(input.planoId);
    if (!plano.ok) return plano;
    if (!plano.value || !plano.value.ativo) return erroPlanoInvalido(input.planoId);

    const existente = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(input.locatarioId);
    if (!existente.ok) return existente;
    if (existente.value) return erroAssinaturaJaExisteParaLocatario(input.locatarioId);

    const instante = deps.relogio.agora();
    const criada = await deps.assinaturasRepositorio.criarAssinatura({
      assinaturaId: deps.idPorta.gerarId(),
      locatarioId: input.locatarioId,
      planoId: input.planoId,
      status: "RASCUNHO",
      iniciadaEm: input.iniciadaEm ?? instante,
      criadaEm: instante,
      atualizadaEm: instante,
      encerradaEm: null,
    });

    if (!criada.ok) return criada;

    return wrapOk({ assinatura: criada.value });
  };
}
