// packages/core/src/assinaturas/usecases/assinaturasService.ts

import { randomUUID } from "node:crypto";
import { PlanosConsultaRepositorio, ModulosConsultaRepositorio, AssinaturasModulosRepositorio,
  AssinaturasRepositorio } from "../portasRepositorio";
import { ErroApp, Result, wrapOk } from "../../kernel";
import { Assinatura, AtivarAssinaturaInput, CancelarAssinaturaInput, CriarAssinaturaInput, CriarAssinaturaOutput,
  DesvincularModuloDaAssinaturaInput, ListarModulosHabilitadosLocatarioInput, ListarModulosHabilitadosLocatarioOutput,
  ModuloHabilitadoLocatario, SuspenderAssinaturaInput, VincularModuloNaAssinaturaInput } from "../tipos";
import { validarAtivarAssinaturaInput, validarCancelarAssinaturaInput, validarCriarAssinaturaInput,
  validarDesvincularModuloDaAssinaturaInput, validarSuspenderAssinaturaInput,
  validarVincularModuloNaAssinaturaInput } from "../validadores";
import { erroAssinaturaJaExisteParaLocatario, erroAssinaturaNaoEncontrada, erroModuloInvalido, erroModuloJaVinculado,
  erroModuloNaoVinculado, erroPlanoInvalido, erroTransicaoStatusInvalida } from "../erros";
import { IdPorta, PortaTransacao, RelogioPorta } from "../../kernel/utils";

/**
 * 
 */
export interface CriarAssinaturasServiceDeps {
  assinaturasRepositorio: AssinaturasRepositorio;
  assinaturasModulosRepositorio: AssinaturasModulosRepositorio;
  planosConsultaRepositorio: PlanosConsultaRepositorio;
  modulosConsultaRepositorio: ModulosConsultaRepositorio;
  transacao?: PortaTransacao;
  agora?: RelogioPorta;
  gerarId?: IdPorta;
}

/**
 * 
 * @param deps 
 * @returns 
 */
export function criarAssinaturasService(deps: CriarAssinaturasServiceDeps) {
  const agora = deps.agora ?? (() => new Date());
  const gerarId = deps.gerarId ?? (() => randomUUID());

  async function executarEmTransacao<T>( fn: () => Promise<Result<T, ErroApp>> ): Promise<Result<T, ErroApp>> {
    if (!deps.transacao) return fn();
    return deps.transacao.executar(fn);
  }

  async function criarAssinatura(input: CriarAssinaturaInput): Promise<Result<CriarAssinaturaOutput, ErroApp>> {
    const validacao = validarCriarAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    const plano = await deps.planosConsultaRepositorio.validarPlanoAtivo(input.planoId);
    if (!plano.ok) return plano;
    if (!plano.value || !plano.value.ativo) return erroPlanoInvalido(input.planoId);

    const existente = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(input.locatarioId);
    if (!existente.ok) return existente;
    if (existente.value) return erroAssinaturaJaExisteParaLocatario(input.locatarioId);

    const instante = agora();
    const criada = await deps.assinaturasRepositorio.criarAssinatura({
      assinaturaId: gerarId(),
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
  }

  async function ativarAssinatura(input: AtivarAssinaturaInput): Promise<Result<Assinatura, ErroApp>> {
    const validacao = validarAtivarAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      const assinatura = atual.value;
      if (!(assinatura.status === "RASCUNHO" || assinatura.status === "SUSPENSA")) {
        return erroTransicaoStatusInvalida(
          assinatura.assinaturaId,
          assinatura.status,
          "ATIVA",
        );
      }

      const atualizada: Assinatura = {
        ...assinatura,
        status: "ATIVA",
        atualizadaEm: agora(),
      };

      return deps.assinaturasRepositorio.atualizarAssinatura(atualizada);
    });
  }

  async function suspenderAssinatura(input: SuspenderAssinaturaInput): Promise<Result<Assinatura, ErroApp>> {
    const validacao = validarSuspenderAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      if (atual.value.status !== "ATIVA") {
        return erroTransicaoStatusInvalida(
          atual.value.assinaturaId,
          atual.value.status,
          "SUSPENSA",
        );
      }

      return deps.assinaturasRepositorio.atualizarAssinatura({
        ...atual.value,
        status: "SUSPENSA",
        atualizadaEm: agora(),
      });
    });
  }

  async function cancelarAssinatura(input: CancelarAssinaturaInput): Promise<Result<Assinatura, ErroApp>> {
    const validacao = validarCancelarAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const atual = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      if (atual.value.status === "ENCERRADA" || atual.value.status === "CANCELADA") {
        return erroTransicaoStatusInvalida(
          atual.value.assinaturaId,
          atual.value.status,
          "CANCELADA",
        );
      }

      return deps.assinaturasRepositorio.atualizarAssinatura({
        ...atual.value,
        status: "CANCELADA",
        encerradaEm: input.encerradaEm ?? agora(),
        atualizadaEm: agora(),
      });
    });
  }

  async function vincularModuloNaAssinatura(input: VincularModuloNaAssinaturaInput): Promise<Result<void, ErroApp>> {
    const validacao = validarVincularModuloNaAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const assinatura = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!assinatura.ok) return assinatura;
      if (!assinatura.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

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

      const vinculo = await deps.assinaturasModulosRepositorio.vincularModulo({
        assinaturaId: input.assinaturaId,
        moduloId: input.moduloId,
        gratuito: false,
        origem: "ASSINATURA",
        habilitadoEm: agora(),
        desabilitadoEm: null,
      });

      if (!vinculo.ok) return vinculo;
      return wrapOk(undefined);
    });
  }

  async function desvincularModuloDaAssinatura(input: DesvincularModuloDaAssinaturaInput): Promise<Result<void, ErroApp>> {
    const validacao = validarDesvincularModuloDaAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const assinatura = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!assinatura.ok) return assinatura;
      if (!assinatura.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      const existente = await deps.assinaturasModulosRepositorio.buscarModuloVinculado(
        input.assinaturaId,
        input.moduloId,
      );
      if (!existente.ok) return existente;
      if (!existente.value || existente.value.desabilitadoEm !== null) {
        return erroModuloNaoVinculado(input.assinaturaId, input.moduloId);
      }

      return deps.assinaturasModulosRepositorio.desvincularModulo(
        input.assinaturaId,
        input.moduloId,
        agora(),
      );
    });
  }

  async function listarModulosHabilitadosLocatario(
    input: ListarModulosHabilitadosLocatarioInput): Promise<Result<ListarModulosHabilitadosLocatarioOutput, ErroApp>> {
    const assinaturaAtiva = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(
      input.locatarioId,
    );
    if (!assinaturaAtiva.ok) return assinaturaAtiva;

    const modulosGratis = await deps.modulosConsultaRepositorio.listarModulosGratis();
    if (!modulosGratis.ok) return modulosGratis;

    const modulos = new Map<string, ModuloHabilitadoLocatario>();

    for (const modulo of modulosGratis.value) {
      modulos.set(modulo.moduloId, {
        moduloId: modulo.moduloId,
        origem: "GRATUITO",
        gratuito: true,
      });
    }

    if (assinaturaAtiva.value && assinaturaAtiva.value.status === "ATIVA") {
      const modulosAssinatura =
        await deps.assinaturasModulosRepositorio.listarModulosAtivosDaAssinatura(
          assinaturaAtiva.value.assinaturaId,
        );
      if (!modulosAssinatura.ok) return modulosAssinatura;

      for (const modulo of modulosAssinatura.value) {
        modulos.set(modulo.moduloId, {
          moduloId: modulo.moduloId,
          origem: "ASSINATURA",
          gratuito: false,
        });
      }
    }

    return wrapOk({
      locatarioId: input.locatarioId,
      assinaturaAtiva: assinaturaAtiva.value,
      modulos: [...modulos.values()],
    });
  }

  return {
    criarAssinatura,
    ativarAssinatura,
    suspenderAssinatura,
    cancelarAssinatura,
    vincularModuloNaAssinatura,
    desvincularModuloDaAssinatura,
    listarModulosHabilitadosLocatario,
  };
}
