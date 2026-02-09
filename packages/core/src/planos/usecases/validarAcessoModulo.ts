import type { Result } from "../../result";
import { ok, err } from "../../result";
import { erroApp, type ErroApp } from "../../errors";

import type { IdLocatario } from "../tipos";
import type { CodigoModulo } from "../../planos/tipos";
import type { RepositorioAssinaturas } from "../portasRepositorio";
import type { RepositorioModulosPlano, RepositorioPlanos } from "../../planos/portasRepositorio";
import { assinaturaPermiteUso } from "../regras";

const MODULOS_SEMPRE_HABILITADOS: Set<CodigoModulo> = new Set([
  "LOCATARIO",
  "AUTENTICACAO",
  "BACKUP",
]);

export async function validarAcessoModulo(
  deps: {
    assinaturasRepo: RepositorioAssinaturas;
    planosRepo: RepositorioPlanos;
    modulosPlanoRepo: RepositorioModulosPlano;
    agora: () => Date;
  },
  locatarioId: IdLocatario,
  modulo: CodigoModulo
): Promise<Result<true, ErroApp>> {
  if (MODULOS_SEMPRE_HABILITADOS.has(modulo)) return ok(true);

  const assinatura = await deps.assinaturasRepo.obterVivaPorLocatario(locatarioId);
  if (!assinatura) return err(erroApp("NAO_ENCONTRADO", "Assinatura não encontrada para o locatário."));

  // Se a assinatura não permite uso, só deixa módulos essenciais (acima)
  if (!assinaturaPermiteUso(assinatura)) {
    return err(erroApp("NAO_AUTORIZADO", "Assinatura não está ativa para uso do sistema."));
  }

  const plano = await deps.planosRepo.obterPorId(assinatura.planoId);
  if (!plano || !plano.ativo) return err(erroApp("NAO_AUTORIZADO", "Plano inválido ou inativo."));

  const modulos = await deps.modulosPlanoRepo.listarModulosDoPlano(plano.id);
  if (!modulos.includes(modulo)) {
    return err(erroApp("NAO_AUTORIZADO", "Módulo não habilitado para o plano atual."));
  }

  return ok(true);
}
