import type { Plano, IdPlano, CodigoModulo } from "./tipos";

export type RepositorioPlanos = {
  obterPorId(planoId: IdPlano): Promise<Plano | null>;
};

export type RepositorioModulosPlano = {
  listarModulosDoPlano(planoId: IdPlano): Promise<CodigoModulo[]>;
};
