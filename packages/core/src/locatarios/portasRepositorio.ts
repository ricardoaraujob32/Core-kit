import type { Result } from "../result";
import type { ErroApp } from "../erros";
import type { Locatario } from "./tipos";

export interface LocatariosRepositorio {
  criar(params: {
    nome: string;
  }): Promise<Result<{ locatarioId: string }, ErroApp>>;

  buscarPorId(params: {
    locatarioId: string;
  }): Promise<Result<Locatario | null, ErroApp>>;

  listar(): Promise<Result<Locatario[], ErroApp>>;
}

export interface IdPorta {
  gerarId(): string;
}

export interface RelogioPorta {
  agora(): Date;
}