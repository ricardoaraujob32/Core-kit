import type { Assinatura, IdAssinatura, IdLocatario, IdPlano, StatusAssinatura } from "./tipos";

export type RepositorioAssinaturas = {
  obterAtivaPorLocatario(locatarioId: IdLocatario): Promise<Assinatura | null>;
  listarPorLocatario(locatarioId: IdLocatario): Promise<Assinatura[]>;

  criar(input: {
    locatarioId: IdLocatario;
    planoId: IdPlano;
    status?: StatusAssinatura; // default ATIVA
    inicioEm?: Date;
    fimEm?: Date | null;
    renovacaoEm?: Date | null;
    motivo?: string | null;
  }): Promise<Assinatura>;

  atualizarStatus(input: {
    assinaturaId: IdAssinatura;
    status: StatusAssinatura;
    motivo?: string | null;
    fimEm?: Date | null;
    renovacaoEm?: Date | null;
  }): Promise<void>;
};
