// apps/api/src/modules/locatarios/locatarios.presenter.ts

import type { ConfiguracaoLocatario, Locatario } from "@core-kit/core";
import type { ConfiguracaoLocatarioResponseDto, LocatarioResponseDto } from "./locatarios.dto.js";

function serializarData(valor: Date | null): string | null {
  return valor ? valor.toISOString() : null;
}

export function serializarConfiguracaoLocatario(configuracao: ConfiguracaoLocatario): ConfiguracaoLocatarioResponseDto {
  return {
    locatarioId: configuracao.locatarioId,
    configuracaoId: configuracao.configuracaoId,
    modoTema: configuracao.modoTema,
    identidadeVisual: configuracao.identidadeVisual,
    corPrimaria: configuracao.corPrimaria,
    corSecundaria: configuracao.corSecundaria,
    corTerciaria: configuracao.corTerciaria,
    urlLogo: configuracao.urlLogo,
    ativa: configuracao.ativa,
    criadoEm: serializarData(configuracao.criadoEm),
    atualizadoEm: serializarData(configuracao.atualizadoEm),
  };
}

export function serializarLocatario(locatario: Locatario): LocatarioResponseDto {
  return {
    locatarioId: locatario.locatarioId,
    nome: locatario.nome,
    slug: locatario.slug,
    documento: locatario.documento,
    email: locatario.email,
    fusoHorario: locatario.fusoHorario,
    status: locatario.status,
    criadoEm: serializarData(locatario.criadoEm),
    atualizadoEm: serializarData(locatario.atualizadoEm),
    excluidoEm: serializarData(locatario.excluidoEm),
    motivoExclusao: locatario.motivoExclusao,
    suspensoEm: serializarData(locatario.suspensoEm),
    motivoSuspensao: locatario.motivoSuspensao,
    reativadoEm: serializarData(locatario.reativadoEm),
    motivoReativacao: locatario.motivoReativacao,
    configuracoes: locatario.configuracoes.map(serializarConfiguracaoLocatario),
  };
}
