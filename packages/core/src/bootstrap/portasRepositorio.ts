// packages/core/src/bootstrap/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel/index.js";
import type { CatalogoAutorizacaoBootstrap } from "./tipos.js";

/**
 * 
 */
export interface BootstrapAutorizacaoRepositorio {
  carregarCatalogo(): Promise<Result<CatalogoAutorizacaoBootstrap, ErroApp>>;
}
