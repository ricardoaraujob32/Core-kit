// packages/core/src/assinaturas/usecases/listarModulosHabilitadosLocatario.ts

import { wrapOk } from "../../kernel/index.js";
import { autorizarAssinatura, PoliticaSegurancaAssinaturasPorta } from "../politicas.js";
import { AssinaturasModulosRepositorio, AssinaturasRepositorio, ModulosConsultaRepositorio } from "../portasRepositorio.js";
import { ListarModulosHabilitadosLocatarioInput, ListarModulosHabilitadosLocatarioOutput, ListarModulosHabilitadosLocatarioResult, ModuloHabilitadoLocatario } from "../tipos.js";
import { validarListarModulosHabilitadosLocatarioInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar os módulos habilitados
 * para um locatário, considerando módulos gratuitos e módulos oriundos
 * de uma assinatura ativa.
 */

/**
 * Cria a função de caso de uso para listar módulos habilitados de um locatário.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositórios de assinaturas, vínculos e consulta de módulos.
 * @returns Função de caso de uso `listarModulosHabilitadosLocatario`.
 */
export function createFnListarModulosHabilitadosLocatario(deps: {
  assinaturasRepositorio: AssinaturasRepositorio;
  assinaturasModulosRepositorio: AssinaturasModulosRepositorio;
  modulosConsultaRepositorio: ModulosConsultaRepositorio;
  politicaSeguranca?: PoliticaSegurancaAssinaturasPorta;
}) {
    /**
 * Lista os módulos habilitados de um locatário.
 *
 * Fluxo:
 * - consulta a assinatura ativa do locatário;
 * - consulta os módulos gratuitos disponíveis;
 * - incorpora módulos gratuitos ao resultado;
 * - se houver assinatura ativa, incorpora módulos vinculados à assinatura;
 * - consolida o resultado sem duplicação por `moduloId`.
 *
 * @param input Dados da consulta de módulos habilitados.
 * @returns `Ok({ locatarioId, assinaturaAtiva, modulos })` em caso de sucesso,
 * ou `Err(ErroApp)` em caso de falha.
 */
  return async function listarModulosHabilitadosLocatario(input: ListarModulosHabilitadosLocatarioInput): ListarModulosHabilitadosLocatarioResult {
    const validacao = validarListarModulosHabilitadosLocatarioInput(input);
    if (!validacao.ok) return validacao;

    const assinaturaAtiva = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(
      input.locatarioId,
    );
    if (!assinaturaAtiva.ok) return assinaturaAtiva;

    const autorizacao = await autorizarAssinatura(deps, {
      operacao: "ASSINATURA_LISTAR_MODULOS",
      locatarioId: input.locatarioId,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

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
      const modulosAssinatura = await deps.assinaturasModulosRepositorio.listarModulosAtivosDaAssinatura(
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

    return wrapOk<ListarModulosHabilitadosLocatarioOutput>({
      locatarioId: input.locatarioId,
      assinaturaAtiva: assinaturaAtiva.value,
      modulos: [...modulos.values()],
    });
  };
}
