// apps/api/src/modules/auditoria/auditoria.presenter.ts

import type { EventoAuditoriaLocatario, EventoAuditoriaPlataforma } from "@core-kit/core";

export function toAuditoriaResponseDto(evento: EventoAuditoriaLocatario | EventoAuditoriaPlataforma) {
  return {
    auditoriaId: evento.auditoriaId,
    locatarioId: "locatarioId" in evento ? evento.locatarioId : "locatarioAlvoId" in evento ? evento.locatarioAlvoId : null,
    usuarioId: evento.usuarioId,
    evento: evento.evento,
    categoria: evento.categoria,
    sucesso: evento.sucesso,
    erroCodigo: evento.erroCodigo,
    erroMensagem: evento.erroMensagem,
    entidadeNome: evento.entidadeNome,
    entidadeTipo: evento.entidadeTipo,
    entidadeId: evento.entidadeId,
    origem: evento.origem,
    requisicaoId: evento.requisicaoId,
    enderecoIp: evento.enderecoIp,
    agenteUsuario: evento.agenteUsuario,
    agenteTipo: evento.agenteTipo,
    metadados: evento.metadados,
    criadoEm: evento.criadoEm,
  };
}

export function toListarAuditoriaResponseDto(itens: Array<EventoAuditoriaLocatario | EventoAuditoriaPlataforma>) {
  return itens.map(toAuditoriaResponseDto);
}