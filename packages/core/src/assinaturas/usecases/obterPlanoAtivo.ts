import type { RepositorioAssinaturas } from "../portasRepositorio";
import type { IdLocatario, IdPlano } from "../tipos";

export async function obterPlanoAtivoDoLocatario(
  repositorioAssinaturas: RepositorioAssinaturas,
  locatarioId: IdLocatario
): Promise<IdPlano | null> {
  const assinatura = await repositorioAssinaturas.obterAtivaPorLocatario(locatarioId);
  return assinatura?.planoId ?? null;
}
