// packages/core/src/modulos/repositorioMemoria.ts

import { ErroApp, Result, wrapOk } from "../kernel";
import { LocatarioId } from "../locatarios";
import { erroRepositorioModulos } from "./erros";
import { ModulosHabilitadosRepositorio } from "./portasRepositorio";
import { ModuloHabilitado } from "./tipos";

/**
 * Estado em memória do repositório de módulos habilitados.
 *
 * A estrutura agrupa, por locatário, a coleção de módulos atualmente
 * reconhecidos como habilitados no contexto de teste.
 */
export type EstadoModulosHabilitadosMemoria = Record<LocatarioId, ModuloHabilitado[]>;

/**
 * Cria uma implementação em memória da porta `ModulosHabilitadosRepositorio`.
 *
 * Esta implementação é propositalmente simples e voltada a testes do domínio
 * de habilitação de módulos. O estado é mantido em um objeto indexado por
 * `locatarioId`.
 *
 * @param estadoInicial Estado inicial opcional do repositório em memória.
 * @returns Repositório compatível com a porta de módulos habilitados.
 */
export function criarModulosHabilitadosRepositorioMemoria(
  estadoInicial?: EstadoModulosHabilitadosMemoria,
): ModulosHabilitadosRepositorio {
  const estado: EstadoModulosHabilitadosMemoria = { ...(estadoInicial ?? {}) };

  return {
    async listarPorLocatario(
      locatarioId: LocatarioId,
    ): Promise<Result<ModuloHabilitado[], ErroApp>> {
      try {
        const modulos = estado[locatarioId] ?? [];

        return wrapOk(
          modulos.map((item) => ({
            codigo: item.codigo.toUpperCase(),
            origem: item.origem,
          })),
        );
      } catch (error) {
        return erroRepositorioModulos(error);
      }
    },
  };
}
