// packages/core/src/exportacoes/usecases/exportacoesService.ts

import { randomUUID } from "node:crypto";
import { ErroApp, IdPorta, PortaTransacao, RelogioPorta, Result, wrapOk } from "../../kernel";
import { ExportacoesRepositorio } from "../portasRepositorio";
import { Exportacao, ListarExportacoesLocatarioInput, ListarExportacoesLocatarioOutput, MarcarExportacaoComFalhaInput, 
  MarcarExportacaoConcluidaInput, MarcarExportacaoEmExecucaoInput, SolicitarExportacaoInput, SolicitarExportacaoOutput } from "../tipos";
import { validarListarExportacoesLocatarioInput, validarMarcarExportacaoComFalhaInput, validarMarcarExportacaoConcluidaInput, 
  validarMarcarExportacaoEmExecucaoInput, validarSolicitarExportacaoInput } from "../validadores";
import { erroExportacaoNaoEncontrada, erroTransicaoStatusExportacaoInvalida } from "../erros";

/**
 * 
 */
export interface CriarExportacoesServiceDeps {
  exportacoesRepositorio: ExportacoesRepositorio;
  transacao?: PortaTransacao;
  agora?: RelogioPorta;
  gerarId?: IdPorta;
}

/**
 * 
 * @param deps 
 * @returns 
 */
export function criarExportacoesService(deps: CriarExportacoesServiceDeps) {
  const agora = deps.agora ?? (() => new Date());
  const gerarId = deps.gerarId ?? (() => randomUUID());

  async function executarEmTransacao<T>(
    fn: () => Promise<Result<T, ErroApp>>,
  ): Promise<Result<T, ErroApp>> {
    if (!deps.transacao) return fn();
    return deps.transacao.executar(fn);
  }

  async function solicitarExportacao(input: SolicitarExportacaoInput): Promise<Result<SolicitarExportacaoOutput, ErroApp>> {
    const validacao = validarSolicitarExportacaoInput(input);
    if (!validacao.ok) return validacao;

    const instante = agora();

    const criada = await deps.exportacoesRepositorio.criarExportacao({
      exportacaoId: gerarId(),
      locatarioId: input.locatarioId,
      criadoPorUsuarioId: input.criadoPorUsuarioId ?? null,
      formato: input.formato,
      status: "PENDENTE",
      parametros: input.parametros ?? {},
      referenciaResultado: null,
      mensagemErro: null,
      criadoEm: instante,
      atualizadoEm: instante,
    });

    if (!criada.ok) return criada;

    return wrapOk({ exportacao: criada.value });
  }

  async function listarExportacoesLocatario(input: ListarExportacoesLocatarioInput): Promise<Result<ListarExportacoesLocatarioOutput, ErroApp>> {
    const validacao = validarListarExportacoesLocatarioInput(input);
    if (!validacao.ok) return validacao;

    const listagem = await deps.exportacoesRepositorio.listarPorLocatario(
      input.locatarioId,
    );
    if (!listagem.ok) return listagem;

    return wrapOk({
      locatarioId: input.locatarioId,
      exportacoes: listagem.value,
    });
  }

  async function marcarExportacaoEmExecucao(input: MarcarExportacaoEmExecucaoInput): Promise<Result<Exportacao, ErroApp>> {
    const validacao = validarMarcarExportacaoEmExecucaoInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.exportacoesRepositorio.buscarPorId(input.exportacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroExportacaoNaoEncontrada(input.exportacaoId);

      if (atual.value.status !== "PENDENTE") {
        return erroTransicaoStatusExportacaoInvalida(
          atual.value.exportacaoId,
          atual.value.status,
          "EM_EXECUCAO",
        );
      }

      return deps.exportacoesRepositorio.atualizarExportacao({
        ...atual.value,
        status: "EM_EXECUCAO",
        atualizadoEm: agora(),
      });
    });
  }

  async function marcarExportacaoConcluida(input: MarcarExportacaoConcluidaInput): Promise<Result<Exportacao, ErroApp>> {
    const validacao = validarMarcarExportacaoConcluidaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.exportacoesRepositorio.buscarPorId(input.exportacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroExportacaoNaoEncontrada(input.exportacaoId);

      if (atual.value.status !== "EM_EXECUCAO") {
        return erroTransicaoStatusExportacaoInvalida(
          atual.value.exportacaoId,
          atual.value.status,
          "CONCLUIDO",
        );
      }

      return deps.exportacoesRepositorio.atualizarExportacao({
        ...atual.value,
        status: "CONCLUIDO",
        referenciaResultado: input.referenciaResultado,
        mensagemErro: null,
        atualizadoEm: agora(),
      });
    });
  }

  async function marcarExportacaoComFalha(input: MarcarExportacaoComFalhaInput): Promise<Result<Exportacao, ErroApp>> {
    const validacao = validarMarcarExportacaoComFalhaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.exportacoesRepositorio.buscarPorId(input.exportacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroExportacaoNaoEncontrada(input.exportacaoId);

      if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
        return erroTransicaoStatusExportacaoInvalida(
          atual.value.exportacaoId,
          atual.value.status,
          "FALHOU",
        );
      }

      return deps.exportacoesRepositorio.atualizarExportacao({
        ...atual.value,
        status: "FALHOU",
        mensagemErro: input.mensagemErro,
        atualizadoEm: agora(),
      });
    });
  }

  return {
    solicitarExportacao,
    listarExportacoesLocatario,
    marcarExportacaoEmExecucao,
    marcarExportacaoConcluida,
    marcarExportacaoComFalha,
  };
}
