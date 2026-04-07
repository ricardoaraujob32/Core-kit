// packages/core/src/bootstrap/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import type { CatalogoAutorizacaoBootstrap } from "./tipos";

/**
 * 
 */
export interface BootstrapAutorizacaoRepositorio {
  carregarCatalogo(): Promise<Result<CatalogoAutorizacaoBootstrap, ErroApp>>;
}
