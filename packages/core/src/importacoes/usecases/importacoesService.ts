// packages/core/src/importacoes/usecases/importacoesService.ts

import { randomUUID } from "node:crypto";
import { ErroApp, IdPorta, PortaTransacao, RelogioPorta, Result, wrapOk } from "../../kernel";
import { ImportacoesRepositorio, ItensImportacaoRepositorio } from "../portasRepositorio";
import { Importacao, ItemImportacao, ListarImportacoesLocatarioInput, ListarItensImportacaoInput, MarcarImportacaoComFalhaInput, 
  MarcarImportacaoConcluidaInput, MarcarImportacaoEmExecucaoInput, MarcarItemImportacaoComFalhaInput, MarcarItemImportacaoProcessadoInput, 
  RegistrarItemImportacaoInput, SolicitarImportacaoInput, SolicitarImportacaoOutput } from "../tipos";
import { validarListarImportacoesLocatarioInput, validarListarItensImportacaoInput, validarMarcarImportacaoComFalhaInput, 
  validarMarcarImportacaoConcluidaInput, validarMarcarImportacaoEmExecucaoInput, validarMarcarItemImportacaoComFalhaInput, 
  validarMarcarItemImportacaoProcessadoInput, validarRegistrarItemImportacaoInput, validarSolicitarImportacaoInput } from "../validadores";
import { erroImportacaoNaoEncontrada, erroItemImportacaoNaoEncontrado, erroTransicaoStatusImportacaoInvalida } from "../erros";

/**
 * 
 */
export interface CriarImportacoesServiceDeps {
  importacoesRepositorio: ImportacoesRepositorio;
  itensImportacaoRepositorio: ItensImportacaoRepositorio;
  transacao?: PortaTransacao;
  agora?: RelogioPorta;
  gerarId?: IdPorta;
}

/**
 * 
 * @param deps 
 * @returns 
 */
export function criarImportacoesService(
  deps: CriarImportacoesServiceDeps,
) {
  const agora = deps.agora ?? (() => new Date());
  const gerarId = deps.gerarId ?? (() => randomUUID());

  async function executarEmTransacao<T>(fn: () => Promise<Result<T, ErroApp>>): Promise<Result<T, ErroApp>> {
    if (!deps.transacao) return fn();
    return deps.transacao.executar(fn);
  }

  async function solicitarImportacao(input: SolicitarImportacaoInput): Promise<Result<SolicitarImportacaoOutput, ErroApp>> {
    const validacao = validarSolicitarImportacaoInput(input);
    if (!validacao.ok) return validacao;

    const instante = agora();

    const criada = await deps.importacoesRepositorio.criarImportacao({
      importacaoId: gerarId(),
      locatarioId: input.locatarioId,
      criadoPorUsuarioId: input.criadoPorUsuarioId ?? null,
      tipoOrigem: input.tipoOrigem,
      referenciaOrigem: input.referenciaOrigem ?? null,
      status: "PENDENTE",
      mapeamentoColunas: input.mapeamentoColunas ?? {},
      estatisticas: {},
      mensagemErro: null,
      iniciadoEm: null,
      finalizadoEm: null,
      criadoEm: instante,
      atualizadoEm: instante,
    });

    if (!criada.ok) return criada;

    return wrapOk({ importacao: criada.value });
  }

  async function registrarItemImportacao(input: RegistrarItemImportacaoInput): Promise<Result<ItemImportacao, ErroApp>> {
    const validacao = validarRegistrarItemImportacaoInput(input);
    if (!validacao.ok) return validacao;

    const importacao = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
    if (!importacao.ok) return importacao;
    if (!importacao.value) return erroImportacaoNaoEncontrada(input.importacaoId);

    return deps.itensImportacaoRepositorio.criarItem({
      itemImportacaoId: gerarId(),
      importacaoId: input.importacaoId,
      locatarioId: input.locatarioId,
      numeroLinha: input.numeroLinha,
      dadosBrutos: input.dadosBrutos,
      status: "PENDENTE",
      detalheErro: null,
      criadoEm: agora(),
    });
  }

  async function listarImportacoesLocatario(input: ListarImportacoesLocatarioInput) {
    const validacao = validarListarImportacoesLocatarioInput(input);
    if (!validacao.ok) return validacao;
    return deps.importacoesRepositorio.listarPorLocatario(input.locatarioId);
  }

  async function listarItensImportacao(input: ListarItensImportacaoInput) {
    const validacao = validarListarItensImportacaoInput(input);
    if (!validacao.ok) return validacao;
    return deps.itensImportacaoRepositorio.listarPorImportacao(
      input.importacaoId,
      input.locatarioId,
    );
  }

  async function marcarImportacaoEmExecucao(input: MarcarImportacaoEmExecucaoInput): Promise<Result<Importacao, ErroApp>> {
    const validacao = validarMarcarImportacaoEmExecucaoInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroImportacaoNaoEncontrada(input.importacaoId);

      if (atual.value.status !== "PENDENTE") {
        return erroTransicaoStatusImportacaoInvalida(
          "importacao",
          atual.value.importacaoId,
          atual.value.status,
          "EM_EXECUCAO",
        );
      }

      return deps.importacoesRepositorio.atualizarImportacao({
        ...atual.value,
        status: "EM_EXECUCAO",
        iniciadoEm: agora(),
        atualizadoEm: agora(),
      });
    });
  }

  async function marcarImportacaoConcluida(input: MarcarImportacaoConcluidaInput): Promise<Result<Importacao, ErroApp>> {
    const validacao = validarMarcarImportacaoConcluidaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroImportacaoNaoEncontrada(input.importacaoId);

      if (atual.value.status !== "EM_EXECUCAO") {
        return erroTransicaoStatusImportacaoInvalida(
          "importacao",
          atual.value.importacaoId,
          atual.value.status,
          "CONCLUIDO",
        );
      }

      return deps.importacoesRepositorio.atualizarImportacao({
        ...atual.value,
        status: "CONCLUIDO",
        estatisticas: input.estatisticas ?? atual.value.estatisticas,
        finalizadoEm: agora(),
        atualizadoEm: agora(),
      });
    });
  }

  async function marcarImportacaoComFalha(input: MarcarImportacaoComFalhaInput): Promise<Result<Importacao, ErroApp>> {
    const validacao = validarMarcarImportacaoComFalhaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroImportacaoNaoEncontrada(input.importacaoId);

      if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
        return erroTransicaoStatusImportacaoInvalida(
          "importacao",
          atual.value.importacaoId,
          atual.value.status,
          "FALHOU",
        );
      }

      return deps.importacoesRepositorio.atualizarImportacao({
        ...atual.value,
        status: "FALHOU",
        mensagemErro: input.mensagemErro,
        finalizadoEm: agora(),
        atualizadoEm: agora(),
      });
    });
  }

  async function marcarItemImportacaoProcessado(input: MarcarItemImportacaoProcessadoInput): Promise<Result<ItemImportacao, ErroApp>> {
    const validacao = validarMarcarItemImportacaoProcessadoInput(input);
    if (!validacao.ok) return validacao;

    const atual = await deps.itensImportacaoRepositorio.buscarPorId(input.itemImportacaoId);
    if (!atual.ok) return atual;
    if (!atual.value) return erroItemImportacaoNaoEncontrado(input.itemImportacaoId);

    if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
      return erroTransicaoStatusImportacaoInvalida(
        "item_importacao",
        atual.value.itemImportacaoId,
        atual.value.status,
        "CONCLUIDO",
      );
    }

    return deps.itensImportacaoRepositorio.atualizarItem({
      ...atual.value,
      status: "CONCLUIDO",
      detalheErro: null,
    });
  }

  async function marcarItemImportacaoComFalha(input: MarcarItemImportacaoComFalhaInput): Promise<Result<ItemImportacao, ErroApp>> {
    const validacao = validarMarcarItemImportacaoComFalhaInput(input);
    if (!validacao.ok) return validacao;

    const atual = await deps.itensImportacaoRepositorio.buscarPorId(input.itemImportacaoId);
    if (!atual.ok) return atual;
    if (!atual.value) return erroItemImportacaoNaoEncontrado(input.itemImportacaoId);

    if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
      return erroTransicaoStatusImportacaoInvalida(
        "item_importacao",
        atual.value.itemImportacaoId,
        atual.value.status,
        "FALHOU",
      );
    }

    return deps.itensImportacaoRepositorio.atualizarItem({
      ...atual.value,
      status: "FALHOU",
      detalheErro: input.detalheErro,
    });
  }

  return {
    solicitarImportacao,
    registrarItemImportacao,
    listarImportacoesLocatario,
    listarItensImportacao,
    marcarImportacaoEmExecucao,
    marcarImportacaoConcluida,
    marcarImportacaoComFalha,
    marcarItemImportacaoProcessado,
    marcarItemImportacaoComFalha,
  };
}
