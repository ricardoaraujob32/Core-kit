import { LocatarioId } from "../../locatario";
import type { RepositorioAssinaturas } from "../portasRepositorio";
import type { PlanoId } from "../tipos";

export async function obterPlanoAtivoDoLocatario(repositorioAssinaturas: RepositorioAssinaturas, locatarioId: LocatarioId): Promise<PlanoId | null> {
  const assinatura = await repositorioAssinaturas.obterAtivaPorLocatario(locatarioId);
  return assinatura?.planoId ?? null;
}
