import { LocatarioId } from "../locatario";
import type { Assinatura, AssinaturaId, PlanoId, StatusAssinatura } from "./tipos";

export type RepositorioAssinaturas = {
  obterAtivaPorLocatario(locatarioId: LocatarioId): Promise<Assinatura | null>;
  listarPorLocatario(locatarioId: LocatarioId): Promise<Assinatura[]>;

  criar(input: {
    locatarioId: LocatarioId;
    planoId: PlanoId;
    status?: StatusAssinatura; // default ATIVA
    inicioEm?: Date;
    fimEm?: Date | null;
    renovacaoEm?: Date | null;
    motivo?: string | null;
  }): Promise<Assinatura>;

  atualizarStatus(input: {
    assinaturaId: AssinaturaId;
    status: StatusAssinatura;
    motivo?: string | null;
    fimEm?: Date | null;
    renovacaoEm?: Date | null;
  }): Promise<void>;
};
