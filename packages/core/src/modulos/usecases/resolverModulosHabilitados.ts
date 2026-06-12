// packages/core/src/modulos/usecases/resolverModulosHabilitados.ts

import { comModulosHabilitados, wrapOk } from "../../kernel/index.js";
import type { ModulosHabilitadosRepositorio } from "../portasRepositorio.js";
import type { ListarModulosHabilitadosInput, ModuloCodigo, ModuloHabilitado, ResolverModulosHabilitadosInput, ResolverModulosHabilitadosOutput,
   ResolverModulosHabilitadosResult } from "../tipos.js";
import { validarListarModulosHabilitadosInput } from "../validadores.js";

/**
 * Enriquece o contexto com os módulos habilitados do locatário atual.
 *
 * Observação:
 * - o caso de uso não decide autorização final;
 * - ele apenas materializa a visão canônica de módulos habilitados
 *   no `ContextoExecucao` para consumo posterior.
 */
export function createFnResolverModulosHabilitados(deps: { repositorio: ModulosHabilitadosRepositorio; }) {
  const cache = new WeakMap<object, ModuloHabilitado[]>();

  /**
   * 
   */
  return async function resolverModulosHabilitados(input: ResolverModulosHabilitadosInput): ResolverModulosHabilitadosResult {
    const validado = validarListarModulosHabilitadosInput({
      locatarioId: input.ctx.locatarioId,
    } satisfies ListarModulosHabilitadosInput);
    if (!validado.ok) return validado;

    const cacheHit = cache.get(input.ctx as object);
    if (cacheHit) {
      return wrapOk<ResolverModulosHabilitadosOutput>({
        ctx: comModulosHabilitados(
          input.ctx,
          cacheHit.map((modulo) => modulo.codigo as ModuloCodigo),
        ),
        modulos: [...cacheHit],
      });
    }

    const modulosResult = await deps.repositorio.listarPorLocatario(
      validado.value.locatarioId,
    );
    if (!modulosResult.ok) return modulosResult;

    const modulos = modulosResult.value.map((modulo) => ({
      ...modulo,
      codigo: modulo.codigo.toUpperCase(),
    }));

    cache.set(input.ctx as object, modulos);

    return wrapOk<ResolverModulosHabilitadosOutput>({
      ctx: comModulosHabilitados(
        input.ctx,
        modulos.map((modulo) => modulo.codigo as ModuloCodigo),
      ),
      modulos,
    });
  };
}
