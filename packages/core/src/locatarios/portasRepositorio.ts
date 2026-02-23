import type { Result } from "../result";
import type { ErroApp } from "../erros";
import type { Locatario, LocatarioId } from "./tipos";

export interface PortasRepositorioLocatarios {
  inserir(locatario: Locatario): Promise<Result<void, ErroApp>>;
  atualizar(locatario: Locatario): Promise<Result<void, ErroApp>>;

  obterPorId(id: LocatarioId): Promise<Result<Locatario | null, ErroApp>>;
  obterPorSlug(slug: string): Promise<Result<Locatario | null, ErroApp>>;

  existeSlug(slug: string): Promise<Result<boolean, ErroApp>>;
}