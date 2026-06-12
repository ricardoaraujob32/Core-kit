// packages/core/src/auditoria/index.ts

export type {
  AuditoriaId, CategoriaAuditoria, EventoAuditoriaBase, EventoAuditoriaLocatario, EventoAuditoriaPlataforma, ListarAuditoriaLocatarioInput,
  FiltrosAuditoriaBase, ListarAuditoriaLocatarioOutput, ListarAuditoriaLocatarioResult, ListarAuditoriaPlataformaInput, ListarAuditoriaPlataformaOutput,
  ListarAuditoriaPlataformaResult, RegistrarEventoAuditoriaLocatarioInput, RegistrarEventoAuditoriaLocatarioOutput, RegistrarEventoAuditoriaLocatarioResult,
  RegistrarEventoAuditoriaPlataformaInput, RegistrarEventoAuditoriaPlataformaOutput, RegistrarEventoAuditoriaPlataformaResult 
} from "./tipos.js";

export type { AuditoriaLocatarioRepositorio, AuditoriaPlataformaRepositorio } from "./portasRepositorio.js";

export { createFnListarAuditoriaLocatario } from "./usecases/listarAuditoriaLocatario.js";

export { createFnRegistrarEventoAuditoriaLocatario } from "./usecases/registrarEventoAuditoriaLocatario.js";

export { createFnListarAuditoriaPlataforma } from "./usecases/listarAuditoriaPlataforma.js";

export { createFnRegistrarEventoAuditoriaPlataforma } from "./usecases/registrarEventoAuditoriaPlataforma.js";

export { EVENTOS_AUDITORIA } from "./eventos.js";

export type { MetadadosAuditoria } from "./metadados.js";
export { metaAcao, metaAtualizacao, metaCriacao, metaImpersonacao } from "./metadados.js";

export { resolverEventoAuditoria } from "./resolverEventoAuditoria.js";
